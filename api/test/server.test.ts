import request from 'supertest'
import { app } from '../src/server'

describe('general server config', () => {
  const server = app.listen()
  afterAll((done) => server.close(done))

  it('responds with 404 to not found endpoints', async () => {
    const r = await request(server).get('/somerandonenpoint')
    expect(r.status).toBe(404)
  })
})
