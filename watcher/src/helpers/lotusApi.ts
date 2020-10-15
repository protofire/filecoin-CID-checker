import got from 'got'
import { LOTUS_RPCURL, LOTUS_JWT_TOKEN } from '../config'
import { getLogger } from '../helpers/logger'

const baseBody = {
  jsonrpc: '2.0',
  id: 1,
}

const requestChainHead = {
  ...baseBody,
  method: 'Filecoin.ChainHead',
  params: [],
}
const requestStateMarketDeals = (tipSetKey: any) => ({
  ...baseBody,
  method: 'Filecoin.StateMarketDeals',
  params: [tipSetKey],
})
const requestStateMinerSectors = (
  minerId: string,
  bitfield: null | [number] = null,
  include: null | boolean = null,
  tipSetKey: undefined | any = null,
) => ({
  ...baseBody,
  method: 'Filecoin.StateMinerSectors',
  params: [minerId, bitfield, include, tipSetKey],
})
const requestStateMinerActiveSectors = (
  minerId: string,
  tipSetKey: undefined | any = null,
) => ({
  ...baseBody,
  method: 'Filecoin.StateMinerActiveSectors',
  params: [minerId, tipSetKey],
})

const requestChainGetTipSetByHeight = (height: number) => ({
  ...baseBody,
  method: 'Filecoin.ChainGetTipSetByHeight',
  params: [height, null],
})
const requestStateMinerFaults = (address: string, tipSetKey: any) => ({
  ...baseBody,
  method: 'Filecoin.StateMinerFaults',
  params: [address, tipSetKey],
})
const requestStateMinerRecoveries = (address: string, tipSetKey: any) => ({
  ...baseBody,
  method: 'Filecoin.StateMinerRecoveries',
  params: [address, tipSetKey],
})

// @TODO: log response size, timeout, retry, etc here
const gotPost = (json: any): Promise<any> => {
  const options: any = {
    responseType: 'json',
    json,
  }
  if (LOTUS_JWT_TOKEN !== '') {
    options.headers = {
      Authorization: `Bearer ${LOTUS_JWT_TOKEN}`,
    }
  }
  return got.post(LOTUS_RPCURL, options)
}

export const getChainHead = async (): Promise<any> => {
  const response: any = await gotPost(requestChainHead)
  return response.body.result
}

const memoizedTipSetKey = {
  Cids: null,
  height: -1,
}
export const getTipSetKeyByHeight = async (height: number): Promise<any> => {
  const logger = getLogger('debug:helpers/lotusApi')
  if (memoizedTipSetKey.Cids !== null && memoizedTipSetKey.height === height) {
    logger(`Returning memoized TipSetKey by height: ${height}`)
    return memoizedTipSetKey.Cids
  }
  logger(`Fetching TipSetKey by height: ${height}`)
  const response: any = await gotPost(requestChainGetTipSetByHeight(height))
  const tipSetKey: any = response.body.result.Cids
  memoizedTipSetKey.height = height
  memoizedTipSetKey.Cids = tipSetKey
  logger(tipSetKey)
  return tipSetKey
}

export const getStateMinerSectors = async (
  minerId: string,
  bitfield: null | [number] = null,
  include: null | boolean = null,
  tipSetKey: undefined | any = null,
): Promise<any> => {
  const response: any = await gotPost(
    requestStateMinerSectors(minerId, bitfield, include, tipSetKey),
  )
  const sectors = response.body.result
  return sectors
}

export const getStateMinerActiveSectors = async (
  minerId: string,
  tipSetKey: undefined | any = null,
): Promise<any> => {
  const response: any = await gotPost(
    requestStateMinerActiveSectors(minerId, tipSetKey),
  )
  const sectors = response.body.result
  return sectors
}

export const getMinerSectorFaultsByTipSetKey = async (
  address: string,
  tipSetKey: any,
): Promise<any> => {
  const stateMinerFaultsResponse: any = await gotPost(
    requestStateMinerFaults(address, tipSetKey),
  )
  const bitfield = stateMinerFaultsResponse.result
  const stateMinerSectorsResponse: any = await gotPost(
    requestStateMinerSectors(address, bitfield, false, tipSetKey),
  )
  const sectors = stateMinerSectorsResponse.result
  return sectors
}

export const getMinerSectorRecoveriesByTipSetKey = async (
  address: string,
  tipSetKey: any,
): Promise<any> => {
  const stateMinerRecoveriesResponse: any = await gotPost(
    requestStateMinerRecoveries(address, tipSetKey),
  )
  const bitfield = stateMinerRecoveriesResponse.result
  const stateMinerSectorsResponse: any = await gotPost(
    requestStateMinerSectors(address, bitfield, false, tipSetKey),
  )
  const sectors = stateMinerSectorsResponse.result
  return sectors
}

export const getMarketDeals = async (tipSetKey: any): Promise<any> => {
  const logger = getLogger('debug:helpers/lotusApi')
  logger('Fetching deals from Lotus node')
  const response: any = await gotPost(requestStateMarketDeals(tipSetKey))
  return response.body.result
}
