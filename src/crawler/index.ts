import * as cheerio from 'cheerio'
import * as iconv from 'iconv-lite'
import * as rq from 'request'
import * as request from 'request-promise-native'

import getAuthCode from './authcode'
import url from './url'

import Curriculum, { ICourse, ICourseStudent, ICurriculum, ICurriculumCourse } from './curriculum'

interface IData {
  [key: string]: any
}

interface IResult {
  success: boolean,
  data: any
}

class Crawler {
  public static getInstance(): Crawler {
    if (!Crawler.instance) {
      Crawler.instance = new Crawler()
    }
    return Crawler.instance
  }

  private static instance: Crawler = null
  private cookieJar: rq.CookieJar | undefined = undefined

  private constructor() {
  }

  public async getCurriculums(
    options: { studentId: string, password: string, targetStudentId?: string }): Promise<IResult> {
    this.resetCookieJar()
    if (await this.loginPortal({
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

    const data: ICurriculum[] = await Curriculum.getCurriculums(this.cookieJar,
      { studentId: options.targetStudentId || options.studentId })

    return {
      data,
      success: true,
    }
  }

  public async getCurriculumCourses(
    options: { studentId: string, password: string, targetStudentId?: string, year: string, sem: string })
    : Promise<IResult> {
    this.resetCookieJar()
    if (await this.loginPortal({
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

    const data: ICurriculumCourse[] = await Curriculum.getCurriculumCourses(this.cookieJar, {
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
    this.resetCookieJar()
    if (await this.loginPortal({
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

    const data: ICourse = await Curriculum.getCourse(this.cookieJar, { id: options.courseId })

    return {
      data,
      success: true,
    }
  }

  public async loginPortal(options: { studentId: string, password: string }): Promise<boolean> {
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

  public resetCookieJar(stringCookieJar?: string) {
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
}

export default Crawler
