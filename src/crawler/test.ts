import Crawler from './index'

export default async () => {
    const studentId = 'xxxxxxxxxx'
    const password = '********'
    const crawler = new Crawler()

    console.log(await crawler.getCurriculums({ studentId, password }))

    console.log(await crawler.getCurriculumCourses({ studentId, password, year: '107', sem: '1' }))

    console.log(await crawler.getCourse({ studentId, password, courseId: '244582' }))
}
