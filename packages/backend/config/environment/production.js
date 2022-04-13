const env = process.env

const dbOptions = {
  uri: env.CID_DB_CONNECTIONSTRING,
  options: {
    // tls: true,
    // tlsCAFile: env.CID_DB_CA_FILE,
    dbName: env.CID_DB_NAME,
    auth: {
      user: env.CID_DATABASE_USER,
      password: env.CID_DATABASE_PASSWORD,
    },
  },
}

const result = {
  db: dbOptions,
}

module.exports = result
