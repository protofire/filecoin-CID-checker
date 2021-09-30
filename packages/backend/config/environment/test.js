module.exports = {
  db: {
    dialect: 'sqlite',
    storage: ':memory', // or ':memory:'
    dialectOptions: {
      // Your sqlite3 options here
    },
  },

  logging: {
    //level: 'debug',
    //prettyPrint: true
    //   translateTime: 'yyyy-mm-dd HH:MM:ss',
    // },
  },
}
