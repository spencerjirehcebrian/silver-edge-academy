import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { authorize } from '../../middleware/authorize'
import { validateBody, validateQuery, validateParams } from '../../middleware/validate'
import * as controller from './classes.controller'
import {
  createClassSchema,
  updateClassSchema,
  listClassesQuerySchema,
  listStudentsQuerySchema,
  idParamSchema,
  addStudentSchema,
  addCourseSchema,
} from './classes.schema'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  validateQuery(listClassesQuerySchema),
  controller.list
)

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validateBody(createClassSchema),
  controller.create
)

router.get('/:id', authenticate, validateParams(idParamSchema), controller.getById)

router.patch(
  '/:id',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(idParamSchema),
  validateBody(updateClassSchema),
  controller.update
)

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  validateParams(idParamSchema),
  controller.remove
)

// Students
router.get(
  '/:id/students',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(idParamSchema),
  validateQuery(listStudentsQuerySchema),
  controller.getStudents
)

router.post(
  '/:id/students',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(idParamSchema),
  validateBody(addStudentSchema),
  controller.addStudent
)

router.delete(
  '/:id/students/:studentId',
  authenticate,
  authorize(['admin', 'teacher']),
  controller.removeStudent
)

// Courses
router.get(
  '/:id/courses',
  authenticate,
  validateParams(idParamSchema),
  controller.getCourses
)

router.post(
  '/:id/courses',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(idParamSchema),
  validateBody(addCourseSchema),
  controller.addCourse
)

router.delete(
  '/:id/courses/:courseId',
  authenticate,
  authorize(['admin', 'teacher']),
  controller.removeCourse
)

// Lesson unlocks
router.get(
  '/:id/unlocked-lessons',
  authenticate,
  authorize(['admin', 'teacher']),
  validateParams(idParamSchema),
  controller.getUnlockedLessons
)

router.post(
  '/:id/unlock-lesson/:lessonId',
  authenticate,
  authorize(['admin', 'teacher']),
  controller.unlockLesson
)

router.delete(
  '/:id/unlock-lesson/:lessonId',
  authenticate,
  authorize(['admin', 'teacher']),
  controller.lockLesson
)

/**
 * @swagger
 * /classes/{id}/archive:
 *   patch:
 *     tags: [Classes]
 *     summary: Archive a class
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class archived
 */
router.patch(
  '/:id/archive',
  authenticate,
  authorize(['admin']),
  validateParams(idParamSchema),
  controller.archive
)

export default router
