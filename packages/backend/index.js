const app = require('./src/app')
const config = require('./config/environment')

const start = async () => {
  let server
  try {
    server = await app()
    await server.listen(config.port)
    server.log.info({ port: config.port, lotis: config.lotus.url, env: config.env },'Server started')
  } catch (error) {
    console.error('ERRRRRRR', error)
    process.exit(1)
  }
}
start()
