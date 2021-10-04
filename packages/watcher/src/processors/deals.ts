import { getLogger } from '../helpers/logger'
import { getTipSetKeyByHeight, getMarketDeals } from '../helpers/lotusApi'
import { getDbo } from '../helpers/db'

export const DealsProcessor = async (height: number): Promise<boolean> => {
  const logger = getLogger('processors/runProcessorUptoChainHeadHeight')
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

    const stats: any = {};

    let queryResults: any = await dbo
      .collection('deals')
      .aggregate([
        {
          $match: {
            "Proposal.EndEpoch": { $gte: height },
            "State.SectorStartEpoch": { $gt: -1 }
          }
        },
        {
          $group: {
            _id: "$Proposal.Client"
          }
        },
        {
          $group: {
            _id: 1,
            count: { $sum: 1 }
          }
        },
      ], { allowDiskUse: true }).toArray();
    stats['numberOfUniqueClients'] = queryResults[0].count;

    queryResults = await dbo
      .collection('deals')
      .aggregate([
        {
          $match: {
            "Proposal.EndEpoch": { $gte: height },
            "State.SectorStartEpoch": { $gt: -1 }
          }
        },
        {
          $group: {
            _id: "$Proposal.Provider"
          }
        },
        {
          $group: {
            _id: 1,
            count: { $sum: 1 }
          }
        },
      ], { allowDiskUse: true }).toArray();
    stats['numberOfUniqueProviders'] = queryResults[0].count;

    queryResults = await dbo
      .collection('deals')
      .aggregate([
        {
          $match: {
            "Proposal.EndEpoch": { $gte: height },
            "State.SectorStartEpoch": { $gt: -1 }
          }
        },
        {
          $group: {
            _id: "$Proposal.PieceCID"
          }
        },
        {
          $group: {
            _id: 1,
            count: { $sum: 1 }
          }
        },
      ], { allowDiskUse: true }).toArray();
    stats['numberOfUniqueCIDs'] = queryResults[0].count;
    stats.latestHeight = height

    queryResults = await dbo
      .collection('deals')
      .aggregate([
        {
          $match: {
            "Proposal.EndEpoch": { $gte: height },
            "State.SectorStartEpoch": { $gt: -1 }
          }
        },
        {
          $group: {
            _id: 1,
            count: { $sum: "$Proposal.PieceSize" }
          }
        },
      ], { allowDiskUse: true }).toArray();
    stats['totalDealSize'] = queryResults[0].count;

    queryResults = await dbo
      .collection('deals')
      .aggregate([
        {
          $match: {
            "Proposal.EndEpoch": { $gte: height },
            "State.SectorStartEpoch": { $gt: -1 }
          }
        },
        {
          $group: {
            _id: 1,
            count: { $sum: 1 }
          }
        },
      ], { allowDiskUse: true }).toArray();
    stats['totalDeals'] = queryResults[0].count;

    logger(stats);
    await dbo.collection('stats').bulkWrite([{
      replaceOne: {
        filter: { _id: 1 },
        replacement: stats,
        upsert: true,
      }
    }]);

  } catch (err) {
    logger(`Something failed in DealsProcessor:`)
    logger(err)
    success = false
  }
  return success
}
