class StatusController {
  async getDiffAboutLotusAndDb(req, reply) {
    const lotusProvider = req.services.lotus
    const dealsProvider = req.services.deals

    try {
      const stats = await dealsProvider.getStats({ _id: 1 }, req.db.models)
      const chainHead = await lotusProvider.getChainHead()

      return {
        latestHeight: stats.latestHeight,
        lotusLatestHeight: chainHead.result.Height,
        diff: chainHead.result.Height - stats.latestHeight,
      }
    } catch (error) {
      reply.code(500).send(error)
    }
  }
}

module.exports = StatusController
