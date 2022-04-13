const env = process.env

module.exports = {
  db: {
    uri: env.CID_DB_CONNECTIONSTRING,
    options: {
      dbName: env.CID_DB_NAME,
    },
  },
  logging: {
    level: 'debug',
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    messageKey: 'message',
  },
}
