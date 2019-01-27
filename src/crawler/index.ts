import * as rq from 'request'
import * as request from 'request-promise-native'

import getAuthCode from './authcode'
import url from './url'

class Crawler {
  private cookieJar: rq.CookieJar | undefined = undefined

  public setCookieJar(stringCookieJar?: string) {
    this.cookieJar = stringCookieJar ? JSON.parse(stringCookieJar) as rq.CookieJar : request.jar()
  }

  public async getAuthcodeImageBuffer(): Promise<Buffer> {
    const options = {
      encoding: null,
      jar: this.cookieJar,
      method: 'GET',
      uri: url.Portal.AUTH_IMAGE,
    }
    const buffer: Buffer = await request(options)
    return buffer
  }

  public async loginPortal(studentId: string, password: string): Promise<void> {
    const authcode: string = getAuthCode(await this.getAuthcodeImageBuffer())
    const options = {
      form: {
        authcode,
        forceMobile: 'mobile',
        mpassword: password,
        muid: studentId,
      },
      headers: {
        Referer: url.Portal.INDEX_PAGE,
      },
      jar: this.cookieJar,
      method: 'POST',
      uri: url.Portal.LOGIN,
    }
    const body: string = await request(options)
  }

  public async isLoggedInPortal(): Promise<boolean> {
    const options = {
      jar: this.cookieJar,
      method: 'GET',
      uri: url.Portal.MAIN_PAGE,
    }
    const body: string = await request(options)
    return body.indexOf('重新登入') === -1
  }
}

export default Crawler
