import * as cheerio from 'cheerio'
import * as iconv from 'iconv-lite'
import * as rq from 'request'
import * as request from 'request-promise-native'

import getAuthCode from './authcode'
import url from './url'

interface IData {
  [key: string]: any
}

interface ICurriculum {
  year: string,
  sem: string
}

interface ICurriculumCourse {
  id: string,
  name: string,
  instructor: string[],
  periods: {
    [day: number]: string[],
  },
  classroom: string[]
}

interface ICourseStudent {
  class: string,
  id: string,
  name: string,
  courseStatus: string,
  schoolStatus: string,
}

interface ICourse {
  id: string,
  name: string,
  credit: string,
  type: string,
  instructor: string[],
  class: string,
  classroom: string[],
  numOfEnroll: string,
  numOfDrop: string,
  students: ICourseStudent[]
}

interface IResult {
  success: boolean,
  data: any
}

class Crawler {
  private cookieJar: rq.CookieJar | undefined = undefined

  public async getCurriculums(
    options: { studentId: string, password: string, targetStudentId?: string }): Promise<IResult> {
    this._resetCookieJar()
    if (await this._loginPortal({
      password: options.password,
      studentId: options.studentId,
    })) {
      // console.log('登入入口網站成功')
    } else {
      // console.log('登入入口網站失敗')
      return {
        data: '登入入口網站失敗',
        success: false,
      }
    }

    if (await this._loginCourseSystem()) {
      // console.log('登入課程系統成功')
    } else {
      // console.log('登入課程系統失敗')
      return {
        data: '登入課程系統失敗',
        success: false,
      }
    }

    const data: ICurriculum[] = await this._getCurriculums({ studentId: options.targetStudentId || options.studentId })

    return {
      data,
      success: true,
    }
  }

  public async getCurriculumCourses(
    options: { studentId: string, password: string, targetStudentId?: string, year: string, sem: string })
    : Promise<IResult> {
    this._resetCookieJar()
    if (await this._loginPortal({
      password: options.password,
      studentId: options.studentId,
    })) {
      // console.log('登入入口網站成功')
    } else {
      // console.log('登入入口網站失敗')
      return {
        data: '登入入口網站失敗',
        success: false,
      }
    }

    if (await this._loginCourseSystem()) {
      // console.log('登入課程系統成功')
    } else {
      // console.log('登入課程系統失敗')
      return {
        data: '登入課程系統失敗',
        success: false,
      }
    }

    const data: ICurriculumCourse[] = await this._getCurriculumCourses({
      sem: options.sem,
      studentId: options.targetStudentId || options.studentId,
      year: options.year,
    })

    return {
      data,
      success: true,
    }
  }

  public async getCourse(
    options: { studentId: string, password: string, courseId: string }): Promise<IResult> {
    this._resetCookieJar()
    if (await this._loginPortal({
      password: options.password,
      studentId: options.studentId,
    })) {
      // console.log('登入入口網站成功')
    } else {
      // console.log('登入入口網站失敗')
      return {
        data: '登入入口網站失敗',
        success: false,
      }
    }

    if (await this._loginCourseSystem()) {
      // console.log('登入課程系統成功')
    } else {
      // console.log('登入課程系統失敗')
      return {
        data: '登入課程系統失敗',
        success: false,
      }
    }

    const data: ICourse = await this._getCourse({ id: options.courseId })

    return {
      data,
      success: true,
    }
  }

  private _resetCookieJar(stringCookieJar?: string) {
    this.cookieJar = stringCookieJar ? JSON.parse(stringCookieJar) as rq.CookieJar : request.jar()
  }

  private async _getAuthcodeImageBuffer(): Promise<Buffer> {
    const buffer: Buffer = await request({
      encoding: null,
      jar: this.cookieJar,
      method: 'GET',
      uri: url.portal.AUTH_IMAGE,
    })
    return buffer
  }

  private async _loginPortal(options: { studentId: string, password: string }): Promise<boolean> {
    const authcode: string = getAuthCode(await this._getAuthcodeImageBuffer())
    const body: string = await request({
      form: {
        authcode,
        forceMobile: 'mobile',
        mpassword: options.password,
        muid: options.studentId,
      },
      headers: {
        Referer: url.portal.INDEX_PAGE,
      },
      jar: this.cookieJar,
      method: 'POST',
      uri: url.portal.LOGIN,
    })
    return body.indexOf('重新登入') === -1
  }

  private async _loginCourseSystem(): Promise<boolean> {
    let body: string = await request({
      jar: this.cookieJar,
      method: 'POST',
      uri: url.portal.SSO_LOGIN_COURSE_SYSTEM,
    })
    const $: CheerioStatic = cheerio.load(body)
    const hiddenInputs: Cheerio = $('input[type=hidden]')
    const form: IData = {}
    $(hiddenInputs).each((i, input) => {
      form[$(input).attr('name')] = $(input).val()
    })
    const buffer: Buffer = await request({
      encoding: null,
      form,
      jar: this.cookieJar,
      method: 'POST',
      uri: url.courseSystem.MAIN_PAGE,
    })
    body = iconv.decode(buffer, 'big5')
    return body.indexOf('依 [學號]／[課號] 查詢選課表') !== -1
  }

