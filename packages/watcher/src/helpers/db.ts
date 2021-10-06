import { MongoClient, Db } from 'mongodb'
import { prettyLogger } from '../helpers/logger'
import { DB_CONNECTIONSTRING, DB_NAME } from '../config'

const NS = 'db'

let dbo: Db

export function getDbo(): Promise<Db> {
  if (dbo) return Promise.resolve(dbo)

  prettyLogger.info(
    { DB_CONNECTIONSTRING, DB_NAME },
    `${NS} Initializing DB connection...`,
  )

  return new Promise((resolve, reject) => {
    MongoClient.connect(
      DB_CONNECTIONSTRING,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      function (err, db) {
        if (err) {
          prettyLogger.error(err, `${NS} watcher DB connector error`)
          return reject(err)
        }
        dbo = db.db(DB_NAME)

        prettyLogger.info(`${NS} DB connected`)

        return resolve(dbo)
      },
    )
  })
}
