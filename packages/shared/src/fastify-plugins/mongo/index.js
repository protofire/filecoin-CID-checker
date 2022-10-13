const fp = require('fastify-plugin')
const mongoose = require('mongoose')

const createModels = (path) => {
  const models = require(path)
  return models
}

const init = async (app, config, done) => {
  const models = await createModels(config.modelsPath)
  try {
    const uri = `${config.db.uri}`

    const securedUri = uri.replace(/(.+):(.+)@/,'***:***@')
    app.log.info('Connecting mongo', { uri: securedUri })

    mongoose.connection.on("connected", () => {
      app.log.info({ actor: "MongoDB", uri: securedUri, name: config.db.options.dbName }, "connected");
      done()
    });

    mongoose.connection.on("disconnected", () => {
      app.log.error({ actor: "MongoDB", uri: securedUri, name: config.db.options.dbName }, "disconnected");
      // done()
    });
    mongoose.connection.on("error", (err) => {
      app.log.error({ actor: "MongoDB", error: err, uri: securedUri, name: config.db.options.dbName }, "mongo error");
      // done(err)
      throw err
    });

    await mongoose.connect(
      uri,
      config.db.options
    );

    app.addHook('onRequest', (req, res, next) => {
      req.db = { models }

      next()
    })

    app.decorate('db', { models })

    app.addHook('onClose', () => {
        mongoose.connection.close()
        app.log.info('Mongodb connection closed')
      }
    )
    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        app.log.info('Mongoose default connection disconnected through app termination');
        process.exit(0);
      });
    });
    // done()
  } catch (err) {
    // done(err)
    throw err
  }
}

module.exports = fp(async (fastify, config, done) => {
  await init(fastify, config, done)
})
