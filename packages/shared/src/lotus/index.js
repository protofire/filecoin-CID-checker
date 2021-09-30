const assert = require('assert')
const fetch = require('node-fetch')

/* eslint-disable */
const url = require('url')
/* eslint-enable */

const baseBody = {
  jsonrpc: '2.0',
  id: 1,
}

class LotusApi {
  constructor(options = {}) {
    this.url = options.url
    this.token = options.token
  }

  async initialize() {
    // TODO how to get token in automode
    if (process.env.NODE_ENV === 'test') {
      return true
    }
  }

  authHeaders() {
    if(!this.token) {
      return { headers: {}}
    }
    return {
      headers: { Authorization: `Bearer ${this.token}` },
    }
  }

  getUrl(path, options = {}) {
    const result = new URL(`${this.url}/${path}`)

    Object.keys(options).forEach((option) => {
      result.searchParams.append(option, options[option])
    })

    return result.toString()
  }

  async request(opts = { method: 'get', params: {} }, options = {}) {
    const url = this.getUrl(opts.path, options)

    const authHeaders = this.authHeaders()
    let result

    switch (opts.method) {
      case 'get':
      case 'delete':
        result = await fetch(url, { method: opts.method, params: opts.params, ...authHeaders })
        break
      case 'patch':
        result = await fetch(url, {
          method: 'patch',
          body: JSON.stringify(opts.params),
          headers: {
            'content-type': 'application/json',
            ...authHeaders.headers,
          },
        })
        break
      case 'post':
        result = await fetch(url, {
          method: 'post',
          body: JSON.stringify(opts.params),
          headers: {
            'content-type': 'application/json',
            ...authHeaders.headers,
          },
        })

        break
      default:
        break
    }
    const text = await result.text()
    const json = JSON.parse(text || '{}')

    // if (
    //   json.errors &&
    //   json.errors[0].status &&
    //   json.errors[0].status === 401 &&
    //   /Invalid credentials/i.test(json.errors[0].detail)
    // ) {
    //   // [{
    //   //   status: 401,
    //   //     title: 'Authentication Failure',
    //   //   detail: 'Invalid credentials.'
    //   // }]
    //   await this.initialize()
    //   return this.request(opts, options)
    // }

    return json
  }

  async getChainHead () {
    return this.request({
      method: 'post',
      params: {
        ...baseBody,
        method: 'Filecoin.ChainHead',
        params: [],
      }
    })
  }

  async getStateAccountKey (id) {
    const requestStateAccountKey = {

    }
    return this.request({
      method: 'post',
      path: '',
      params: {
        ...baseBody,
        method: 'Filecoin.StateAccountKey',
        params: [id, null],
      }
    })
  }

  async getStateLookupId(address) {
    return this.request({
      method: 'post',
      path: '',
      params: {
        ...baseBody,
        method: 'Filecoin.StateLookupID',
        params: [address, null],
      }
    })
  }

  async getStateMinerInfo (address) {
    // StateMinerInfo
    return this.request({
      method: 'post',
      path: '',
      params: {
        ...baseBody,
        method: 'Filecoin.StateReadState',
        params: [address, null],
      }
    })
  }
}

module.exports = LotusApi