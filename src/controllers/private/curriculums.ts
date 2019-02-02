import * as jwt from 'jsonwebtoken'
import * as Router from 'koa-router'

const router: Router = new Router()

router.get('/', async (ctx, next) => {
    const jwtData = ctx.state.jwtData
    console.log(jwtData)
    ctx.status = 200
})

export default router
