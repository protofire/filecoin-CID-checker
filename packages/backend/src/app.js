const fastify = require('fastify')
const swagger = require('@fastify/swagger')
const path = require('path')
const packageJson = require('../package.json')
const mongoStorage = require('../../shared/src/fastify-plugins/mongo')
const cors = require('@fastify/cors')
const fastifyCron = require('fastify-cron')

const fastifyLightDDD = require('fastify-light-ddd')
const config = require('../config/environment')
const descriptors = require('./app/descriptor')
const { unlinkSync, existsSync } = require('fs')
const cronJobs = require('./app/cron-jobs')

function build() {
  const app = fastify({ logger: config.logging })

  app.register(swagger, {
    mode: 'dynamic',
    routePrefix: '/docs',
    exposeRoute: true,
    swagger: {
      info: {
        title: `Open API for '${packageJson.description}'`,
        description: packageJson.description,
        version: packageJson.version,
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'authorization',
          in: 'header',
        },
      },
    },
    // for debug only
    // transform: schema => {
    //   console.info('schema', schema);
    //   return schema
    // }
  })

  app.register(cors, {
    // put your options here
  })

  app.register(mongoStorage, {
    db: config.db,
    modelsPath: path.resolve('../shared/src/models'),
  })

  app.register(fastifyLightDDD, descriptors)

  if (config.useCron) {
    app.register(fastifyCron, {
      jobs: cronJobs,
    })
  }

  app.addHook('onResponse', () => {
    try {
      if (existsSync('deals.csv')) {
        unlinkSync('deals.csv')
      }
    } catch (err) {
      console.error({ hookError: err })
    }
  })

  config.logger = app.log

  return app
}

module.exports = build
