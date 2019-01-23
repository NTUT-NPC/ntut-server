import * as request from 'supertest'
import server from '../src/app'

console.log = jest.fn()

describe('Test HelloWorld', () => {
  test('It should return status code: 200', async (done) => {
    const response = await request(server).get('/')
    expect(response.statusCode).toBe(200)
    done()
  })
  test('It should return body: HelloWorld', async (done) => {
    const response = await request(server).get('/')
    expect(JSON.parse(response.text).data).toBe('Hello World!')
    done()
  })
})
