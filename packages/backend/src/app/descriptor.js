const version = require('./version/descriptor')
const deals = require('./deals/descriptor')

const descriptor = {
  controllers: [version, deals],
}

module.exports = descriptor
