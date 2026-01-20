import { Types } from 'mongoose'
import { Class, type IClass } from './classes.model'
import { LessonUnlock } from './lessonUnlock.model'
import { User } from '../users/users.model'
import { StudentProfile } from '../users/studentProfile.model'
import { TeacherProfile } from '../users/teacherProfile.model'
import { Course, type ICourse } from '../courses/courses.model'
import { ApiError } from '../../utils/ApiError'
import {
  parsePaginationParams,
  buildPaginationMeta,
  buildSortObject,
} from '../../utils/pagination'
import type { CreateClassInput, UpdateClassInput, ListClassesQuery, ListStudentsQuery } from './classes.schema'
import type { PaginationMeta } from '@silveredge/shared'

export interface ClassListResult {
  classes: IClass[]
  meta: PaginationMeta
}

export interface StudentListResult {
  students: any[]
  meta: PaginationMeta
}

export interface ClassCourse {
  id: string
  name: string
  category: string
  progress: number
}

export function transformCourseToClassCourse(
  course: ICourse,
  progress: number
): ClassCourse {
  return {
    id: course._id.toString(),
    name: course.title,
    category: course.language,
    progress,
  }
}

export async function listClasses(query: ListClassesQuery): Promise<ClassListResult> {
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {}
  if (query.status) {
    filter.status = query.status
  }
  if (query.teacherId) {
    filter.teacherId = new Types.ObjectId(query.teacherId)
  }

  const [classes, total] = await Promise.all([
    Class.find(filter)
      .sort(buildSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .populate('teacherId', 'displayName'),
    Class.countDocuments(filter),
  ])

  return {
    classes,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function getClassById(id: string): Promise<IClass> {
  const classDoc = await Class.findById(id).populate('teacherId', 'displayName')
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }
  return classDoc
}

export async function createClass(input: CreateClassInput): Promise<IClass> {
  const classDoc = await Class.create({
    ...input,
    teacherId: input.teacherId ? new Types.ObjectId(input.teacherId) : undefined,
    courseIds: input.courseIds?.map((id) => new Types.ObjectId(id)) || [],
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    endDate: input.endDate ? new Date(input.endDate) : undefined,
  })

  // Update teacher profile
  if (input.teacherId) {
    await TeacherProfile.findOneAndUpdate(
      { userId: new Types.ObjectId(input.teacherId) },
      { $addToSet: { classIds: classDoc._id } }
    )
  }

  return classDoc
}

export async function updateClass(id: string, input: UpdateClassInput): Promise<IClass> {
  const classDoc = await Class.findById(id)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  // Handle teacher change
  if (input.teacherId !== undefined && input.teacherId !== classDoc.teacherId?.toString()) {
    // Remove from old teacher
    if (classDoc.teacherId) {
      await TeacherProfile.findOneAndUpdate(
        { userId: classDoc.teacherId },
        { $pull: { classIds: classDoc._id } }
      )
    }
    // Add to new teacher
    if (input.teacherId) {
      await TeacherProfile.findOneAndUpdate(
        { userId: new Types.ObjectId(input.teacherId) },
        { $addToSet: { classIds: classDoc._id } }
      )
    }
  }

  const updateData: Record<string, unknown> = { ...input }
  if (input.teacherId !== undefined) {
    updateData.teacherId = input.teacherId ? new Types.ObjectId(input.teacherId) : null
  }
  if (input.startDate !== undefined) {
    updateData.startDate = input.startDate ? new Date(input.startDate) : null
  }
  if (input.endDate !== undefined) {
    updateData.endDate = input.endDate ? new Date(input.endDate) : null
  }

  Object.assign(classDoc, updateData)
  await classDoc.save()

  return classDoc
}

export async function deleteClass(id: string): Promise<void> {
  const classDoc = await Class.findById(id)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  // Archive instead of delete
  classDoc.status = 'archived'
  await classDoc.save()
}

export async function getClassStudents(classId: string, query: ListStudentsQuery): Promise<StudentListResult> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(query, 'displayName')

  const filter: Record<string, unknown> = { _id: { $in: classDoc.studentIds } }

  // Add search filter if provided
  if (query.search) {
    filter.$or = [
      { displayName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ]
  }

  const [students, total] = await Promise.all([
    User.find(filter)
      .sort(buildSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ])

  return {
    students: students.map((s) => s.toJSON()),
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function addStudent(classId: string, studentId: string): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const student = await User.findById(studentId)
  if (!student || student.role !== 'student') {
    throw ApiError.badRequest('Invalid student')
  }

  // Check if already in class
  if (classDoc.studentIds.some((id) => id.toString() === studentId)) {
    throw ApiError.conflict('Student is already in this class')
  }

  // Update student's current class
  const studentProfile = await StudentProfile.findOne({ userId: studentId })
  if (studentProfile?.classId) {
    // Remove from old class
    await Class.findByIdAndUpdate(studentProfile.classId, { $pull: { studentIds: studentId } })
  }

  // Add to new class
  classDoc.studentIds.push(new Types.ObjectId(studentId))
  await classDoc.save()

  // Update student profile
  await StudentProfile.findOneAndUpdate(
    { userId: studentId },
    { classId: classDoc._id }
  )
}

export async function removeStudent(classId: string, studentId: string): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  classDoc.studentIds = classDoc.studentIds.filter((id) => id.toString() !== studentId)
  await classDoc.save()

  // Update student profile
  await StudentProfile.findOneAndUpdate({ userId: studentId, classId: classDoc._id }, { $unset: { classId: 1 } })
}

export async function getClassCourses(classId: string) {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  return Course.find({ _id: { $in: classDoc.courseIds } })
}

export async function addCourse(classId: string, courseId: string): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const course = await Course.findById(courseId)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  if (classDoc.courseIds.some((id) => id.toString() === courseId)) {
    throw ApiError.conflict('Course is already assigned to this class')
  }

  classDoc.courseIds.push(new Types.ObjectId(courseId))
  await classDoc.save()
}

export async function removeCourse(classId: string, courseId: string): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  classDoc.courseIds = classDoc.courseIds.filter((id) => id.toString() !== courseId)
  await classDoc.save()
}

export async function unlockLesson(
  classId: string,
  lessonId: string,
  unlockedBy: string
): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const existing = await LessonUnlock.findOne({ classId, lessonId })
  if (existing) {
    throw ApiError.conflict('Lesson is already unlocked for this class')
  }

  await LessonUnlock.create({
    lessonId: new Types.ObjectId(lessonId),
    classId: new Types.ObjectId(classId),
    unlockedBy: new Types.ObjectId(unlockedBy),
  })
}

