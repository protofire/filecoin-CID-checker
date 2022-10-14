const packageInfo = require('../../../package.json')
const { env, appVersion } = require('../../../config/environment')
class VersionService {
  get() {
    return { version: packageInfo.version, appVersion: appVersion || env }
  }
}

module.exports = VersionService
