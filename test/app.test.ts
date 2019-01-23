import * as request from 'supertest'
import server from '../src/app'

console.log = jest.fn()
jest.setTimeout(30000)

afterAll(() => {
  server.close()
  console.log('server closed!')
})

describe('Test HelloWorld', () => {
  test('It should return status code: 200', async () => {
    const response = await request(server).get('/')
    expect(response.statusCode).toBe(200)
  })
  test('It should return body: HelloWorld', async () => {
    const response = await request(server).get('/')
    expect(JSON.parse(response.text).data).toBe('Hello World!')
  })

})
