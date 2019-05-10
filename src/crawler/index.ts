import * as cheerio from 'cheerio'
import * as iconv from 'iconv-lite'
import * as rq from 'request'
import * as request from 'request-promise-native'

import url from './url'

import Curriculum, {
  ICourse,
  ICurriculum,
  ICurriculumInfo,
} from './curriculum'

interface IData {
  [key: string]: any
}

interface IResult {
  success: boolean
  status: number
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

  private constructor() {}

  public async getCurriculums(options: {
    studentId: string;
    password: string;
    targetStudentId?: string;
  }): Promise<IResult> {
    const resultOfLoginCourse: IResult = await this._loginCourseSystem(options)
    if (!resultOfLoginCourse.success) {
      return resultOfLoginCourse
    }

    const data: ICurriculum[] | undefined = await Curriculum.getCurriculums(
      this.cookieJar,
      { studentId: options.targetStudentId || options.studentId },
    )

    if (data) {
      return {
        data,
        status: 200,
        success: true,
      }
    } else {
      return {
        data: '查無該學號的學生',
        status: 400,
        success: false,
      }
    }
  }

  public async getCurriculumCourses(options: {
    studentId: string;
    password: string;
    targetStudentId?: string;
    year: string;
    sem: string;
  }): Promise<IResult> {
    const resultOfLoginCourse: IResult = await this._loginCourseSystem(options)
    if (!resultOfLoginCourse.success) {
      return resultOfLoginCourse
    }

    const curriculums: ICurriculum[] = await Curriculum.getCurriculums(
      this.cookieJar,
      {
        studentId: options.targetStudentId || options.studentId,
      },
    )

    let flag = false
    for (const curriculum of curriculums) {
      if (curriculum.year === options.year && curriculum.sem === options.sem) {
        flag = true
        break
      }
    }

    if (!flag) {
      return {
        data: '查無該學年或學期課表資料',
        status: 400,
        success: false,
      }
    }

    const data: ICurriculumInfo = await Curriculum.getCurriculumInfo(
      this.cookieJar,
      {
        sem: options.sem,
        studentId: options.targetStudentId || options.studentId,
        year: options.year,
      },
    )

    return {
      data,
      status: 200,
      success: true,
    }
  }

  public async getCourse(options: {
    studentId: string;
    password: string;
    courseId: string;
  }): Promise<IResult> {
    const resultOfLoginCourse: IResult = await this._loginCourseSystem(options)
    if (!resultOfLoginCourse.success) {
      return resultOfLoginCourse
    }

    const data: ICourse | undefined = await Curriculum.getCourse(
      this.cookieJar,
      { id: options.courseId },
    )

    if (data) {
      return {
        data,
        status: 200,
        success: true,
      }
    } else {
      return {
        data: '查無該課號的課程',
        status: 400,
        success: false,
      }
    }
  }

  public async loginPortal(options: {
    studentId: string;
    password: string;
  }): Promise<IResult> {
    this.resetCookieJar()
    const body: string = await request({
      form: {
        forceMobile: 'mobile',
        mpassword: options.password,
        muid: options.studentId,
      },
      headers: {
        'Referer': url.portal.INDEX_PAGE,
        'User-Agent': 'Direk Android App',
      },
      jar: this.cookieJar,
      method: 'POST',
      uri: url.portal.LOGIN,
    })
    if (body.indexOf('重新登入') === -1) {
      return {
        data: '',
        status: 200,
        success: true,
      }
    } else {
      return {
        data: '登入入口網站失敗',
        status: 401,
        success: false,
      }
    }
  }

  public resetCookieJar(stringCookieJar?: string) {
    this.cookieJar = stringCookieJar
      ? (JSON.parse(stringCookieJar) as rq.CookieJar)
      : request.jar()
  }

  private async _loginCourseSystem(options: {
    studentId: string;
    password: string;
  }): Promise<IResult> {
    const resultOfLoginPortal: IResult = await this.loginPortal(options)
    if (!resultOfLoginPortal.success) {
      return resultOfLoginPortal
    }
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
    if (body.indexOf('依 [學號]／[課號] 查詢選課表') !== -1) {
      return {
        data: '登入課程系統成功',
        status: 200,
        success: true,
      }
    } else {
      return {
        data: '登入課程系統失敗',
        status: 401,
        success: false,
      }
    }
  }
}

export default Crawler
