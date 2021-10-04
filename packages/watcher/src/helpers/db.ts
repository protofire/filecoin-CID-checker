import { MongoClient, Db } from 'mongodb'
import { getLogger } from '../helpers/logger'
import { DB_CONNECTIONSTRING, DB_NAME } from '../config'

const logger = getLogger('helpers/db')

let dbo: Db

export function getDbo(): Promise<Db> {
  if (dbo) return Promise.resolve(dbo)

  logger('Initializing DB connection...', { DB_CONNECTIONSTRING, DB_NAME })
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      DB_CONNECTIONSTRING,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      function (err, db) {
        if (err) {
          logger('watcher DB connector error:')
          logger(err)
          return reject(err)
        }
        dbo = db.db(DB_NAME)

        logger('DB connected')

        return resolve(dbo)
      },
    )
  })
}
