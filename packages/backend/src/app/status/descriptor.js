module.exports = {
  name: 'deals',
  path: './status/status.controller',
  tags: ['status'],
  interfaces: [
    {
      httpMethod: 'get',
      controllerMethod: 'getDiffAboutLotusAndDb',
      path: '/api/status/diff',
      preHandler: [],
    },
  ],
}
