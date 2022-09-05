import * as dotenv from 'dotenv'

dotenv.config()

const envVarNames = [
    'SLEEP_TIPSET_CHECK_MS',
    'CID_DB_CONNECTIONSTRING',
    'CID_DB_NAME',
    'CID_LOTUS_RPCURL',
    'DEALS_PAGE_SIZE',
]

envVarNames.forEach((n) => {
    if (process.env[n] === undefined) {
        throw Error(`${n} not specified in env config`)
    }
})

// export const DB_CONNECTIONSTRING = process.env.CID_DB_CONNECTIONSTRING as string
// export const DB_NAME = process.env.CID_DB_NAME as string

/* eslint-disable */
const dbConnection = {
    uri: process.env.CID_DB_CONNECTIONSTRING,
    options: {
        dbName: process.env.CID_DB_NAME,
        useUnifiedTopology: true,
    },
} as any
/* eslint-enable */

if (process.env.NODE_ENV === 'production') {
    dbConnection.options = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        dbName: process.env.CID_DB_NAME,
        retryWrites: false,
        auth: {
            username: process.env.CID_DATABASE_USER,
            password: process.env.CID_DATABASE_PASSWORD,
        },
    }
}
// aws specific params
// if (/cid-checker/.test(dbConnection.uri)) {
//   dbConnection.options.replicaSet = 'rs0'
//   dbConnection.options.tls = true
//   if (!process.env.CID_DB_CA_FILE) {
//     throw Error(`options.tlsCAFile required from variable CID_DB_CA_FILE`)
//   }
//   dbConnection.options.tlsCAFile = process.env.CID_DB_CA_FILE
// }

export const DB_CONNECTION = dbConnection
export const LOTUS_RPCURL = process.env.CID_LOTUS_RPCURL as string

export const DEALS_PAGE_SIZE = Number.parseInt(process.env.DEALS_PAGE_SIZE as string, 10)
export const SLEEP_TIPSET_CHECK_MS = Number.parseInt(
    process.env.SLEEP_TIPSET_CHECK_MS as string,
    10,
) as number
export const START_HEIGHT = Number.parseInt(
    process.env.START_HEIGHT as string,
    10,
) as number
