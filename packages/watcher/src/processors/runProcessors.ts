import {prettyLogger} from '../helpers/logger'
import {DealsProcessor} from '../processors/deals'
import {getChainHead} from '../helpers/lotusApi'
import {getDbo} from '../helpers/db'

const NS = 'processors/runProcessorUptoChainHeadHeight'

/* eslint-disable */

export const runProcessorsWithChainHeadHeight = async (): Promise<void> => {
    let chainHead

    try {
        prettyLogger.info(`${NS} Getting chainHead`)
        const chainHead = await getChainHead()

        let height = chainHead.result.Height
        prettyLogger.info({height}, `${NS} latest height`)

        const dbo = await getDbo()
        const success = await DealsProcessor(height)
        const status = {height, success}
        const writeOps: any[] = [{insertOne: status}]
        await dbo.collection('status').bulkWrite(writeOps)
        prettyLogger.info({status}, `${NS} Added status`)
    } catch (err: any) {
        prettyLogger.error(err, `${NS} Error`)
        throw err
    }
}
/* eslint-enable */
