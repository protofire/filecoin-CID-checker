const path = require('path')

const env = process.env.NODE_ENV || 'dev'

const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(`./.env`) })

// TODO resolve me
//import * as logger from '../../../shared/src/helpers/logger'

//const { createLogger } = logger

const dbOptions = {
  uri: process.env.CID_DB_CONNECTIONSTRING,
  name: process.env.CID_DB_NAME,
}

// All configurations will extend these options
// ============================================
const all = {
  env,
  // Server port
  port: process.env.PORT || 4343,
  // Server IP
  ip: process.env.IP || '0.0.0.0',

  db: dbOptions,

  lotus: {
    url: process.env.CID_LOTUS_RPCURL,
    token: process.env.CID_LOTUS_JWT_TOKEN,
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
}

// Export the config object based on the NODE_ENV
// ==============================================
/* eslint-disable */
const mod = require(`./${process.env.NODE_ENV}`) || {}
/* eslint-enable */

const result = { ...all, ...mod }

// logger related code
//const createLoggerOpts = { ...result.logging, env: result.env }

//result.logger = createLogger(createLoggerOpts)

module.exports = result
