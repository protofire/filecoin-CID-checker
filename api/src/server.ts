import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import bodyParser from 'body-parser'
// import dotenv from 'dotenv'
import { getLogger } from './helpers/logger'
import { ErrorStatus } from './helpers/errorStatus'
import { dealsRouter } from './routes/deals'
import * as config from './config'

const logger = getLogger('app')

export const app = express()

if (process.env.NODE_ENV !== 'test') {
  // Log env values (partially, the ones that are not secret) at strtup
  const { port } = config
  logger('Config values (partial/non-secret):')
  logger({ port })
  // Setub basic endpoint logging
  app.use(helmet())
  app.use(morgan('dev'))
}
// Setub cors & JSON body parser
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// App routes
app.use('/deals', dealsRouter)

// Catch 404 errors
app.use((req, res, next) => {
  const error = new ErrorStatus('Not found', 404)
  next(error)
})
// Catch rest of errors
app.use(
  (
    err: Error | ErrorStatus,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    res.status(err instanceof ErrorStatus && err.status ? err.status : 500)
    res.json({
      error: {
        message: err.message,
      },
    })
    next()
  },
)

// Start server (start listening only if outside tests)
if (!module.parent) {
  const { port } = config
  const server = app.listen(port)
  server.on('listening', function onListening(): void {
    logger(`Server listening on port ${port}`)
  })
  server.on('error', function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
      throw error
    }
    switch (error.code) {
      case 'EACCES':
        logger('Required elevated privileges')
        process.exit(1) // eslint-disable-next-line
      case 'EADDRINUSE':
        logger(`Port ${port} is already in use`)
        process.exit(1) // eslint-disable-next-line
      default:
        throw error
    }
  })
}
