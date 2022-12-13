const version = require('./version/descriptor')
const deals = require('./deals/descriptor')
const status = require('./status/descriptor')
const gaTag = require('./ga/descriptor')

const descriptor = {
  controllers: [version, deals, status, gaTag],
}

module.exports = descriptor
