const { googleAnalytics } = require('../../../config/environment')

class GaController {
  get(req) {
    const result = googleAnalytics ? { gaTagId: googleAnalytics.gaTagId } : { }

    return result
  }
}

module.exports = GaController
