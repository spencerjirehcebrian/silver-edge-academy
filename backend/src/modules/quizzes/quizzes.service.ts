import { Types } from 'mongoose'
import { Quiz, type IQuiz } from './quizzes.model'
import { QuizSubmission } from '../progress/quizSubmission.model'
import { Lesson } from '../lessons/lessons.model'
import { ApiError } from '../../utils/ApiError'
import type { CreateQuizInput, UpdateQuizInput, SubmitQuizInput } from './quizzes.schema'
import { awardXp } from '../../utils/xpTracking'

export async function listQuizzes(lessonId: string): Promise<IQuiz[]> {
  return Quiz.find({ lessonId: new Types.ObjectId(lessonId) })
}

export async function getQuizById(lessonId: string, quizId: string): Promise<IQuiz> {
  const quiz = await Quiz.findOne({
    _id: new Types.ObjectId(quizId),
    lessonId: new Types.ObjectId(lessonId),
  })
  if (!quiz) {
    throw ApiError.notFound('Quiz')
  }
  return quiz
}

export async function createQuiz(lessonId: string, input: CreateQuizInput): Promise<IQuiz> {
  const lesson = await Lesson.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  // Check if lesson already has a quiz
  const existingQuiz = await Quiz.findOne({ lessonId: new Types.ObjectId(lessonId) })
  if (existingQuiz) {
    throw ApiError.conflict('Lesson already has a quiz')
  }

  return Quiz.create({
    ...input,
    lessonId: new Types.ObjectId(lessonId),
  })
}

export async function updateQuiz(
  lessonId: string,
  quizId: string,
  input: UpdateQuizInput
): Promise<IQuiz> {
  const quiz = await Quiz.findOne({
    _id: new Types.ObjectId(quizId),
    lessonId: new Types.ObjectId(lessonId),
  })
  if (!quiz) {
    throw ApiError.notFound('Quiz')
  }

  Object.assign(quiz, input)
  await quiz.save()
  return quiz
}

export async function deleteQuiz(lessonId: string, quizId: string): Promise<void> {
  const quiz = await Quiz.findOne({
    _id: new Types.ObjectId(quizId),
    lessonId: new Types.ObjectId(lessonId),
  })
  if (!quiz) {
    throw ApiError.notFound('Quiz')
  }

  await quiz.deleteOne()
}

export async function submitQuiz(quizId: string, studentId: string, input: SubmitQuizInput) {
  const quiz = await Quiz.findById(quizId)
  if (!quiz) {
    throw ApiError.notFound('Quiz')
  }

  // Grade the quiz
  const results = input.answers.map((answer) => {
    const question = quiz.questions.find((q) => q.id === answer.questionId)
    const isCorrect = question ? question.correctIndex === answer.selectedIndex : false
    return {
      questionId: answer.questionId,
      selectedIndex: answer.selectedIndex,
      isCorrect,
      correctIndex: question?.correctIndex ?? -1,
    }
  })

  const score = results.filter((r) => r.isCorrect).length
  const maxScore = quiz.questions.length
  const passed = score >= maxScore * 0.7 // 70% pass threshold

  // Check if this is the first successful submission
  const previousSubmissions = await QuizSubmission.find({
    studentId: new Types.ObjectId(studentId),
    quizId: new Types.ObjectId(quizId),
    passed: true,
  }).limit(1)
  const isFirstSuccess = previousSubmissions.length === 0

  // Calculate XP (only on first successful submission)
  const xpEarned = passed && isFirstSuccess ? quiz.xpReward : 0

  // Create submission
  const submission = await QuizSubmission.create({
    studentId: new Types.ObjectId(studentId),
    lessonId: quiz.lessonId,
    quizId: new Types.ObjectId(quizId),
    answers: results.map((r) => ({
      questionId: r.questionId,
      selectedIndex: r.selectedIndex,
      isCorrect: r.isCorrect,
    })),
    score,
    maxScore,
    passed,
    xpEarned,
  })

  // Update student profile if XP earned
  if (xpEarned > 0) {
    await awardXp({
      studentId,
      amount: xpEarned,
      source: `Passed Quiz: ${quiz.title}`,
      sourceId: quizId,
    })
  }

  return {
    submission: submission.toJSON(),
    score,
    maxScore,
    passed,
    xpEarned,
    results: results.map((r) => ({
      questionId: r.questionId,
      isCorrect: r.isCorrect,
      correctIndex: r.correctIndex,
    })),
  }
}

export async function getQuizResults(quizId: string, studentId?: string) {
  const filter: Record<string, unknown> = { quizId: new Types.ObjectId(quizId) }
  if (studentId) {
    filter.studentId = new Types.ObjectId(studentId)
  }

  return QuizSubmission.find(filter)
    .sort({ submittedAt: -1 })
    .limit(10)
    .populate('studentId', 'displayName username')
}
