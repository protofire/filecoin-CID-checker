const fp = require('fastify-plugin')
const mongoose = require('mongoose')

const createModels = (path) => {
  const models = require(path)
  return models
}

const connect = async (app, dbConfig, models) => {
  app.log.info('Connecting mongo')

  mongoose.connection.on("connected", () => {
    app.log.info({ actor: "MongoDB" }, "connected");
  });

  // mongoose.connection.on("open", () => {
  //   app.log.info({ actor: "MongoDB" }, "opened");
  // });

  mongoose.connection.on("disconnected", () => {
    app.log.error({ actor: "MongoDB" }, "disconnected");
  });

  const uri = `${dbConfig.uri}${dbConfig.name}`

  await mongoose.connect(
    uri,
    {
      useNewUrlParser: true,
      keepAlive: 1,
      useUnifiedTopology: true
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
