module.exports = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'number', maximum: 1000000 },
    },
  },
  pagination: {
    type: 'object',
    properties: {
      per_page: { type: 'number', maximum: 10000, default: 10 },
      page: { type: 'number', maximum: 20000, default: 1 },
    },
  },
  sorter: {
    type: 'object',
    properties: {
      sort_by_column: { type: 'string' },
      sort_direction: { type: 'number', enum: [1,-1], default: 1 }
    }
  }
}
