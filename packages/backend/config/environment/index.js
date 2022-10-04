const path = require('path')

const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(`./.env`) })

const env = process.env

const envVarNames = [
  'NODE_ENV',
  'PORT',
  'CID_DB_CONNECTIONSTRING',
  'CID_DB_NAME',
  'CID_LOTUS_RPCURL',
  'HEIGHT_ALARM_ALLOW_DIFF'
]

envVarNames.forEach((n) => {
  if (process.env[n] === undefined) {
    throw Error(`${n} not specified in env config`)
  }
})

const dbOptions = {
  uri: env.CID_DB_CONNECTIONSTRING,
  options: {
    dbName: env.CID_DB_NAME,
    auth: {
      user: env.CID_DATABASE_USER,
      password: env.CID_DATABASE_PASSWORD,
    },
  },
}

// All configurations will extend these options
// ============================================
const all = {
  env: env.NODE_ENV,
  // Server port
  port: env.PORT || 3000,
  // Server IP
  ip: env.IP || '0.0.0.0',

  db: dbOptions,

  lotus: {
    url: env.CID_LOTUS_RPCURL,
    token: env.CID_LOTUS_JWT_TOKEN,
  },
  logging: {
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    messageKey: 'message',
    // level: 'debug',
    // prettyPrint: true,
    // prettyPrint: {
    //   translateTime: 'yyyy-mm-dd HH:MM:ss',
    // },
  },
  useCron: true, // use background cron-jobs, see ./src/app/cronjobs
  cronjobs: {
    heightAlarm: {
      cronString: '*/1 * * * *',
      allowDiff: env.HEIGHT_ALARM_ALLOW_DIFF,
    },
  },
}

// Export the config object based on the NODE_ENV
// ==============================================
/* eslint-disable */
const mod = require(`./${process.env.NODE_ENV}`) || {}
/* eslint-enable */

const result = { ...all, ...mod }

module.exports = result
