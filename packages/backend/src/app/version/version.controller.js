class VersionController {
  get(req) {
    const result = req.services.version.get(req)

    return result
  }
}

module.exports = VersionController
