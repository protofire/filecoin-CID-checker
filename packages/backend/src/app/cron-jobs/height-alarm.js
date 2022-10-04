const LotusApi = require('../lotus/lotus.service')
const Deals = require('../deals/deals.service')
const {
  cronjobs: { heightAlarm },
} = require('../../../config/environment')

const lotusApi = new LotusApi()
const dealsApi = new Deals()
const name = 'heightAlarm'

const onTick = async (app) => {
  app.log.info({ name }, 'APP cron started')
  try {
    const stats = await dealsApi.getStats({ _id: 1 }, app.db.models)
    const chainHead = await lotusApi.getChainHead()

    const diff = chainHead.result.Height - stats.latestHeight
    if (diff > heightAlarm.allowDiff) {
      app.log.error(
        {
          allowDiff: heightAlarm.allowDiff,
          latestHeight: stats.latestHeight,
          lotusLatestHeight: chainHead.result.Height,
          diff: chainHead.result.Height - stats.latestHeight,
        },
        'Diff too high'
      )
    }
    app.log.info({ name }, 'APP cron finished')
  } catch (err) {
    app.log.error({ name, err }, 'crontask error')
  }
}
// see fastify-cron for available options for job
module.exports = {
  cronTime: heightAlarm.cronString,
  onTick,
  start: true,
}
