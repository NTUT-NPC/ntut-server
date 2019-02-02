import * as request from 'supertest'
import server from '../src/app'

const studentId = '105590010'
const password = 'xxxxxxxx'

afterAll(() => {
  server.close()
  console.log('server closed!')
})

describe('Test login', () => {
  // test('It should return status code: 200', async () => {
  //   const response = await request(server)
  //     .post('/api/login')
  //     .send({
  //       password,
  //       studentId,
  //     })
  //   console.log(response.body)
  //   expect(response.statusCode).toBe(200)
  //   expect(response.body).toHaveProperty('token')
  // })

  test('It should return status code: 400', async () => {
    const response = await request(server)
      .post('/api/login')
      .send({
        studentId,
      })
    console.log(response.body)
    expect(response.statusCode).toBe(400)
  })

  test('It should return status code: 401', async () => {
    const response = await request(server)
      .post('/api/login')
      .send({
        password: 'blablabla',
        studentId: 'blablabla',
      })
    expect(response.statusCode).toBe(401)
    console.log(response.body)
  })
})

// describe('Test curriculums', () => {
//   test('get curriculums', async () => {
//     const response1 = await request(server)
//       .post('/api/login')
//       .send({
//         password,
//         studentId,
//       })
//     console.log('logged in')
//     expect(response1.status).toBe(200)
//     const response2 = await request(server)
//       .get('/api/curriculums')
//       .set('Authorization', `Bearer ${response1.body.token}`)
//     console.log(response2.body)
//     expect(response2.statusCode).toBe(200)
//   })

//   test('get curriculum courses', async () => {
//     const response1 = await request(server)
//       .post('/api/login')
//       .send({
//         password,
//         studentId,
//       })
//     console.log('logged in')
//     expect(response1.status).toBe(200)
//     const response2 = await request(server)
//       .get('/api/curriculums')
//       .set('Authorization', `Bearer ${response1.body.token}`)
//       .query({
//         sem: '1',
//         year: '107',
//       })
//     console.log(response2.body)
//     expect(response2.statusCode).toBe(200)
//   })

//   test('get course', async () => {
//     const response1 = await request(server)
//       .post('/api/login')
//       .send({
//         password,
//         studentId,
//       })
//     console.log('logged in')
//     expect(response1.status).toBe(200)
//     const response2 = await request(server)
//       .get(`/api/curriculums/course/244582`)
//       .set('Authorization', `Bearer ${response1.body.token}`)
//     console.log(response2.body)
//     expect(response2.statusCode).toBe(200)
//   })
// })
