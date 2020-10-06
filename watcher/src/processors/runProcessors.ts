import { getLogger } from '../helpers/logger'
import { DealsProcessor } from '../processors/deals'
import { ProvidersProcessor } from '../processors/providers'
import { getChainHead } from '../helpers/lotusApi'
import { getDbo } from '../helpers/db'

export const runProcessorsWithChainHeadHeight = async (): Promise<any> => {
  const logger = getLogger('processors/runProcessorUptoChainHeadHeight')

  let chainHead
  try {
    chainHead = await getChainHead()
  } catch (err) {
    throw new Error('Could not get chain head')
  }

  const height = chainHead.Height
  try {
    const dpSuccess = await DealsProcessor(height)
    const ppSuccess = await ProvidersProcessor(height)
    const status = {
      height,
      success: dpSuccess && ppSuccess,
    }
    const dbo = await getDbo()
    const writeOps: any[] = [{ insertOne: status }]
    await dbo.collection('status').bulkWrite(writeOps)
    logger(`Added status entry:`)
    logger(status)
  } catch (err) {
    logger(`Could not complete processors run at height: ${height}`)
    throw err
  }
}
