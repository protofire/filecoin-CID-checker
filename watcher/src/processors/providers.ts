import { getLogger } from '../helpers/logger'
import { getDbo } from '../helpers/db'
import {
  getStateMinerActiveSectors,
  getTipSetKeyByHeight,
} from '../helpers/lotusApi'

export const ProvidersProcessor = async (height: number): Promise<boolean> => {
  const logger = getLogger('debug:processors/sectors')
  let success = true
  try {
    logger(`Running ProvidersProcessor at height: ${height}...`)

    const dbo = await getDbo()

    const tipSetKey = await getTipSetKeyByHeight(height)
    const minersList = await dbo
      .collection('deals')
      .distinct('Proposal.Provider')
    logger(`Distinct providers from deals: ${minersList.length}`)

    const getSectorsPromises = minersList.map(async (minerId: string) => {
      try {
        const sectors = await getStateMinerActiveSectors(minerId, tipSetKey)
        const writeOps: any[] = []
        sectors.forEach((sector: any) => {
          writeOps.push({
            updateOne: {
              filter: { _id: sector.SealedCID },
              update: { $set: sector },
              upsert: true,
            },
          })
        })
        if (writeOps.length > 0) {
          await dbo.collection('sectors').bulkWrite(writeOps)
        }
      } catch (err) {
        logger(`Processing active sectors of miner ${minerId} faled:`)
        logger(err)
        success = false
      }
      return Promise.resolve()
    })
    await Promise.all(getSectorsPromises)
  } catch (err) {
    logger(`Something failed in ProvidersProcessor:`)
    logger(err)
    success = false
  }
  return success
}
