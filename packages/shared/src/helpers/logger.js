const pino = require('pino')

let logger

const createLogger = (opts) => {
  if (!logger) {
    logger = pino({
      // prettyPrint: {
      //   timestampKey: 'timestamp',
      //   translateTime: 'yyyy-mm-dd HH:MM:ss',
      // },
      ...opts,
      // AWS Cloud watch compatibility
      timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
      messageKey: 'message',
    })
  }

  return logger
}
/*
* @description
*
*   Write logs - to filesystem, STDOUT
*
* @usage
*
*   ```
*   const createLogger = require('eurst-shared/src/helpers/logger');
*   const package = require(path-to-package.json)
*
*   const logger = createLogger()

    logger.debug|info|error|fatal(string, params)
*   ```
* */

module.exports = {
  createLogger,
}
