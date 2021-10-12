import { MongoClient, Db } from 'mongodb'
import { prettyLogger } from '../helpers/logger'
import { DB_CONNECTION } from '../config'

const NS = 'db'

let dbo: Db

export function getDbo(): Promise<Db> {
  if (dbo) return Promise.resolve(dbo)

  prettyLogger.info(
    { uri: DB_CONNECTION.uri, name: DB_CONNECTION.options.dbName },
    `${NS} Initializing DB connection...`,
  )

  return new Promise((resolve, reject) => {
    MongoClient.connect(
      DB_CONNECTION.uri,
      {
        ...DB_CONNECTION.options,
      },
      function (err, db) {
        if (err) {
          prettyLogger.error(err, `${NS} watcher DB connector error`)
          return reject(err)
        }
        dbo = db.db(DB_CONNECTION.options.dbName)

        prettyLogger.info(`${NS} DB connected`)

        return resolve(dbo)
      },
    )
  })
}
