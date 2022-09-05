import fetch from 'node-fetch'
import {LOTUS_RPCURL} from '../config'
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
const requestStateMarketDeals = () => ({
    ...baseBody,
    method: 'Filecoin.StateMarketDeals',
    params: [[]],
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
    // if (LOTUS_JWT_TOKEN !== '') {
    //     options.headers.Authorization = `Bearer ${LOTUS_JWT_TOKEN}`
    // }
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
    const body = requestChainHead
    return fetchPost(body)
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
    const body = requestChainGetTipSetByHeight(height)
    const response: any = await fetchPost(body)

    const tipSetKey: any = [response.result.Cids[0]]

    memoizedTipSetKey.height = height
    memoizedTipSetKey.Cids = tipSetKey
    logger(tipSetKey)

    return tipSetKey
}

export const getMarketDeals = async () => {
    const logger = getLogger('debug:helpers/lotusApi')
    logger('Fetching deals from Lotus node')

    const params = requestStateMarketDeals()
    const options = getOptions({params})
    const res = await fetch(LOTUS_RPCURL, options)

    // huge filcoin response > 1gb - workaround for it
    return new Promise((resolve, reject) => {
        const errorHandler = (error: Error) => {
            return reject({reason: 'Unable to download data', meta: {LOTUS_RPCURL, error}})
        };
        const jsonStream = JSONStream.parse('result')
        let result: any = {}
        jsonStream
            .on('error', err => errorHandler)
            .on('end', () => {
                // logger('Deals got from filecoin')
                return resolve(result)
            })
        res.body
            .on('error', errorHandler)
            .pipe(jsonStream)
            .pipe(es.mapSync((data: any) => {
                result = data
            }))
    })
}

// export const getMarketDealsFromS3 = async (tipSetKey: any) => {
//     const logger = getLogger('debug:helpers/lotusApi')
//     logger('Fetching deals from S3')
//
//     const res = await fetch(MARKET_DEALS_JSON, { headers: { 'content-type': 'application/json'} })
//     console.info('res', res)
//     // huge filcoin response > 1gb - workaround for it
//     return new Promise((resolve, reject) => {
//         const errorHandler = (error: Error) => {
//             return reject({reason: 'Unable to download data', meta: {LOTUS_RPCURL, error}})
//         };
//         const jsonStream = JSONStream.parse('$*')
//         let result: any = {}
//         jsonStream
//             .on('error', err => errorHandler)
//             .on('end', () => {
//                 logger('Deals got from s3')
//                 return resolve(result)
//             })
//         res.body
//             .on('error', errorHandler)
//             .pipe(jsonStream)
//             .pipe(es.mapSync((data: any) => {
//                 console.info('data', data)
//                 result = data
//             }))
//     })
// }

/* eslint-enable */
