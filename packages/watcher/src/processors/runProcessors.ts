import { prettyLogger } from '../helpers/logger'
import { DealsProcessor } from '../processors/deals'
import { getChainHead } from '../helpers/lotusApi'
import { getDbo } from '../helpers/db'

const NS = 'processors/runProcessorUptoChainHeadHeight'

export const runProcessorsWithChainHeadHeight = async (): Promise<void> => {
  let chainHead
  try {
    chainHead = await getChainHead()
  } catch (err: any) {
      prettyLogger.error(err, `${NS} error`)
    throw new Error('Could not get chain head')
  }

  const height = chainHead.Height
  try {
    const success = await DealsProcessor(height)
    const status = { height, success }
    const dbo = await getDbo()
    const writeOps: any[] = [{ insertOne: status }]
    await dbo.collection('status').bulkWrite(writeOps)
    prettyLogger.info({ status }, `${NS} Added status`)
  } catch (err: any) {
    prettyLogger.error(err, `${NS} Error`)
    throw err
  }
}
