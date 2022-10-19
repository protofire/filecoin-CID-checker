const commandLineArgs = require('command-line-args')
const getUsage = require('command-line-usage')
const { MongoClient } = require('mongodb')
const pino = require('pino')
const fs = require('fs')

const logger = pino({})

const optionDefinitions = [
  {
    name: 'help',
    description: 'Display this usage guide.',
    alias: 'h',
    type: Boolean,
  },
  {
    name: 'mongouri',
    description: 'Mongodb connection URI',
    alias: 'm',
    type: String,
  },
  {
    name: 'dbname',
    description: 'Mongodb name',
    alias: 'n',
    type: String,
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
      '$ node index.js {bold --mongouri} {underline `mongodb://localhost:27017`} {bold --dbname} {underline `dbname`} {bold --dest} {underline `s3bucket/filename.json`}',
      '$ node index.js {bold --mongouri} {underline `mongodb://localhost:27017`} {bold --dbname} {underline `dbname`} {bold --dest} {underline `s3bucket/filename.json`} {bold --where} {underline \\{ "Proposal.VerifiedDeal": true \\}}',
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

function getWriteStream(destination) {
  const result = fs.createWriteStream(destination, 'utf8')

  return result
}

const run = async (options) => {
  ;['mongouri', 'dbname', 'dest'].forEach((key) => {
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

  const { mongouri, dbname, dest } = options
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

    let writeStream = getWriteStream(dest)

    writeStream.on('end', () => {
      logger.info('writeStream.end')
    })
    writeStream.on('close', () => {
      logger.info('writeStream.closed')
    })

    readStream.on('error', (err) => {
      logger.error({ err }, 'readStream error')
      client.close()
    })
    readStream.on('data', (data) => {
      if (isFirst) {
        logger.info('started first line')
        writeStream.write('{ "id": 1,"jsonrpc":"2.0","result":{')
        isFirst = false
      }
      count++

      const writeData = {
        [data._id]: {
          Proposal: data.Proposal,
          State: data.State,
        },
      }
      let str = JSON.stringify(writeData).replace(/^{/, '').replace(/}$/, '')

      if (count === lengthOfData) {
        str = `${str}}}`
      } else {
        str = `${str},`
      }
      writeStream.write(str, 'utf8', () => {
        if (count === lengthOfData) {
          process.exit()
        }
      })
    })
    readStream.on('end', () => {
      logger.info({ count, lengthOfData }, 'finished')
      writeStream.emit('end')
      writeStream.emit('close')
    })
  } catch (err) {
    logger.error({ err }, 'failed to run')
    client.close()
    process.exit(1)
  }
}

run(options)
