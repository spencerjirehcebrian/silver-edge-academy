import { Types } from 'mongoose'
import { Exercise, type IExercise } from './exercises.model'
import { ExerciseSubmission } from '../progress/exerciseSubmission.model'
import { Lesson } from '../lessons/lessons.model'
import { ApiError } from '../../utils/ApiError'
import type { CreateExerciseInput, UpdateExerciseInput, SubmitExerciseInput } from './exercises.schema'
import { awardXp } from '../../utils/xpTracking'

export async function listExercises(lessonId: string): Promise<IExercise[]> {
  return Exercise.find({ lessonId: new Types.ObjectId(lessonId) }).sort({ orderIndex: 1 })
}

export async function getExerciseById(lessonId: string, exerciseId: string): Promise<IExercise> {
  const exercise = await Exercise.findOne({
    _id: new Types.ObjectId(exerciseId),
    lessonId: new Types.ObjectId(lessonId),
  })
  if (!exercise) {
    throw ApiError.notFound('Exercise')
  }
  return exercise
}

export async function createExercise(
  lessonId: string,
  input: CreateExerciseInput
): Promise<IExercise> {
  const lesson = await Lesson.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  // Get max order index
  let orderIndex = input.orderIndex
  if (orderIndex === undefined) {
    const maxExercise = await Exercise.findOne({ lessonId: new Types.ObjectId(lessonId) })
      .sort({ orderIndex: -1 })
      .select('orderIndex')
    orderIndex = maxExercise ? maxExercise.orderIndex + 1 : 0
  }

  return Exercise.create({
    ...input,
    lessonId: new Types.ObjectId(lessonId),
    orderIndex,
  })
}

export async function updateExercise(
  lessonId: string,
  exerciseId: string,
  input: UpdateExerciseInput
): Promise<IExercise> {
  const exercise = await Exercise.findOne({
    _id: new Types.ObjectId(exerciseId),
    lessonId: new Types.ObjectId(lessonId),
  })
  if (!exercise) {
    throw ApiError.notFound('Exercise')
  }

  Object.assign(exercise, input)
  await exercise.save()
  return exercise
}

export async function deleteExercise(lessonId: string, exerciseId: string): Promise<void> {
  const exercise = await Exercise.findOne({
    _id: new Types.ObjectId(exerciseId),
    lessonId: new Types.ObjectId(lessonId),
  })
  if (!exercise) {
    throw ApiError.notFound('Exercise')
  }

  await exercise.deleteOne()

  // Reorder remaining exercises
  await Exercise.updateMany(
    { lessonId: new Types.ObjectId(lessonId), orderIndex: { $gt: exercise.orderIndex } },
    { $inc: { orderIndex: -1 } }
  )
}

export async function submitExercise(
  exerciseId: string,
  studentId: string,
  input: SubmitExerciseInput
) {
  const exercise = await Exercise.findById(exerciseId)
  if (!exercise) {
    throw ApiError.notFound('Exercise')
  }

  // Calculate if passed (all tests passed)
  const passed = input.testResults.every((t) => t.passed)

  // Check if this is the first successful submission
  const previousSubmissions = await ExerciseSubmission.find({
    studentId: new Types.ObjectId(studentId),
    exerciseId: new Types.ObjectId(exerciseId),
    passed: true,
  }).limit(1)
  const isFirstSuccess = previousSubmissions.length === 0

  // Calculate XP (only on first successful submission)
  const xpEarned = passed && isFirstSuccess ? exercise.xpReward : 0

  // Create submission
  const submission = await ExerciseSubmission.create({
    studentId: new Types.ObjectId(studentId),
    exerciseId: new Types.ObjectId(exerciseId),
    code: input.code,
    passed,
    testResults: input.testResults,
    xpEarned,
  })

  // Update student profile if XP earned
  if (xpEarned > 0) {
    await awardXp({
      studentId,
      amount: xpEarned,
      source: `Completed Exercise: ${exercise.title}`,
      sourceId: exerciseId,
    })
  }

  return {
    submission: submission.toJSON(),
    passed,
    xpEarned,
    testResults: input.testResults,
  }
}

export async function getExerciseSubmissions(exerciseId: string, studentId?: string) {
  const filter: Record<string, unknown> = { exerciseId: new Types.ObjectId(exerciseId) }
  if (studentId) {
    filter.studentId = new Types.ObjectId(studentId)
  }

  return ExerciseSubmission.find(filter)
    .sort({ submittedAt: -1 })
    .limit(10)
    .populate('studentId', 'displayName username')
}
