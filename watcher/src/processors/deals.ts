import { getLogger } from '../helpers/logger'
import { getMarketDeals } from '../helpers/lotusApi'
import { getDbo } from '../helpers/db'

export const DealsProcessor = async (): Promise<any> => {
  const logger = getLogger('debug:processors/deals')
  const dbo = await getDbo()
  const writeOps: any[] = []

  const result = await getMarketDeals()
  logger(result)
  Object.keys(result).forEach(function (key) {
    const deal = result[key]
    deal['DealID'] = parseInt(key)
    deal['Proposal']['PieceCID'] = deal['Proposal']['PieceCID']['/']

    writeOps.push({
      replaceOne: {
        filter: { _id: parseInt(key) },
        replacement: deal,
        upsert: true,
      },
    })
  })

  await dbo.collection('deals').bulkWrite(writeOps)
}
