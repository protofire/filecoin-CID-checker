import {prettyLogger} from '../helpers/logger'
import {getTipSetKeyByHeight, getMarketDeals} from '../helpers/lotusApi'
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

        const tipSetKey = await getTipSetKeyByHeight(height)
        prettyLogger.info(
            {tipSetKey},
            `${NS} tipSetKey got`,
        )

        const records: any = await getMarketDeals(tipSetKey)
        const total = Object.keys(records).length

        prettyLogger.info(
            `${NS} Deals from lotus API: ${total}`,
        )
        console.info('DEALS_PAGE_SIZE < total', (DEALS_PAGE_SIZE < total))
        console.info('DEALS_PAGE_SIZE, total', DEALS_PAGE_SIZE,total)

        let pages = DEALS_PAGE_SIZE > total ? 1 : total / DEALS_PAGE_SIZE
        const ddd = DEALS_PAGE_SIZE > total ? 0 : total % DEALS_PAGE_SIZE
        console.info('pages1', pages)
        if (ddd >= 1) {
            pages++
        }
        console.info('pages2', pages)
        // TODO (plcgi1) add support for paging save records to DB
        Object.keys(records).forEach(function (key: any) {
            const DealID = parseInt(key, 10)
            const deal = records[key]
            deal.DealID = DealID
            writeOps.push({
                replaceOne: {
                    filter: {_id: deal.DealID},
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
