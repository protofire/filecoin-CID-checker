import { SLEEP_RUNPROCESSORSDELAY_MS, START_HEIGHT } from '../config'
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
    await DealsProcessor(height)
    logger(`Running SectorsProcessor at height: ${height}...`)
    await SectorsProcessor(height)
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

  const chainHead = await getChainHead()
  const chainHeadHeight = chainHead.Height
  if (status === null) {
    // Start indexing from START_HEIGHT, otherwise just from from current
    // blockchain height
    status = START_HEIGHT
      ? { height: START_HEIGHT }
      : { height: chainHeadHeight }
  }
  logger({
    'status.height': status.height,
    'chainHead.Height': chainHeadHeight,
  })

  if (chainHeadHeight > status.height) {
    for (let i = status.height; i <= chainHeadHeight; i++) {
      await sleep(SLEEP_RUNPROCESSORSDELAY_MS)
      await runProcessors(i)
    }
  } else if (chainHeadHeight === status.height) {
    // This should only happen once
    await runProcessors(chainHeadHeight)
  }
}
