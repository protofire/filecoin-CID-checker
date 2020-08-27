import { SLEEP_RUNPROCESSORSDELAY_MS } from '../config'
import { getLogger } from '../helpers/logger'
import { sleep } from '../helpers/sleep'
import { DealsProcessor } from '../processors/deals'
import { SectorsProcessor } from '../processors/sectors'
import { MinersProcessor } from '../processors/miners'
import { getChainHead } from '../helpers/lotusApi'
import { getDbo } from '../helpers/db'

export const runProcessors = async (height: number): Promise<any> => {
  const logger = getLogger('processors/runProcessors')
  try {
    logger(`Running DealsProcessor at height: ${height}...`)
    await DealsProcessor()
    logger(`Running SectorsProcessor at height: ${height}...`)
    await SectorsProcessor()
    logger(`Running MinersProcessor at height: ${height}...`)
    await MinersProcessor(height)

    const dbo = await getDbo()
    const writeOps: any[] = [
      {
        updateOne: {
          filter: {
            // Extremely horrible code, but the collection will
            // only have one element
            height: { $exists: true },
          },
          update: { $set: { height } },
          upsert: true,
        },
      },
    ]
    logger(`Update DB status.height with: ${height}...`)
    await dbo.collection('status').bulkWrite(writeOps)
  } catch (err) {
    logger(`Could not complete processors run at height: ${height}`)
    throw err
  }
}

export const runProcessorsUptoChainHeadHeight = async (): Promise<any> => {
  const logger = getLogger('processors/runProcessorUptoChainHeadHeight')
  const dbo = await getDbo()
  let status = await dbo
    .collection('status')
    .findOne({ height: { $exists: true } })
  status = status === null ? { height: 1 } : status

  const chainHead = await getChainHead()
  const chainHeadHeight = chainHead.Height
  logger({
    'status.height': status.height,
    'chainHead.Height': chainHeadHeight,
  })

  if (chainHeadHeight > status.height) {
    for (let i = status.height; i <= chainHeadHeight; i++) {
      await sleep(SLEEP_RUNPROCESSORSDELAY_MS)
      await runProcessors(i)
    }
  }
}
