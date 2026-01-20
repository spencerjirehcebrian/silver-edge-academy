import { Types } from 'mongoose'
import { Course, type ICourse } from './courses.model'
import { Section } from '../sections/sections.model'
import { Lesson } from '../lessons/lessons.model'
import { Class } from '../classes/classes.model'
import { User } from '../users/users.model'
import { ApiError } from '../../utils/ApiError'
import {
  parsePaginationParams,
  buildPaginationMeta,
  buildSortObject,
} from '../../utils/pagination'
import type { CreateCourseInput, UpdateCourseInput, ListCoursesQuery } from './courses.schema'
import type { PaginationMeta } from '@silveredge/shared'

export interface CourseWithCounts {
  id: string
  title: string
  description?: string
  language: 'javascript' | 'python'
  status: 'draft' | 'published'
  createdBy: string
  createdByName: string
  sectionCount: number
  lessonCount: number
  classCount: number
  createdAt: string
  updatedAt: string
}

export interface CourseListResult {
  courses: CourseWithCounts[]
  meta: PaginationMeta
}

export async function listCourses(query: ListCoursesQuery): Promise<CourseListResult> {
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {}
  if (query.status) {
    filter.status = query.status
  }
  if (query.language) {
    filter.language = query.language
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort(buildSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ])

  // Get creator user IDs for batch lookup
  const creatorIds = [...new Set(courses.map((c) => c.createdBy.toString()))]
  const creators = await User.find({ _id: { $in: creatorIds } }).select('_id displayName')
  const creatorMap = new Map(creators.map((u) => [u._id.toString(), u.displayName]))

  // Get counts for each course
  const coursesWithCounts: CourseWithCounts[] = await Promise.all(
    courses.map(async (course) => {
      const [sectionCount, lessonCount, classCount] = await Promise.all([
        Section.countDocuments({ courseId: course._id }),
        Lesson.countDocuments({
          sectionId: { $in: await Section.find({ courseId: course._id }).distinct('_id') },
        }),
        Class.countDocuments({ courseIds: course._id }),
      ])
      return {
        id: course._id.toString(),
        title: course.title,
        description: course.description,
        language: course.language,
        status: course.status,
        createdBy: course.createdBy.toString(),
        createdByName: creatorMap.get(course.createdBy.toString()) || 'Unknown',
        sectionCount,
        lessonCount,
        classCount,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      }
    })
  )

  return {
    courses: coursesWithCounts,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function getCourseById(id: string) {
  const course = await Course.findById(id)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  // Fetch creator, sections, and class count in parallel
  const [creator, sections, classCount] = await Promise.all([
    User.findById(course.createdBy).select('displayName'),
    Section.find({ courseId: course._id }).sort({ orderIndex: 1 }),
    Class.countDocuments({ courseIds: course._id }),
  ])

  const createdByName = creator?.displayName || 'Unknown'
  const sectionsWithLessons = await Promise.all(
    sections.map(async (section) => {
      const lessons = await Lesson.find({ sectionId: section._id }).sort({ orderIndex: 1 })
      return {
        ...section.toJSON(),
        lessons: lessons.map((l) => l.toJSON()),
        lessonCount: lessons.length,
      }
    })
  )

  return {
    ...course.toJSON(),
    createdByName,
    sections: sectionsWithLessons,
    sectionCount: sections.length,
    lessonCount: sectionsWithLessons.reduce((sum, s) => sum + s.lessonCount, 0),
    classCount,
  }
}

export async function createCourse(input: CreateCourseInput, createdBy: string): Promise<ICourse> {
  return Course.create({
    ...input,
    createdBy: new Types.ObjectId(createdBy),
  })
}

export async function updateCourse(id: string, input: UpdateCourseInput): Promise<ICourse> {
  const course = await Course.findById(id)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  Object.assign(course, input)
  await course.save()
  return course
}

export async function deleteCourse(id: string): Promise<void> {
  const course = await Course.findById(id)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  // Check if course is assigned to any class
  const assignedCount = await Class.countDocuments({ courseIds: course._id })
  if (assignedCount > 0) {
    throw ApiError.conflict('Cannot delete course that is assigned to classes')
  }

  // Delete all sections and lessons
  const sections = await Section.find({ courseId: course._id })
  for (const section of sections) {
    await Lesson.deleteMany({ sectionId: section._id })
  }
  await Section.deleteMany({ courseId: course._id })
  await course.deleteOne()
}

export async function publishCourse(id: string): Promise<ICourse> {
  const course = await Course.findById(id)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  if (course.status === 'published') {
    throw ApiError.badRequest('Course is already published')
  }

  // Check if course has content
  const sectionCount = await Section.countDocuments({ courseId: course._id })
  if (sectionCount === 0) {
    throw ApiError.badRequest('Cannot publish course without sections')
  }

  course.status = 'published'
  await course.save()
  return course
}

export async function unpublishCourse(id: string): Promise<ICourse> {
  const course = await Course.findById(id)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  if (course.status === 'draft') {
    throw ApiError.badRequest('Course is already unpublished')
  }

  course.status = 'draft'
  await course.save()
  return course
}