  private async _getCurriculums(options: { studentId: string }): Promise<ICurriculum[]> {
    const body = await request({
      form: {
        code: options.studentId,
        format: -3,
      },
      jar: this.cookieJar,
      method: 'POST',
      uri: url.courseSystem.SELECT,
    })
    const $: CheerioStatic = cheerio.load(body)
    const links: Cheerio = $('a')
    const curriculums: ICurriculum[] = []
    $(links).each((i: number, link: CheerioElement) => {
      const href: string = $(link).attr('href')
      const info: ICurriculum = {
        sem: '',
        year: '',
      }
      for (const str of href.split('&')) {
        if (str.startsWith('year=')) {
          info.year = str.replace('year=', '')
        } else if (str.startsWith('sem=')) {
          info.sem = str.replace('sem=', '')
        }
      }
      curriculums.push(info)
    })
    return curriculums
  }

  private async _getCurriculumCourses(
    options: { studentId: string, year: string, sem: string }): Promise<ICurriculumCourse[]> {
    const buffer: Buffer = await request({
      encoding: null,
      jar: this.cookieJar,
      method: 'GET',
      uri: `${url.courseSystem.SELECT}?format=-2&code=${options.studentId}&year=${options.year}&sem=${options.sem}`,
    })
    const body: string = iconv.decode(buffer, 'big5')
    const $ = cheerio.load(body, { decodeEntities: false })
    const rows = $('tr')
    const curriculumCourses: ICurriculumCourse[] = []
    const columnMap: { [key: number]: string } = {
      0: 'id',
      1: 'name',
      6: 'instructor',
      8: 'periodsOfSunday',
      9: 'periodsOfMonday',
      10: 'periodsOfTuesday',
      11: 'periodsOfWednesday',
      12: 'periodsOfThursday',
      13: 'periodsOfFriday',
      14: 'periodsOfSaturday',
      15: 'classroom',
    }
    $(rows).each((rowIndex: number, row: CheerioElement) => {
      if ([0, 1, 2, $(rows).length - 1].indexOf(rowIndex) === -1) {
        const columns = $(row).find('td')
        const info: ICurriculumCourse = {
          classroom: [],
          id: '',
          instructor: [],
          name: '',
          periods: {},
        }
        $(columns).each((columnIndex: number, column: CheerioElement) => {
          if (columnMap[columnIndex]) {
            const element: Cheerio = $(column).find('a').length === 0 ? $(column) : $(column).find('a')
            if (columnIndex >= 8 && columnIndex <= 14) {
              const day: number = columnIndex - 8
              info.periods[day] = $(element).text().trim().split(' ')
            } else if (columnIndex === 6 || columnIndex === 15) {
              $(element).each((i: number, el: CheerioElement) => {
                info[columnMap[columnIndex]].push($(el).text().trim())
              })
            } else {
              info[columnMap[columnIndex]] = $(element).text().trim()
            }
          }
        })
        curriculumCourses.push(info)
      }
    })
    return curriculumCourses
  }

  private async _getCourse(options: { id: string }): Promise<ICourse> {
    const course: ICourse = {
      class: '',
      classroom: [],
      credit: '',
      id: '',
      instructor: [],
      name: '',
      numOfDrop: '',
      numOfEnroll: '',
      students: [],
      type: '',
    }
    const buffer: Buffer = await request({
      encoding: null,
      jar: this.cookieJar,
      method: 'GET',
      uri: `${url.courseSystem.SELECT}?format=-1&code=${options.id}`,
    })
    const body: string = iconv.decode(buffer, 'big5')
    const $: CheerioStatic = cheerio.load(body, { decodeEntities: false })
    const tables: Cheerio = $('table')
    {
      const rowMap: { [key: number]: string } = {
        0: 'id',
        3: 'name',
        5: 'credit',
        7: 'type',
        8: 'instructor',
        9: 'class',
        10: 'classroom',
        11: 'numOfEnroll',
        12: 'numOfDrop',
      }
      const courseInfoTable: CheerioElement = $(tables)[0]
      const rows: Cheerio = $(courseInfoTable).find('tr')
      $(rows).each((rowIndex: number, row: CheerioElement) => {
        if (rowMap[rowIndex]) {
          let el: Cheerio = $(row).find('td')
          el = el.find('a').length === 0 ? el : el.find('a')
          if (rowIndex === 8 || rowIndex === 10) {
            $(el).each((i: number, e: CheerioElement) => {
              if (i !== $(el).length - 1 || rowIndex === 10) {
                course[rowMap[rowIndex]].push($(e).text().trim())
              }
            })
          } else {
            course[rowMap[rowIndex]] = $(el).text().trim()
          }
        }
      })
    }
    {
      const columnMap: { [key: number]: string } = {
        0: 'class',
        1: 'id',
        2: 'name',
        4: 'courseStatus',
        5: 'schoolStatus',
      }
      const students: ICourseStudent[] = []
      const studentsInfoTable = $(tables)[2]
      const rows = $(studentsInfoTable).find('tr')
      $(rows).each((rowIndex: number, row: CheerioElement) => {
        if (rowIndex !== $(rows).length - 1) {
          const student: ICourseStudent = {
            class: '',
            courseStatus: '',
            id: '',
            name: '',
            schoolStatus: '',
          }
          const columns = $(row).find('td')
          $(columns).each((columnIndex: number, column: CheerioElement) => {
            if (columnMap[columnIndex]) {
              let el: Cheerio = $(column)
              el = el.find('a').length === 0 ? el : el.find('a')
              student[columnMap[columnIndex]] = $(el).text().trim()
            }
          })
          students.push(student)
        }
      })
      course.students = students
    }
    return course
  }
}

export default Crawler
