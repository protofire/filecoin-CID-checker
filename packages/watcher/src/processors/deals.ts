import { prettyLogger } from '../helpers/logger'
import { getTipSetKeyByHeight, getMarketDeals } from '../helpers/lotusApi'
import { getDbo } from '../helpers/db'

const NS = 'processors/runProcessorUptoChainHeadHeight'
/* eslint-disable */
export const DealsProcessor = async (height: number): Promise<boolean> => {
  let success = true
  try {
    prettyLogger.info(`${NS} Running DealsProcessor at height: ${height}...`)

    const dbo = await getDbo()
    const writeOps: any[] = []

    const tipSetKey = await getTipSetKeyByHeight(height)
    prettyLogger.info(
       { tipSetKey },
      `${NS} tipSetKey got`,
    )

    const result = await getMarketDeals(tipSetKey)

    prettyLogger.info(
      `${NS} Deals from lotus API: ${Object.keys(result).length}`,
    )

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

    const stats: any = {}

    let queryResults: any = await dbo
      .collection('deals')
      .aggregate(
        [
          {
            $match: {
              'Proposal.EndEpoch': { $gte: height },
              'State.SectorStartEpoch': { $gt: -1 },
            },
          },
          {
            $group: {
              _id: '$Proposal.Client',
            },
          },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            },
          },
        ],
        { allowDiskUse: true },
      )
      .toArray()
    stats['numberOfUniqueClients'] = queryResults[0].count

    queryResults = await dbo
      .collection('deals')
      .aggregate(
        [
          {
            $match: {
              'Proposal.EndEpoch': { $gte: height },
              'State.SectorStartEpoch': { $gt: -1 },
            },
          },
          {
            $group: {
              _id: '$Proposal.Provider',
            },
          },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            },
          },
        ],
        { allowDiskUse: true },
      )
      .toArray()
    stats['numberOfUniqueProviders'] = queryResults[0].count

    queryResults = await dbo
      .collection('deals')
      .aggregate(
        [
          {
            $match: {
              'Proposal.EndEpoch': { $gte: height },
              'State.SectorStartEpoch': { $gt: -1 },
            },
          },
          {
            $group: {
              _id: '$Proposal.PieceCID',
            },
          },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            },
          },
        ],
        { allowDiskUse: true },
      )
      .toArray()
    stats['numberOfUniqueCIDs'] = queryResults[0].count
    stats.latestHeight = height

    queryResults = await dbo
      .collection('deals')
      .aggregate(
        [
          {
            $match: {
              'Proposal.EndEpoch': { $gte: height },
              'State.SectorStartEpoch': { $gt: -1 },
            },
          },
          {
            $group: {
              _id: 1,
              count: { $sum: '$Proposal.PieceSize' },
            },
          },
        ],
        { allowDiskUse: true },
      )
      .toArray()
    stats['totalDealSize'] = queryResults[0].count

    queryResults = await dbo
      .collection('deals')
      .aggregate(
        [
          {
            $match: {
              'Proposal.EndEpoch': { $gte: height },
              'State.SectorStartEpoch': { $gt: -1 },
            },
          },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            },
          },
        ],
        { allowDiskUse: true },
      )
      .toArray()
    stats['totalDeals'] = queryResults[0].count

    prettyLogger.info(stats, `${NS} Stats`)

    await dbo.collection('stats').bulkWrite([
      {
        replaceOne: {
          filter: { _id: 1 },
          replacement: stats,
          upsert: true,
        },
      },
    ])
  } catch (err: any) {
    prettyLogger.error(err, `${NS} Error`)
    success = false
  }
  return success
}
/* eslint-enable */
