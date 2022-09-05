import {prettyLogger} from '../helpers/logger'
import {getMarketDeals} from '../helpers/lotusApi'
import {getDbo} from '../helpers/db'
import {DEALS_PAGE_SIZE} from '../config'

const NS = 'processors/runProcessorUptoChainHeadHeight'
/* eslint-disable */
export const DealsProcessor = async (height: number): Promise<boolean> => {
    let success = true
    try {
        prettyLogger.info(`${NS} Running DealsProcessor at height: ${height}...`)

        const dbo = await getDbo()
        const writeOps: any[] = []

        const records: any = await getMarketDeals()
        const dealIds = Object.keys(records)
        const total = dealIds.length

        let pages = DEALS_PAGE_SIZE > total ? 1 : total / DEALS_PAGE_SIZE
        const ddd = DEALS_PAGE_SIZE > total ? 0 : total % DEALS_PAGE_SIZE
        if (ddd >= 1) {
            pages++
        }
        pages = parseInt(`${pages}`, 10)

        prettyLogger.info(
            `${NS} Deals from lotus API: total:${total} pages:${pages}`,
        )
        for (let page = 1; page < pages; page++) {
            const chunks = dealIds.slice(page, page + DEALS_PAGE_SIZE)
            for (const dealId of chunks) {
                const DealID = parseInt(dealId, 10)
                const deal = records[dealId]
                deal.DealID = DealID
                writeOps.push({
                    replaceOne: {
                        filter: {_id: deal.DealID},
                        replacement: deal,
                        upsert: true,
                    },
                })
            }
            await dbo.collection('deals').bulkWrite(writeOps)
            prettyLogger.info(
                `${NS} Deal stored on page ${page}`,
            )
        }

        const stats: any = {}

        let queryResults: any = await dbo
            .collection('deals')
            .aggregate(
                [
                    {
                        $match: {
                            'Proposal.EndEpoch': {$gte: height},
                            'State.SectorStartEpoch': {$gt: -1},
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
                            count: {$sum: 1},
                        },
                    },
                ],
                {allowDiskUse: true},
            )
            .toArray()
        stats['numberOfUniqueClients'] = queryResults[0].count

        queryResults = await dbo
            .collection('deals')
            .aggregate(
                [
                    {
                        $match: {
                            'Proposal.EndEpoch': {$gte: height},
                            'State.SectorStartEpoch': {$gt: -1},
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
                            count: {$sum: 1},
                        },
                    },
                ],
                {allowDiskUse: true},
            )
            .toArray()
        stats['numberOfUniqueProviders'] = queryResults[0].count

        queryResults = await dbo
            .collection('deals')
            .aggregate(
                [
                    {
                        $match: {
                            'Proposal.EndEpoch': {$gte: height},
                            'State.SectorStartEpoch': {$gt: -1},
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
                            count: {$sum: 1},
                        },
                    },
                ],
                {allowDiskUse: true},
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
                            'Proposal.EndEpoch': {$gte: height},
                            'State.SectorStartEpoch': {$gt: -1},
                        },
                    },
                    {
                        $group: {
                            _id: 1,
                            count: {$sum: '$Proposal.PieceSize'},
                        },
                    },
                ],
                {allowDiskUse: true},
            )
            .toArray()
        stats['totalDealSize'] = queryResults[0].count

        queryResults = await dbo
            .collection('deals')
            .aggregate(
                [
                    {
                        $match: {
                            'Proposal.EndEpoch': {$gte: height},
                            'State.SectorStartEpoch': {$gt: -1},
                        },
                    },
                    {
                        $group: {
                            _id: 1,
                            count: {$sum: 1},
                        },
                    },
                ],
                {allowDiskUse: true},
            )
            .toArray()
        stats['totalDeals'] = queryResults[0].count

        prettyLogger.info(stats, `${NS} Stats`)

        await dbo.collection('stats').bulkWrite([
            {
                replaceOne: {
                    filter: {_id: 1},
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
