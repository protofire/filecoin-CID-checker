const commandLineArgs = require('command-line-args')
const getUsage = require('command-line-usage')
const { MongoClient } = require('mongodb')
const pino = require('pino')
const { Transform, PassThrough } = require('stream')
const AWS = require('aws-sdk')
const dotenv = require('dotenv')
const path = require('path')
const { ZSTDCompress } = require('simple-zstd')

dotenv.config()

const CONTENT_TYPE = {
  JSON: 'application/json',
  ZSTD: 'application/zstd'
}

const awsConfig = {
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  uploadOptions: {
    partSize: 10 * 1024 * 1024, // default in s3 client - 5mb
    queueSize: 10, // default in s3 client - 4
  },
}

const logger = pino({})

const optionDefinitions = [
  {
    name: 'help',
    description: 'Display this usage guide.',
    alias: 'h',
    type: Boolean,
  },
  {
    name: 'dest',
    description: 'Destination path (path to file, to s3bucket etc).File should has .json extension',
    alias: 'd',
    type: String,
  },
  {
    name: 'where',
    description: `Where for mongodb search - correct json string, default: '\\{\\}'`,
    alias: 'w',
    type: String,
  },
]

const sections = [
  {
    header: 'Synopsis',
    content: [
      '$ node index.js {bold --dest} {underline `filename.json`}',
      '$ node index.js {bold --dest} {underline `filename.json`} {bold --where} {underline \\{ "Proposal.VerifiedDeal": true \\}}',
      '$ node index.js {bold --help}',
    ],
  },
  {
    header: 'Options',
    optionList: optionDefinitions,
  },
]

const options = commandLineArgs(optionDefinitions)

const help = () => {
  console.log(getUsage(sections))
  process.exit()
}

options.help && help()

const s3 = new AWS.S3({
  apiVersion: '2012-10-17',
})

function writeToS3({ Key, ContentType }) {
  const stream = new PassThrough()

  const params = {
    Body: stream,
    Key,
    Bucket: awsConfig.bucketName,
    ACL: 'public-read',
    ContentType,
  }
  const options = awsConfig.uploadOptions
  s3.upload(params, options)
    .on('httpUploadProgress', (progress) => {
      logger.info(progress, 's3 uploading progress')
    })
    .send((err, data) => {
      if (err) {
        stream.emit('error', err);
      } else {
        stream.emit('uploaded', data);
      }
      stream.destroy()
    })

  return stream
}

class DealsTransform extends Transform {
  constructor(options) {
    super(options);
    logger.info('convertToLotus.start')
  }
}

const run = async (options) => {
  [
    'AWS_S3_BUCKET_NAME',
    'CID_DB_CONNECTIONSTRING',
    'CID_DB_NAME'
  ].forEach(key => {
    if (!process.env[key]) {
      console.error(`Environment variable ${key} required.Set it as ${key}=<your value>`)
      help()
      process.exit()
    }
  });
  
  ['dest'].forEach((key) => {
    if (!options[key]) {
      console.error(`${key} required`)
      help()
      process.exit()
    }
  })
  
  const { dest: _dest, where } = options
  // get filename without extension
  const dest = path.parse(_dest).name;
  
  const mongouri = process.env.CID_DB_CONNECTIONSTRING
  const dbname = process.env.CID_DB_NAME
  const client = new MongoClient(mongouri, { useUnifiedTopology: true })
  
  const onlyCompressed = process.env.ONLY_COMPRESSED || false

  try {
    await client.connect()
    const db = client.db(dbname)
    const dealsCollection = db.collection('deals')

    const query = JSON.parse(where || '{}')
    
    let count = 0
    const convertToLotus = new DealsTransform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        count++
        const data = JSON.stringify({
          [chunk._id]: {
            Proposal: chunk.Proposal,
            State: chunk.State,
          },
        })
        const dataTrimmed = data.substring(1, data.length - 1)
        callback(null, count > 1 ? `,${dataTrimmed}` : `{${dataTrimmed}` )
      },
      flush(callback) {
        if (count === 0) {
          callback(null, '{}')
        } else {
          callback(null, '}')
        }
      }
    })
    convertToLotus.on('finish', () => {
      logger.info({ dealsProcessed: count }, 'convertToLotus.end')
    })
    
    const promises = []
  
    const readableStream = dealsCollection
      .find(query)
      .sort({ _id: 1 })
      .stream()
      .pipe(convertToLotus)
  
    const pipelineZST = readableStream
      .pipe(ZSTDCompress(17, {}, {}, ['--long', '-T0']))
      .pipe(writeToS3({ Key: `${dest}.json.zst`, ContentType: CONTENT_TYPE.ZSTD }))
    promises.push(new Promise((resolve) => {
      pipelineZST.on('error', (err) => {
        logger.error({ err }, 'pipelineZST.err')
        resolve()
      })
      pipelineZST.on('uploaded', (data) => {
        logger.info({ data }, 'File uploaded and available')
        resolve()
      })
    }))
    
    if (!onlyCompressed) {
      const pipelineJSON = readableStream
        .pipe(writeToS3({ Key: `${dest}.json`, ContentType: CONTENT_TYPE.JSON }))
      promises.push(new Promise((resolve) => {
        pipelineJSON.on('error', (err) => {
          logger.error({ err }, 'pipeline.err')
          resolve()
        })
        pipelineJSON.on('uploaded', (data) => {
          logger.info({ data }, 'File uploaded and available')
          resolve()
        })
      }))
    }
    
    await Promise.all(promises)
    await client.close()
  } catch (err) {
    logger.error({ err }, 'failed to run')
    await client.close()
    process.exit(1)
  }
}

run(options)
