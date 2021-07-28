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

const requestStateAccountKey = (id: string) => {
  return {
  ...baseBody,
  method: 'Filecoin.StateAccountKey',
  params: [id, null],
}}

const requestStateLookupId = (address: string) => {
  return {
  ...baseBody,
  method: 'Filecoin.StateLookupID',
  params: [address, null],
}}

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

export const getStateAccountKey = async (id: string): Promise<any> => {
  const response: any = await gotPost(requestStateAccountKey(id))
  return response.body.result
}

export const getStateLookupId = async (address: string): Promise<any> => {
  const response: any = await gotPost(requestStateLookupId(address))
  return response.body.result
}
