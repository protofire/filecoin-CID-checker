const pager = require('filecoin-checker-shared/src/helpers/pagination')

class DealsController {
  async listWithSelector(req, reply) {
    const lotusProvider = req.services.lotus

    let selector = await lotusProvider.getStateLookupId(req.params.selector)

    if (selector.error) {
      selector.result = req.params.selector
    }
    req.query.selector = selector.result

    return this.list(req, reply)
  }

  async list(req, reply) {
    const pageOptions = pager(req.query)

    const dealProvider = req.services.deals

    try {
      const result = await dealProvider.list(req.query, req.db.models, pageOptions)

      return result
    } catch (error) {
      reply.code(500).send(error)
    }
  }

  async getStats (req, reply) {
    const dealProvider = req.services.deals

    try {
      const stats = await dealProvider.getStats({ _id: 1 }, req.db.models)

      return stats
    } catch (error) {
      reply.code(500).send(error)
    }
  }

  async getDeal (req, reply) {
    const dealProvider = req.services.deals
    const lotusProvider = req.services.lotus

    try {
      const result = await dealProvider.getDeal(req.params, req.db.models, { lotusProvider })

      return result
    } catch (error) {
      reply.code(500).send(error)
    }
  }
}

module.exports = DealsController
