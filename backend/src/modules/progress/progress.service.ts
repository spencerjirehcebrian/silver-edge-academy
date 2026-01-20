import { Types } from 'mongoose'
import { LessonProgress } from './lessonProgress.model'
import { ExerciseSubmission } from './exerciseSubmission.model'
import { QuizSubmission } from './quizSubmission.model'
import { StudentProfile } from '../users/studentProfile.model'
import { Lesson } from '../lessons/lessons.model'
import { Section } from '../sections/sections.model'
import { Course } from '../courses/courses.model'
import { Class } from '../classes/classes.model'
import { ApiError } from '../../utils/ApiError'
import { awardXp } from '../../utils/xpTracking'

export interface ProgressSummary {
  totalLessons: number
  completedLessons: number
  inProgressLessons: number
  totalXpEarned: number
  coursesStarted: number
  coursesCompleted: number
}

export interface CourseProgressDetail {
  courseId: string
  courseTitle: string
  totalLessons: number
  completedLessons: number
  progressPercent: number
  lastAccessedAt?: string
}

export async function getStudentProgressSummary(studentId: string): Promise<ProgressSummary> {
  const [completedLessons, inProgressLessons, profile] = await Promise.all([
    LessonProgress.countDocuments({
      studentId: new Types.ObjectId(studentId),
      status: 'completed',
    }),
    LessonProgress.countDocuments({
      studentId: new Types.ObjectId(studentId),
      status: 'in_progress',
    }),
    StudentProfile.findOne({ userId: new Types.ObjectId(studentId) }),
  ])

  // Get student's class courses to calculate total lessons
  const studentProfile = await StudentProfile.findOne({ userId: new Types.ObjectId(studentId) })
  let totalLessons = 0
  let coursesStarted = 0
  let coursesCompleted = 0

  if (studentProfile?.classId) {
    const classDoc = await Class.findById(studentProfile.classId)
    if (classDoc) {
      for (const courseId of classDoc.courseIds) {
        const sections = await Section.find({ courseId })
        let courseLessons = 0
        for (const section of sections) {
          courseLessons += await Lesson.countDocuments({ sectionId: section._id })
        }
        totalLessons += courseLessons

        // Check course progress
        const lessonIds = await Lesson.find({
          sectionId: { $in: sections.map((s) => s._id) },
        }).distinct('_id')

        const courseCompleted = await LessonProgress.countDocuments({
          studentId: new Types.ObjectId(studentId),
          lessonId: { $in: lessonIds },
          status: 'completed',
        })

        if (courseCompleted > 0) {
          coursesStarted++
          if (courseCompleted === courseLessons) {
            coursesCompleted++
          }
        }
      }
    }
  }

  return {
    totalLessons,
    completedLessons,
    inProgressLessons,
    totalXpEarned: profile?.totalXp || 0,
    coursesStarted,
    coursesCompleted,
  }
}

export async function getStudentCourseProgress(
  studentId: string,
  courseId: string
): Promise<CourseProgressDetail> {
  const course = await Course.findById(courseId)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  const sections = await Section.find({ courseId: new Types.ObjectId(courseId) })
  const lessons = await Lesson.find({
    sectionId: { $in: sections.map((s) => s._id) },
  })

  const completedLessons = await LessonProgress.countDocuments({
    studentId: new Types.ObjectId(studentId),
    lessonId: { $in: lessons.map((l) => l._id) },
    status: 'completed',
  })

  const lastProgress = await LessonProgress.findOne({
    studentId: new Types.ObjectId(studentId),
    lessonId: { $in: lessons.map((l) => l._id) },
  }).sort({ updatedAt: -1 })

  return {
    courseId: course._id.toString(),
    courseTitle: course.title,
    totalLessons: lessons.length,
    completedLessons,
    progressPercent: lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
    lastAccessedAt: lastProgress?.updatedAt?.toISOString(),
  }
}

export async function startLesson(lessonId: string, studentId: string) {
  const lesson = await Lesson.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  // Check if progress already exists
  let progress = await LessonProgress.findOne({
    studentId: new Types.ObjectId(studentId),
    lessonId: new Types.ObjectId(lessonId),
  })

  if (progress) {
    // Already started, just return
    return progress
  }

  // Create new progress
  progress = await LessonProgress.create({
    studentId: new Types.ObjectId(studentId),
    lessonId: new Types.ObjectId(lessonId),
    status: 'in_progress',
    startedAt: new Date(),
  })

  // Update last activity date
  await StudentProfile.findOneAndUpdate(
    { userId: new Types.ObjectId(studentId) },
    { lastActivityDate: new Date() }
  )

  return progress
}

export async function completeLesson(lessonId: string, studentId: string) {
  const lesson = await Lesson.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  let progress = await LessonProgress.findOne({
    studentId: new Types.ObjectId(studentId),
    lessonId: new Types.ObjectId(lessonId),
  })

  if (!progress) {
    // Create and complete in one go
    progress = await LessonProgress.create({
      studentId: new Types.ObjectId(studentId),
      lessonId: new Types.ObjectId(lessonId),
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      xpEarned: lesson.xpReward,
    })
  } else if (progress.status !== 'completed') {
    progress.status = 'completed'
    progress.completedAt = new Date()
    progress.xpEarned = lesson.xpReward
    await progress.save()
  } else {
    // Already completed, no XP
    return { progress, xpEarned: 0 }
  }

  // Update student XP
  await awardXp({
    studentId,
    amount: lesson.xpReward,
    source: `Completed Lesson: ${lesson.title}`,
    sourceId: lessonId,
  })

  return { progress, xpEarned: lesson.xpReward }
}

export async function updateLessonTimeSpent(
  lessonId: string,
  studentId: string,
  timeSpentSeconds: number
) {
  const progress = await LessonProgress.findOne({
    studentId: new Types.ObjectId(studentId),
    lessonId: new Types.ObjectId(lessonId),
  })

  if (!progress) {
    throw ApiError.notFound('Lesson progress')
  }

  progress.timeSpentSeconds += timeSpentSeconds
  await progress.save()

  return progress
}

export async function getLessonProgress(lessonId: string, studentId: string) {
  const progress = await LessonProgress.findOne({
    studentId: new Types.ObjectId(studentId),
    lessonId: new Types.ObjectId(lessonId),
  })

  if (!progress) {
    return {
      lessonId,
      status: 'not_started',
      timeSpentSeconds: 0,
      xpEarned: 0,
    }
  }

  // Get exercise and quiz submissions
  const [exerciseSubmissions, quizSubmissions] = await Promise.all([
    ExerciseSubmission.find({
      studentId: new Types.ObjectId(studentId),
      exerciseId: { $in: await getExerciseIdsForLesson(lessonId) },
    }).sort({ submittedAt: -1 }),
    QuizSubmission.find({
      studentId: new Types.ObjectId(studentId),
      lessonId: new Types.ObjectId(lessonId),
    }).sort({ submittedAt: -1 }),
  ])

  return {
    ...progress.toJSON(),
    exerciseSubmissions: exerciseSubmissions.map((s) => s.toJSON()),
    quizSubmissions: quizSubmissions.map((s) => s.toJSON()),
  }
}

async function getExerciseIdsForLesson(lessonId: string): Promise<Types.ObjectId[]> {
  const { Exercise } = await import('../exercises/exercises.model')
  const exercises = await Exercise.find({ lessonId: new Types.ObjectId(lessonId) })
  return exercises.map((e) => e._id)
}
