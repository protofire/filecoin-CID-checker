import { getLogger } from '../helpers/logger'
import { getTipSetKeyByHeight, getMarketDeals } from '../helpers/lotusApi'
import { getDbo } from '../helpers/db'

export const DealsProcessor = async (height: number): Promise<any> => {
  const logger = getLogger('debug:processors/deals')
  const dbo = await getDbo()
  const writeOps: any[] = []

  const tipSetKey = await getTipSetKeyByHeight(height)
  const result = await getMarketDeals(tipSetKey)
  logger('Got deals from Lotus API')
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

  logger(`Will perform deals upserts: ${writeOps.length}`)
  await dbo.collection('deals').bulkWrite(writeOps)
}
