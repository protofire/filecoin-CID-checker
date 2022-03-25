import fetch from 'node-fetch'
import {LOTUS_RPCURL, LOTUS_JWT_TOKEN} from '../config'
import {getLogger} from '../helpers/logger'
import JSONStream from 'jsonstream'
import es from 'event-stream'

const baseBody = {
    jsonrpc: '2.0',
    id: 1,
}

const requestChainHead = {
    ...baseBody,
    method: 'Filecoin.ChainHead',
    params: [],
}
/* eslint-disable */
const requestStateMarketDeals = (tipSetKey: any) => ({
    ...baseBody,
    method: 'Filecoin.StateMarketDeals',
    params: [tipSetKey],
})

const requestChainGetTipSetByHeight = (height: number) => ({
    ...baseBody,
    method: 'Filecoin.ChainGetTipSetByHeight',
    params: [height, null],
})

const getOptions = (opts: any = {params: {}}) => {
    const options: any = {
        method: 'post',
        body: JSON.stringify(opts.params),
    }
    options.headers = {
        'content-type': 'application/json',
    }
    if (LOTUS_JWT_TOKEN !== '') {
        options.headers.Authorization = `Bearer ${LOTUS_JWT_TOKEN}`
    }
    return options
}

const request = async (opts: any = {params: {}}) => {
    const url = LOTUS_RPCURL

    const result = await fetch(url, getOptions(opts))

    const text = await result.text()
    const json = JSON.parse(text || '{}')

    return json
}

const fetchPost = (json: any): Promise<any> => {
    const options: any = {
        responseType: 'json',
        json,
    }

    return request({
        params: json
    })
}

export const getChainHead = async (): Promise<any> => {
    return fetchPost(requestChainHead)
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
    const response: any = await fetchPost(requestChainGetTipSetByHeight(height))

    const tipSetKey: any = response.result.Cids

    memoizedTipSetKey.height = height
    memoizedTipSetKey.Cids = tipSetKey
    logger(tipSetKey)

    return tipSetKey
}

export const getMarketDeals = async (tipSetKey: any) => {
    const logger = getLogger('debug:helpers/lotusApi')
    logger('Fetching deals from Lotus node')

    const params = requestStateMarketDeals(tipSetKey)
    const options = getOptions({params})
    const res = await fetch(LOTUS_RPCURL, options)
    // huge filcoin response > 1gb - workaround for it
    return new Promise((resolve, reject) => {
        const errorHandler = (error: Error) => {
            return reject({reason: 'Unable to download data', meta: {LOTUS_RPCURL, error}})
        };
        const jsonStream = JSONStream.parse('result')
        const result: any = []
        jsonStream
            .on('error', err => errorHandler)
            .on('end', () => {
                console.info('end')
                return resolve(result)
            })
        res.body
            .on('error', errorHandler)
            .pipe(jsonStream)
            .pipe(es.mapSync((data: any) => {
                const key = Object.keys(data)[0]
                const DealID = parseInt(key)
                result.push({
                    ...data[key],
                    DealID
                })
                console.info('es.mapSync', key, data)
            }))
    })
}

/* eslint-enable */
