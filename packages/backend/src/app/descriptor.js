const version = require('./version/descriptor')
const deals = require('./deals/descriptor')
const status = require('./status/descriptor')

const descriptor = {
  controllers: [version, deals, status],
}

module.exports = descriptor
