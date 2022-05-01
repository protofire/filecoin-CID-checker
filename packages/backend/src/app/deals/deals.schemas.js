const commonSchemas = require('filecoin-checker-shared/src/common-schemas')

const list = {
  querystring: {
    type: 'object',
    properties: {
      activeDeal: {
        type: 'number',
        enum: [1],
      },
      verifiedDeal: {
        type: 'number',
        enum: [1],
      },
      ...commonSchemas.pagination.properties,
      ...commonSchemas.sorter.properties,
    },
  },
}

const listWithSelector = {
  params: {
    type: 'object',
    required: ['selector'],
    properties: {
      selector: {
        type: 'string',
      },
    },
  },
  querystring: list.querystring,
}
module.exports = {
  list,
  csv: list,
  listWithSelector,
  getDeal: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number' },
      },
    },
  },
}
