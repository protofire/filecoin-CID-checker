import { getLogger } from '../helpers/logger'
import { getDbo } from '../helpers/db'
import { getStateMinerSectors } from '../helpers/lotusApi'

export const SectorsProcessor = async (): Promise<any> => {
  const logger = getLogger('debug:processors/sectors')
  const dbo = await getDbo()
  const writeOps: any[] = []

  logger('Fetching sectors from Lotus node')
  const minersList = await dbo.collection('deals').distinct('Proposal.Provider')

  for (const minerId of minersList) {
    const sectors = await getStateMinerSectors(minerId, null, null, null)
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

  await dbo.collection('sectors').bulkWrite(writeOps)
}
