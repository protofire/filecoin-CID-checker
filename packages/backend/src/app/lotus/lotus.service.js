const LotusApi = require('filecoin-checker-shared/src/lotus')
const config = require('../../../config/environment')

class LotusApiClient {
  constructor() {
    const opts = {
      url: config.lotus.url,
    }
    return new LotusApi(opts) // ???
  }
}

module.exports = LotusApiClient
