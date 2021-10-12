const packageInfo = require('../../../package.json')

class VersionService {
  get() {
    return { version: packageInfo.version }
  }
}

module.exports = VersionService
