import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendPaginated, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as classesService from './classes.service'
import type { CreateClassInput, UpdateClassInput, ListClassesQuery, ListStudentsQuery } from './classes.schema'
import type { AuthenticatedRequest } from '../../middleware/auth'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListClassesQuery
  const result = await classesService.listClasses(query)
  sendPaginated(
    res,
    result.classes.map((c) => ({
      ...c.toJSON(),
      studentCount: c.studentIds.length,
      courseCount: c.courseIds.length,
    })),
    result.meta
  )
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const classDoc = await classesService.getClassById(req.params.id)
  const [stats, courses] = await Promise.all([
    classesService.computeClassStats(classDoc),
    classesService.getClassCoursesWithProgress(req.params.id),
  ])

  sendSuccess(res, {
    ...classDoc.toJSON(),
    studentCount: classDoc.studentIds.length,
    courseCount: classDoc.courseIds.length,
    attendanceRate: stats.attendanceRate,
    avgProgress: stats.avgProgress,
    lastActivity: stats.lastActivity,
    courses,
  })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateClassInput
  const classDoc = await classesService.createClass(input)
  sendCreated(res, classDoc.toJSON())
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateClassInput
  const classDoc = await classesService.updateClass(req.params.id, input)
  sendSuccess(res, classDoc.toJSON())
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await classesService.deleteClass(req.params.id)
  sendNoContent(res)
})

export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListStudentsQuery
  const result = await classesService.getClassStudents(req.params.id, query)
  sendPaginated(res, result.students, result.meta)
})

export const addStudent = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.body
  await classesService.addStudent(req.params.id, studentId)
  sendSuccess(res, { message: 'Student added to class' })
})

export const removeStudent = asyncHandler(async (req: Request, res: Response) => {
  await classesService.removeStudent(req.params.id, req.params.studentId)
  sendNoContent(res)
})

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const courses = await classesService.getClassCourses(req.params.id)
  sendSuccess(res, courses.map((c) => c.toJSON()))
})

export const addCourse = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.body
  await classesService.addCourse(req.params.id, courseId)
  sendSuccess(res, { message: 'Course assigned to class' })
})

export const removeCourse = asyncHandler(async (req: Request, res: Response) => {
  await classesService.removeCourse(req.params.id, req.params.courseId)
  sendNoContent(res)
})

export const unlockLesson = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  await classesService.unlockLesson(req.params.id, req.params.lessonId, authReq.user.userId)
  sendSuccess(res, { message: 'Lesson unlocked for class' })
})

export const lockLesson = asyncHandler(async (req: Request, res: Response) => {
  await classesService.lockLesson(req.params.id, req.params.lessonId)
  sendNoContent(res)
})

export const getUnlockedLessons = asyncHandler(async (req: Request, res: Response) => {
  const unlocks = await classesService.getUnlockedLessons(req.params.id)
  sendSuccess(res, unlocks.map((u) => u.toJSON()))
})

export const archive = asyncHandler(async (req: Request, res: Response) => {
  const classDoc = await classesService.archiveClass(req.params.id)
  sendSuccess(res, classDoc.toJSON())
})
