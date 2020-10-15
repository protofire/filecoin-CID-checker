const envVarNames = [
  'SLEEP_TIPSET_CHECK_MS',
  'CID_DB_CONNECTIONSTRING',
  'CID_DB_NAME',
  'CID_LOTUS_RPCURL',
  'CID_LOTUS_JWT_TOKEN',
]

envVarNames.forEach((n) => {
  if (process.env[n] === undefined) {
    throw Error(`${n} not specified in env config`)
  }
})

export const DB_CONNECTIONSTRING = process.env.CID_DB_CONNECTIONSTRING as string
export const DB_NAME = process.env.CID_DB_NAME as string
export const LOTUS_RPCURL = process.env.CID_LOTUS_RPCURL as string
export const LOTUS_JWT_TOKEN = process.env.CID_LOTUS_JWT_TOKEN as string
export const SLEEP_TIPSET_CHECK_MS = Number.parseInt(
  process.env.SLEEP_TIPSET_CHECK_MS as string,
  10,
) as number
export const START_HEIGHT = Number.parseInt(
  process.env.START_HEIGHT as string,
  10,
) as number
