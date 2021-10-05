module.exports = {
  name: 'version',
  path: './version/version.controller',
  tags: ['default'],
  interfaces: [
    {
      httpMethod: 'get',
      controllerMethod: 'get',
      path: '/api/version',
      preHandler: [],
    },
  ],
}
