const { isNormalInteger } = require('filecoin-checker-shared/src/helpers/number')

class DealsService {
  async list(query = {}, models, pagination) {
    const sortByColumn = query.sort_by_column ? query.sort_by_column : ''
    const sortDirection = query.sort_direction ? query.sort_direction : -1

    let sortCriteria = { _id: -1 }
    if (sortByColumn === 'status') {
      sortCriteria = {
        'State.SectorStartEpoch': sortDirection,
        _id: -1,
      }
    }
    const { selector } = query
    const where = {}

    if (selector) {
      if (isNormalInteger(selector)) {
        where._id = parseInt(selector)
      } else {
        where.$or = [
          { 'Proposal.PieceCID': { '/': selector } },
          { 'Proposal.Label': selector },
          { 'Proposal.Provider': selector },
          { 'Proposal.Client': selector },
        ]
      }
    }
    if (query.activeDeal) {
      where['State.SectorStartEpoch'] = { $gt: -1 }
    }

    if (query.verifiedDeal) {
      where['Proposal.VerifiedDeal'] = true
    }

    const result = await models.Deals.find(where)
      .limit(pagination.limit)
      .sort(sortCriteria)
      .skip(pagination.skip)

    console.info({ where }, 'DealsService.list.where')

    const deals = result.map((deal) => ({
      DealID: deal['_id'],
      DealInfo: deal,
    }))

    const response = {
      Pagination: {
        Page: pagination.page,
        PerPage: pagination.limit,
      },
      Deals: deals,
    }

    return response
  }

  async getStats(where, models) {
    const result = await models.Stats.findOne(where)

    return result
  }

  async getDeal(query = {}, models, deps = {}) {
    const { lotusProvider } = deps

    let where = {
      _id: query.id,
    }

    const queryResults = await models.Deals.find(where)

    if (queryResults.length !== 1) {
      throw new Error('Error retrieving deal')
    }
    const deal = queryResults[0]

    const clientId = deal.Proposal.Client

    const clientAddress = await lotusProvider.getStateAccountKey(clientId)
    // clientAddress: { result: { ... } }
    const response = {
      clientAddress: clientAddress.result ? clientAddress.result : '',
    }

    return response
  }
}

module.exports = DealsService
