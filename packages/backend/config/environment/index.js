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
  'HEIGHT_ALARM_ALLOW_DIFF',
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
    // For long running applications, it is often prudent to enable keepAlive with a number of milliseconds.
    // Without it, after some period of time you may start to see "connection closed" errors
    // for what seems like no reason.
    // If so, after reading this, you may decide to enable keepAlive:
    // https://mongoosejs.com/docs/connections.html#keepAlive
    keepAlive: true,
    keepAliveInitialDelay: 300000, // is the number of milliseconds to wait before initiating keepAlive on the socket.
    useNewUrlParser: true, // removes a deprecation warning when connecting
    useUnifiedTopology: true, // removes a deprecating warning when connecting
    connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
    socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
  },
}

// All configurations will extend these options
// ============================================
const all = {
  env: env.NODE_ENV,
  appVersion: env.APP_VERSION,
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
