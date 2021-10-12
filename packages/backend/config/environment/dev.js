module.exports = {
  logging: {
    level: 'debug',
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    messageKey: 'message',
  },
}
