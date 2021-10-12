const app = require('./src/app')
const config = require('./config/environment')

const start = async () => {
  let server
  try {
    server = await app()
    await server.listen(config.port, config.ip)
    server.log.info({ ip: config.ip, port: config.port, lotus: config.lotus.url }, 'Server started')
  } catch (error) {
    console.error('ERRRRRRR', error)
    process.exit(1)
  }
}
start()
