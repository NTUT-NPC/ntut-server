import * as jwt from 'jsonwebtoken'
import * as Router from 'koa-router'

import { SECRET } from '../../config'

const router: Router = new Router()

router.post('/', async (ctx, next) => {
    const data = ctx.request.body
    const token = jwt.sign(data, SECRET)
    console.log(token)
    console.log(jwt.decode(token))
    ctx.status = 200
    ctx.body = {
        token,
    }
})

export default router
