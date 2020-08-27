import { getLogger } from '../helpers/logger'
import { getDbo } from '../helpers/db'
import {
  getTipSetKeyByHeight,
  getMinerSectorFaultsByTipSetKey,
  getMinerSectorRecoveriesByTipSetKey,
} from '../helpers/lotusApi'

const updateBoolField = async (filter: any, field: string, value: any) => {
  const $set: any = {}
  $set[field] = value
  const dbo = await getDbo()
  await dbo.collection('sectors').updateMany(filter, { $set: $set })
}

const setSectors = async (sectors: any[], field: string) => {
  if (sectors.length > 0) {
    await updateBoolField({ _id: { $in: sectors } }, field, true)
    await updateBoolField({ _id: { $nin: sectors } }, field, false)
  } else {
    await updateBoolField({}, field, false)
  }
}

export const MinersProcessor = async (height: number): Promise<any> => {
  const logger = getLogger('debug:processors/miners')
  const dbo = await getDbo()
  const tipSetKey = await getTipSetKeyByHeight(height)

  logger('Fetching miners from Lotus node')
  const minersList = await dbo.collection('deals').distinct('Proposal.Provider')

  // For all the known miners, get the fault/recoveries sectors and set
  // their fault (or recovery) state in the DB
  let allFaults = [],
    allRecoveries = []
  for (const minerId of minersList) {
    const minerFaults = await getMinerSectorFaultsByTipSetKey(
      minerId,
      tipSetKey,
    )
    const minerRecoveries = await getMinerSectorRecoveriesByTipSetKey(
      minerId,
      tipSetKey,
    )
    allFaults.push(...minerFaults)
    allRecoveries.push(...minerRecoveries)
  }

  allFaults.sort((a, b) => a - b)
  allRecoveries.sort((a, b) => a - b)

  function onlyUnique(value: any, index: number, self: any) {
    return self.indexOf(value) === index
  }
  allFaults = allFaults.filter(onlyUnique)
  allRecoveries = allRecoveries.filter(onlyUnique)

  logger('Fault sectors:', allFaults)
  logger('Recovery sectors:', allRecoveries)

  await setSectors(allFaults, 'Fault')
  await setSectors(allRecoveries, 'Recovery')
}
