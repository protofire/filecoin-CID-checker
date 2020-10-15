import request from 'supertest'
import { app } from '../../src/server'

describe('GET /example', () => {
  const server = app.listen()
  afterAll((done) => server.close(done))

  it('responds with success', async () => {
    const r = await request(server).get('/example')
    expect(r.status).toBe(200)
    expect(r.body.status).toBe('ok')
  })
})
