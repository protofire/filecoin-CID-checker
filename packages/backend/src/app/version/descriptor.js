module.exports = {
  name: 'version',
  path: './version/version.controller',
  tags: ['default'],
  interfaces: [
    {
      httpMethod: 'get',
      controllerMethod: 'get',
      path: '/version',
      preHandler: [],
    },
  ],
}
