import * as Router from 'koa-router'
import helloWorld from '../controllers/hello_world'

const router = new Router()

router.get('/', helloWorld)

export default router
