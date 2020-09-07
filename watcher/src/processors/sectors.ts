import { getLogger } from '../helpers/logger'
import { getDbo } from '../helpers/db'
import { getStateMinerSectors, getTipSetKeyByHeight } from '../helpers/lotusApi'

export const SectorsProcessor = async (height: number): Promise<any> => {
  const logger = getLogger('debug:processors/sectors')
  const dbo = await getDbo()
  const writeOps: any[] = []

  const tipSetKey = await getTipSetKeyByHeight(height)
  const minersList = await dbo.collection('deals').distinct('Proposal.Provider')
  logger(`About to process miners: ${minersList.length}`)

  for (const minerId of minersList) {
    logger(`Retrieving sectors of miner: ${minerId} (height: ${height})`)
    const sectors = await getStateMinerSectors(minerId, null, null, tipSetKey)
    logger('Got sectors from Lotus API')
    sectors.forEach((sector: any) => {
      // Store SealedCID structure as a string (not as an object)
      sector.Info['SealedCID'] = sector.Info['SealedCID']['/']
      writeOps.push({
        updateOne: {
          filter: { _id: sector.ID },
          update: { $set: { Info: sector.Info } },
          upsert: true,
        },
      })
    })
  }

  logger(`Will sector upserts: ${writeOps.length}`)
  await dbo.collection('sectors').bulkWrite(writeOps)
}
