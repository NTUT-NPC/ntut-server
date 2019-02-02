import * as jwt from 'jsonwebtoken'
import * as Router from 'koa-router'

import { SECRET } from '../../config'
import Crawler from '../../crawler'

const router: Router = new Router()

router.post('/', async (ctx, next) => {
    const data = ctx.request.body
    if (!data.studentId || !data.password) {
        ctx.body = {
            message: '資料缺少學號或密碼',
        }
        ctx.status = 400
        return
    }
    const resultOfLoginPortal = await Crawler.getInstance().loginPortal(data)
    if (resultOfLoginPortal.success) {
        const token = jwt.sign(data, SECRET)
        ctx.body = {
            token,
        }
        ctx.status = resultOfLoginPortal.status
    } else {
        ctx.body = {
            message: resultOfLoginPortal.data,
        }
        ctx.status = resultOfLoginPortal.status
        return
    }
})

export default router