export async function lockLesson(classId: string, lessonId: string): Promise<void> {
  await LessonUnlock.deleteOne({
    classId: new Types.ObjectId(classId),
    lessonId: new Types.ObjectId(lessonId),
  })
}

export async function getUnlockedLessons(classId: string) {
  return LessonUnlock.find({ classId: new Types.ObjectId(classId) })
}

export async function archiveClass(id: string): Promise<IClass> {
  const classDoc = await Class.findById(id)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  if (classDoc.status === 'archived') {
    throw ApiError.badRequest('Class is already archived')
  }

  classDoc.status = 'archived'
  await classDoc.save()
  return classDoc
}

export interface ClassStats {
  attendanceRate: number
  avgProgress: number
  lastActivity: string
}

export async function computeClassStats(classDoc: IClass): Promise<ClassStats> {
  // Default values
  let attendanceRate = 0
  let avgProgress = 0
  let lastActivity = 'No activity'

  // If no students, return defaults
  if (classDoc.studentIds.length === 0) {
    return { attendanceRate, avgProgress, lastActivity }
  }

  // Fetch student profiles to compute average progress
  const studentProfiles = await StudentProfile.find({
    userId: { $in: classDoc.studentIds },
  }).select('xp lastActive')

  if (studentProfiles.length > 0) {
    // Calculate average progress based on XP (assuming level 1 = 0-100 XP, level 2 = 100-250 XP, etc.)
    // This is a simplified calculation - can be enhanced based on your XP system
    const totalXP = studentProfiles.reduce((sum, profile) => sum + (profile.xp || 0), 0)
    const avgXP = totalXP / studentProfiles.length

    // Convert XP to progress percentage (0-100%)
    // Assuming 1000 XP = 100% for simplicity - adjust based on your system
    avgProgress = Math.min(Math.round((avgXP / 1000) * 100), 100)

    // Find most recent activity
    const lastActiveDate = studentProfiles
      .map((p) => p.lastActive)
      .filter((date): date is Date => date !== null && date !== undefined)
      .sort((a, b) => b.getTime() - a.getTime())[0]

    if (lastActiveDate) {
      lastActivity = lastActiveDate.toISOString()
    }
  }

  // Calculate attendance rate from actual records (last 30 days)
  try {
    const { Attendance } = await import('../attendance/attendance.model')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const attendanceRecords = await Attendance.find({
      classId: classDoc._id,
      date: { $gte: thirtyDaysAgo },
    })

    if (attendanceRecords.length > 0) {
      const presentOrLate = attendanceRecords.filter(
        (r) => r.status === 'present' || r.status === 'late'
      ).length
      attendanceRate = Math.round((presentOrLate / attendanceRecords.length) * 100)
    }
  } catch (error) {
    // If attendance tracking is not available, keep default 0
    attendanceRate = 0
  }

  return { attendanceRate, avgProgress, lastActivity }
}

export async function calculateCourseProgressForClass(
  classId: string,
  courseId: string
): Promise<number> {
  const classDoc = await Class.findById(classId)
  if (!classDoc || classDoc.studentIds.length === 0) {
    return 0
  }

  const { Section } = await import('../sections/sections.model')
  const { Lesson } = await import('../lessons/lessons.model')
  const { LessonProgress } = await import('../progress/lessonProgress.model')

  // Get all lessons in this course
  const sections = await Section.find({ courseId: new Types.ObjectId(courseId) })
  const lessons = await Lesson.find({
    sectionId: { $in: sections.map((s) => s._id) },
  })

  const totalLessons = lessons.length
  if (totalLessons === 0) {
    return 0
  }

  const lessonIds = lessons.map((l) => l._id)

  // Use aggregation to count completed lessons per student
  const progressByStudent = await LessonProgress.aggregate([
    {
      $match: {
        studentId: { $in: classDoc.studentIds },
        lessonId: { $in: lessonIds },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$studentId',
        completedCount: { $sum: 1 },
      },
    },
  ])

  const completedMap = new Map<string, number>()
  progressByStudent.forEach((item) => {
    completedMap.set(item._id.toString(), item.completedCount)
  })

  let totalProgress = 0
  for (const studentId of classDoc.studentIds) {
    const completedLessons = completedMap.get(studentId.toString()) || 0
    const studentProgress = Math.round((completedLessons / totalLessons) * 100)
    totalProgress += studentProgress
  }

  return Math.round(totalProgress / classDoc.studentIds.length)
}

export async function getClassCoursesWithProgress(classId: string): Promise<ClassCourse[]> {
  const courses = await getClassCourses(classId)

  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      const progress = await calculateCourseProgressForClass(classId, course._id.toString())
      return transformCourseToClassCourse(course, progress)
    })
  )

  return coursesWithProgress.filter((c) => c != null)
}
