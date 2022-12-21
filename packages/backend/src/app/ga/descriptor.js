module.exports = {
  name: 'google-analytics',
  path: './ga/ga.controller',
  tags: ['google-analytics'],
  interfaces: [
    {
      httpMethod: 'get',
      controllerMethod: 'get',
      path: '/api/ga-tag-id',
      preHandler: [],
    },
  ],
}
