const fp = require('fastify-plugin')
const mongoose = require('mongoose')

const createModels = (path) => {
  const models = require(path)
  return models
}

const init = async (app, config, done) => {
  const models = await createModels(config.modelsPath)
  try {
    // await connect(app, config.db, models, done)
    const uri = `${config.db.uri}`

    const securedUri = uri.replace(/(.+):(.+)@/,'***:***@')
    app.log.info('Connecting mongo', { uri: securedUri })

    mongoose.connection.on("connected", () => {
      app.log.info({ actor: "MongoDB", uri: securedUri, name: config.db.options.dbName }, "connected");
      done()
    });

    mongoose.connection.on("disconnected", () => {
      app.log.error({ actor: "MongoDB" }, "disconnected");
      done()
    });
    mongoose.connection.on("error", (err) => {
      app.log.error({ actor: "MongoDB", error: err }, "mongo error");
      done(err)
    });
    // if (dbConfig.options && dbConfig.options.tls) {
    //   if (!dbConfig.options.tlsCAFile) {
    //     throw new Error('tls=true required tlsCAFile path to cert file')
    //   }
    // }
    await mongoose.connect(
      uri,
      {
        useNewUrlParser: true,
        keepAlive: 1,
        useUnifiedTopology: true,
        ...config.db.options
      }
    );

    app.addHook('onRequest', (req, res, next) => {
      req.db = { models }

      next()
    })

    app.decorate('db', { models })
    done()
  } catch (err) {
    done(err)
  }
}

module.exports = fp(async (fastify, config, done) => {
  await init(fastify, config, done)
})
