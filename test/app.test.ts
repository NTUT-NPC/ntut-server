import * as request from 'supertest'
import server from '../src/app'

afterAll(() => {
  server.close()
  console.log('server closed!')
})

describe('Test login', () => {
  test('It should return status code: 200', async () => {
    const response = await request(server)
      .post('/api/login')
      .send({
        password: 'wecp0826',
        studentId: '105590010',
      })
    expect(response.statusCode).toBe(200)
  })
})

describe('Test curriculums', () => {
  test('It should return status code: 200', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYX'
      + 'Nzd29yZCI6IndlY3AwODI2Iiwic3R1ZGVudElkIjoiMTA1NTkwMDEwIi'
      + 'wiaWF0IjoxNTQ5MDk3NzQ5fQ.kfZ8mBKaRPBfKICoiLh01gwTSZzsmSbJkSJaALBFjtQ'
    const response = await request(server)
      .get('/api/curriculums')
      .set('Authorization', `Bearer ${token}`)
    expect(response.statusCode).toBe(200)
  })
})
