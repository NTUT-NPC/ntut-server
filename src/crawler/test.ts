import Crawler from './index'

export default async () => {
    const crawler = new Crawler()
    crawler.setCookieJar()
    await crawler.loginPortal('105590010', '********')
    if (await !crawler.isLoggedInPortal()) {
        console.log('尚未登入')
        return
    }
    console.log('登入成功')
}
