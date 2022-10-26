const commandLineArgs = require('command-line-args')
const getUsage = require('command-line-usage')
const { MongoClient } = require('mongodb')
const pino = require('pino')
const { Transform, PassThrough } = require('stream')
const AWS = require('aws-sdk')
const dotenv = require('dotenv')

dotenv.config()

const awsConfig = {
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  uploadOptions: {
    partSize: 10 * 1024 * 1024, // default in s3 client - 5mb
    queueSize: 10 // default in s3 client - 4
  }
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

function writeToS3({ Key }) {
  const Body = new PassThrough()

  const params = {
    Body,
    Key,
    Bucket: awsConfig.bucketName,
    ACL: "public-read",
    ContentType: "application/json",
  }
  const options = awsConfig.uploadOptions

  s3.upload(params, options)
    .on('httpUploadProgress', (progress) => {
      logger.info(progress, 's3 uploading progress')
    })
    .send((err, data) => {
      if (err) {
        logger.error({ err }, 'failed to upload to s3')
        Body.destroy(err)
        process.exit(1)
      } else {
        logger.info({ data }, `File uploaded and available`)
        Body.destroy()
        process.exit()
      }
    })

  return Body
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
  })
  ;['dest'].forEach((key) => {
    if (!options[key]) {
      console.error(`${key} required`)
      help()
      process.exit()
    }
  })

  if (!/\.json$/.test(options.dest)) {
    console.error(`"dest" option should be json file`)
    help()
    process.exit()
  }
  const mongouri = process.env.CID_DB_CONNECTIONSTRING
  const dbname = process.env.CID_DB_NAME
  const { dest } = options
  let { where } = options
  if (!where) {
    where = '{}'
  }

  const client = new MongoClient(mongouri, { useUnifiedTopology: true })
  try {
    await client.connect()
    const db = client.db(dbname)
    const dealsCollection = db.collection('deals')

    const query = JSON.parse(where)

    let isFirst = true
    let count = 0
    let readStream = dealsCollection.find(query).sort({ _id: 1 }).stream()

    const lengthOfData = await dealsCollection.countDocuments(query)
    if (lengthOfData === 0) {
      logger.warn({ lengthOfData }, 'End because length of data = 0')
      process.exit()
    }
    const convertToLotus = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        let str = ''
        if (isFirst) {
          logger.info('started first line')
          str = '{ "id": 1,"jsonrpc":"2.0","result":{'
          isFirst = false
        }
        count++

        const writeData = {
          [chunk._id]: {
            Proposal: chunk.Proposal,
            State: chunk.State,
          },
        }
        str = `${str},${JSON.stringify(writeData).replace(/^{/, '').replace(/}$/, '')}`

        if (count === lengthOfData) {
          str = `${str}}}`
        } else {
          str = `${str},`
        }
        callback(null, str)
      },
    })
    convertToLotus.on('finish', () => {
      logger.info('convertToLotus.end')
    })

    const pipeline = readStream
      .pipe(convertToLotus)
      .pipe(writeToS3({ Key: dest }))

    pipeline.on('error', (err) => {
      logger.error('pipeline.err', err)
      client.close()
    })
  } catch (err) {
    logger.error({ err }, 'failed to run')
    client.close()
    process.exit(1)
  }
}

run(options)
