import * as cheerio from 'cheerio'
import * as iconv from 'iconv-lite'
import * as rq from 'request'
import * as request from 'request-promise-native'

import url from './url'

export interface ICurriculum {
    year: string,
    sem: string
}

export interface ICurriculumCourse {
    id: string,
    name: string,
    instructor: string[],
    periods: {
        [day: number]: string[],
    },
    classroom: string[]
}

export interface ICourseStudent {
    class: string,
    id: string,
    name: string,
    courseStatus: string,
    schoolStatus: string,
}

export interface ICourse {
    id: string,
    name: string,
    credit: string,
    type: string,
    instructor: string[],
    class: string,
    classroom: string[],
    numOfEnroll: string,
    numOfDrop: string,
    students: ICourseStudent[]
}

class Curriculum {
    public static async getCurriculums(cookieJar: rq.CookieJar,
                                       options: { studentId: string }): Promise<ICurriculum[]> {
        const body = await request({
            form: {
                code: options.studentId,
                format: -3,
            },
            jar: cookieJar,
            method: 'POST',
            uri: url.courseSystem.SELECT,
        })
        const $: CheerioStatic = cheerio.load(body)
        const links: Cheerio = $('a')
        const curriculums: ICurriculum[] = []
        $(links).each((i: number, link: CheerioElement) => {
            const href: string = $(link).attr('href')
            const info: ICurriculum = {
                sem: '',
                year: '',
            }
            for (const str of href.split('&')) {
                if (str.startsWith('year=')) {
                    info.year = str.replace('year=', '')
                } else if (str.startsWith('sem=')) {
                    info.sem = str.replace('sem=', '')
                }
            }
            curriculums.push(info)
        })
        return curriculums
    }

    public static async getCurriculumCourses(cookieJar: rq.CookieJar,
                                             options: {
            studentId: string,
            year: string,
            sem: string,
        }): Promise<ICurriculumCourse[]> {
        const buffer: Buffer = await request({
            encoding: null,
            jar: cookieJar,
            method: 'GET',
            uri: `${url.courseSystem.SELECT}?format=-2&`
                + `code=${options.studentId}&`
                + `year=${options.year}&`
                + `sem=${options.sem}`,
        })
        const body: string = iconv.decode(buffer, 'big5')
        const $ = cheerio.load(body, { decodeEntities: false })
        const rows = $('tr')
        const curriculumCourses: ICurriculumCourse[] = []
        const columnMap: { [key: number]: string } = {
            0: 'id',
            1: 'name',
            6: 'instructor',
            8: 'periodsOfSunday',
            9: 'periodsOfMonday',
            10: 'periodsOfTuesday',
            11: 'periodsOfWednesday',
            12: 'periodsOfThursday',
            13: 'periodsOfFriday',
            14: 'periodsOfSaturday',
            15: 'classroom',
        }
        $(rows).each((rowIndex: number, row: CheerioElement) => {
            if ([0, 1, 2, $(rows).length - 1].indexOf(rowIndex) === -1) {
                const columns = $(row).find('td')
                const info: ICurriculumCourse = {
                    classroom: [],
                    id: '',
                    instructor: [],
                    name: '',
                    periods: {},
                }
                $(columns).each((columnIndex: number, column: CheerioElement) => {
                    if (columnMap[columnIndex]) {
                        const element: Cheerio = $(column).find('a').length === 0 ? $(column) : $(column).find('a')
                        if (columnIndex >= 8 && columnIndex <= 14) {
                            const day: number = columnIndex - 8
                            info.periods[day] = $(element).text().trim().split(' ')
                        } else if (columnIndex === 6 || columnIndex === 15) {
                            $(element).each((i: number, el: CheerioElement) => {
                                info[columnMap[columnIndex]].push($(el).text().trim())
                            })
                        } else {
                            info[columnMap[columnIndex]] = $(element).text().trim()
                        }
                    }
                })
                curriculumCourses.push(info)
            }
        })
        return curriculumCourses
    }

    public static async getCourse(cookieJar: rq.CookieJar, options: { id: string }): Promise<ICourse> {
        const course: ICourse = {
            class: '',
            classroom: [],
            credit: '',
            id: '',
            instructor: [],
            name: '',
            numOfDrop: '',
            numOfEnroll: '',
            students: [],
            type: '',
        }
        const buffer: Buffer = await request({
            encoding: null,
            jar: cookieJar,
            method: 'GET',
            uri: `${url.courseSystem.SELECT}?format=-1&code=${options.id}`,
        })
        const body: string = iconv.decode(buffer, 'big5')
        const $: CheerioStatic = cheerio.load(body, { decodeEntities: false })
        const tables: Cheerio = $('table')
        {
            const rowMap: { [key: number]: string } = {
                0: 'id',
                3: 'name',
                5: 'credit',
                7: 'type',
                8: 'instructor',
                9: 'class',
                10: 'classroom',
                11: 'numOfEnroll',
                12: 'numOfDrop',
            }
            const courseInfoTable: CheerioElement = $(tables)[0]
            const rows: Cheerio = $(courseInfoTable).find('tr')
            $(rows).each((rowIndex: number, row: CheerioElement) => {
                if (rowMap[rowIndex]) {
                    let el: Cheerio = $(row).find('td')
                    el = el.find('a').length === 0 ? el : el.find('a')
                    if (rowIndex === 8 || rowIndex === 10) {
                        $(el).each((i: number, e: CheerioElement) => {
                            if (i !== $(el).length - 1 || rowIndex === 10) {
                                course[rowMap[rowIndex]].push($(e).text().trim())
                            }
                        })
                    } else {
                        course[rowMap[rowIndex]] = $(el).text().trim()
                    }
                }
            })
        }
        {
            const columnMap: { [key: number]: string } = {
                0: 'class',
                1: 'id',
                2: 'name',
                4: 'courseStatus',
                5: 'schoolStatus',
            }
            const students: ICourseStudent[] = []
            const studentsInfoTable = $(tables)[2]
            const rows = $(studentsInfoTable).find('tr')
            $(rows).each((rowIndex: number, row: CheerioElement) => {
                if (rowIndex !== 0 && rowIndex !== $(rows).length - 1) {
                    const student: ICourseStudent = {
                        class: '',
                        courseStatus: '',
                        id: '',
                        name: '',
                        schoolStatus: '',
                    }
                    const columns = $(row).find('td')
                    $(columns).each((columnIndex: number, column: CheerioElement) => {
                        if (columnMap[columnIndex]) {
                            let el: Cheerio = $(column)
                            el = el.find('a').length === 0 ? el : el.find('a')
                            student[columnMap[columnIndex]] = $(el).text().trim()
                        }
                    })
                    students.push(student)
                }
            })
            course.students = students
        }
        return course
    }
}

export default Curriculum
