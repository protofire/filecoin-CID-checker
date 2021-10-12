const LotusApi = require('filecoin-checker-shared/src/lotus')
const config = require('../../../config/environment')

class LotusApiClient {
  constructor() {
    const opts = {
      url: config.lotus.url,
      token: config.lotus.token,
    }
    return new LotusApi(opts) // ???
  }
}

module.exports = LotusApiClient
