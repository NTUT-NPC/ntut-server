import * as Router from 'koa-router'

import loginRouter from './login'

const router: Router = new Router({
    prefix: '/api',
})

router.use('/login', loginRouter.routes())

export default router
