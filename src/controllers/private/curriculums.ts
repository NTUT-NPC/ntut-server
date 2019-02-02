import * as Router from 'koa-router'

import Crawler from '../../crawler'

const router: Router = new Router()

router.get('/', async (ctx, next) => {
    const { studentId, password } = ctx.state.jwtData
    if (!studentId || !password) {
        ctx.body = {
            message: '資料缺少學號或密碼',
        }
        ctx.status = 400
        return
    }

    const { targetStudentId, year, sem } = ctx.query

    if (!year && !sem) {
        const result = await Crawler.getInstance().getCurriculums({
            password,
            studentId,
            targetStudentId,
        })
        if (result.success) {
            ctx.body = result.data
            ctx.status = result.status
        } else {
            ctx.body = result.data
            ctx.status = result.status
        }
    } else if (year && sem) {
        const result = await Crawler.getInstance().getCurriculumCourses({
            password,
            sem,
            studentId,
            targetStudentId,
            year,
        })
        if (result.success) {
            ctx.body = result.data
            ctx.status = result.status
        } else {
            ctx.body = result.data
            ctx.status = result.status
        }
    } else {
        ctx.body = {
            message: '錯誤的Query參數',
        }
        ctx.status = 400
    }
})

router.get('/course/:id', async (ctx, next) => {
    const { studentId, password } = ctx.state.jwtData
    if (!studentId || !password) {
        ctx.body = {
            message: '資料缺少學號或密碼',
        }
        ctx.status = 400
        return
    }

    const courseId = ctx.params.id
    if (!courseId) {
        ctx.body = {
            message: '資料缺少課號',
        }
        ctx.status = 400
        return
    }

    const result = await Crawler.getInstance().getCourse({
        courseId,
        password,
        studentId,
    })
    if (result.success) {
        ctx.body = result.data
        ctx.status = result.status
    } else {
        ctx.body = result.data
        ctx.status = result.status
    }
})

export default router
