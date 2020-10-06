import { getLogger } from '../helpers/logger'
import { getTipSetKeyByHeight, getMarketDeals } from '../helpers/lotusApi'
import { getDbo } from '../helpers/db'

export const DealsProcessor = async (height: number): Promise<boolean> => {
  const logger = getLogger('debug:processors/deals')
  let success = true
  try {
    logger(`Running DealsProcessor at height: ${height}...`)

    const dbo = await getDbo()
    const writeOps: any[] = []

    const tipSetKey = await getTipSetKeyByHeight(height)
    const result = await getMarketDeals(tipSetKey)

    logger(`Deals from lotus API: ${Object.keys(result).length}`)
    Object.keys(result).forEach(function (key) {
      const deal = result[key]
      deal['DealID'] = parseInt(key)
      writeOps.push({
        replaceOne: {
          filter: { _id: parseInt(key) },
          replacement: deal,
          upsert: true,
        },
      })
    })
    await dbo.collection('deals').bulkWrite(writeOps)
  } catch (err) {
    logger(`Something failed in DealsProcessor:`)
    logger(err)
    success = false
  }
  return success
}
