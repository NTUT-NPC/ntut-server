import * as Router from 'koa-router'

import curriculumsRouter from './curriculums'

const router: Router = new Router({
    prefix: '/api',
})

router.use('/curriculums', curriculumsRouter.routes())

export default router
