import * as Redis from 'ioredis'
import * as Koa from 'koa'
import * as koaBodyparser from 'koa-bodyparser'
import * as compress from 'koa-compress'
import * as helmet from 'koa-helmet'
import * as json from 'koa-json'
import * as logger from 'koa-logger'
import * as onerror from 'koa-onerror'
import * as protect from 'koa-protect'
import * as ratelimit from 'koa-ratelimit'
import * as responseTime from 'koa-response-time'
import apiRouter from './routers/index'

import crawlerTest from './crawler/test'

const app = new Koa()

onerror(app)

// X-Response-Time middleware
app.use(responseTime())
// JSON pretty-printed response middleware
app.use(json())
// Development style logger middleware
app.use(logger())
// SQL injection  protection middleware
app.use(protect.koa.sqlInjection({
    body: true,
    loggerFunction: console.error,
}))
// XSS protection middleware
app.use(protect.koa.xss({
    body: true,
    loggerFunction: console.error,
}))
// Header security middleware
app.use(helmet())
// Rate limiter middleware
app.use(ratelimit({
    db: new Redis(),
    duration: 60000,
    errorMessage: 'Sometimes You Just Have to Slow Down.',
    headers: {
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total',
    },
    id: (ctx) => ctx.ip,
    max: 100,
}))
// Compress packet middleware
app.use(compress())
// Formdata parser middleware
app.use(koaBodyparser())
// Add all the api routers
app.use(apiRouter.routes())

export default app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`)
})

crawlerTest()
