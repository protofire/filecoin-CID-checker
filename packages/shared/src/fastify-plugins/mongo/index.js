const fp = require('fastify-plugin')
const mongoose = require('mongoose')

const createModels = (path) => {
  const models = require(path)
  return models
}

const connect = async (app, dbConfig, models) => {
  const uri = `${dbConfig.uri}`

  app.log.info('Connecting mongo', { uri })

  mongoose.connection.on("connected", () => {
    app.log.info({ actor: "MongoDB", uri, name: dbConfig.options.dbName }, "connected");
  });

  mongoose.connection.on("disconnected", () => {
    app.log.error({ actor: "MongoDB" }, "disconnected");
  });

  if (dbConfig.options && dbConfig.options.tls) {
    if (!dbConfig.options.tlsCAFile) {
      throw new Error('tls=true required tlsCAFile path to cert file')
    }
  }

  await mongoose.connect(
    uri,
    {
      useNewUrlParser: true,
      keepAlive: 1,
      useUnifiedTopology: true,
      ...dbConfig.options
    }
  );
  app.addHook('onRequest', (req, res, next) => {
    req.db = { models }

    next()
  })

  app.decorate('db', { models })
}

const init = async (app, config, done) => {
  const models = await createModels(config.modelsPath)

  await connect(app, config.db, models)

  done()
}

module.exports = fp(async (fastify, config, done) => {
  await init(fastify, config, done)
})
