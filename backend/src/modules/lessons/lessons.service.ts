import { Types } from 'mongoose'
import { Lesson, type ILesson } from './lessons.model'
import { Section } from '../sections/sections.model'
import { Exercise } from '../exercises/exercises.model'
import { Quiz } from '../quizzes/quizzes.model'
import { ApiError } from '../../utils/ApiError'
import { LESSON_LOCK_TIMEOUT_MINUTES } from '@silveredge/shared'
import type { CreateLessonInput, UpdateLessonInput } from './lessons.schema'

export async function listLessons(sectionId: string): Promise<ILesson[]> {
  return Lesson.find({ sectionId: new Types.ObjectId(sectionId) }).sort({ orderIndex: 1 })
}

export async function getLessonById(sectionId: string, lessonId: string) {
  const lesson = await Lesson.findOne({
    _id: new Types.ObjectId(lessonId),
    sectionId: new Types.ObjectId(sectionId),
  })
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  // Get exercises and quiz
  const [exercises, quiz] = await Promise.all([
    Exercise.find({ lessonId: lesson._id }).sort({ orderIndex: 1 }),
    Quiz.findOne({ lessonId: lesson._id }),
  ])

  return {
    ...lesson.toJSON(),
    exercises: exercises.map((e) => e.toJSON()),
    quiz: quiz?.questions || [],
  }
}

export async function createLesson(
  sectionId: string,
  input: CreateLessonInput
): Promise<ILesson> {
  const section = await Section.findById(sectionId)
  if (!section) {
    throw ApiError.notFound('Section')
  }

  // Get max order index
  let orderIndex = input.orderIndex
  if (orderIndex === undefined) {
    const maxLesson = await Lesson.findOne({ sectionId: new Types.ObjectId(sectionId) })
      .sort({ orderIndex: -1 })
      .select('orderIndex')
    orderIndex = maxLesson ? maxLesson.orderIndex + 1 : 0
  }

  return Lesson.create({
    ...input,
    sectionId: new Types.ObjectId(sectionId),
    orderIndex,
  })
}

export async function updateLesson(
  sectionId: string,
  lessonId: string,
  input: UpdateLessonInput
): Promise<ILesson> {
  const lesson = await Lesson.findOne({
    _id: new Types.ObjectId(lessonId),
    sectionId: new Types.ObjectId(sectionId),
  })
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  Object.assign(lesson, input)
  await lesson.save()
  return lesson
}

export async function deleteLesson(sectionId: string, lessonId: string): Promise<void> {
  const lesson = await Lesson.findOne({
    _id: new Types.ObjectId(lessonId),
    sectionId: new Types.ObjectId(sectionId),
  })
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  // Delete exercises and quizzes
  await Promise.all([
    Exercise.deleteMany({ lessonId: lesson._id }),
    Quiz.deleteMany({ lessonId: lesson._id }),
  ])

  await lesson.deleteOne()

  // Reorder remaining lessons
  await Lesson.updateMany(
    { sectionId: new Types.ObjectId(sectionId), orderIndex: { $gt: lesson.orderIndex } },
    { $inc: { orderIndex: -1 } }
  )
}

export async function reorderLessons(sectionId: string, lessonIds: string[]): Promise<void> {
  const section = await Section.findById(sectionId)
  if (!section) {
    throw ApiError.notFound('Section')
  }

  // Verify all lessons belong to this section
  const lessons = await Lesson.find({ sectionId: new Types.ObjectId(sectionId) })
  const existingIds = new Set(lessons.map((l) => l._id.toString()))

  for (const id of lessonIds) {
    if (!existingIds.has(id)) {
      throw ApiError.badRequest(`Lesson ${id} does not belong to this section`)
    }
  }

  // Update order indexes
  await Promise.all(
    lessonIds.map((id, index) => Lesson.findByIdAndUpdate(id, { orderIndex: index }))
  )
}

export async function acquireLock(lessonId: string, userId: string): Promise<ILesson> {
  const lesson = await Lesson.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  // Check if already locked by someone else
  if (lesson.lockedBy && lesson.lockedBy.toString() !== userId) {
    const lockAge = lesson.lockedAt
      ? (Date.now() - lesson.lockedAt.getTime()) / 1000 / 60
      : 0

    if (lockAge < LESSON_LOCK_TIMEOUT_MINUTES) {
      throw ApiError.conflict('Lesson is currently being edited by another user')
    }
  }

  lesson.lockedBy = new Types.ObjectId(userId)
  lesson.lockedAt = new Date()
  await lesson.save()

  return lesson
}

export async function releaseLock(lessonId: string, userId: string): Promise<void> {
  const lesson = await Lesson.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  // Only the lock owner can release (or admin via force release)
  if (lesson.lockedBy && lesson.lockedBy.toString() !== userId) {
    throw ApiError.forbidden('You do not own this lock')
  }

  lesson.lockedBy = undefined
  lesson.lockedAt = undefined
  await lesson.save()
}
