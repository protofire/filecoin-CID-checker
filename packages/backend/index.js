const app = require('./src/app')
const config = require('./config/environment')

const start = async () => {
  const server = await app()
  await server.listen({ host: config.ip, port: config.port }, (err) => {
    if (err) {
      console.error('error to start server', err)
      process.exit(1)
    }
    if (server.cron) {
      server.cron.startAllJobs()
    }
    server.log.info({ host: config.ip, port: config.port, lotus: config.lotus.url }, 'Server started')
  })
}
start()
