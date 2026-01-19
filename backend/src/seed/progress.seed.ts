import { LessonProgress } from '../modules/progress/lessonProgress.model'
import { Lesson } from '../modules/lessons/lessons.model'
import { Section } from '../modules/sections/sections.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'
import type { SeededCourses } from './courses.seed'

export async function seedProgress(
  users: SeededUsers,
  courses: SeededCourses
): Promise<void> {
  logger.info('Seeding progress data...')

  // Get all lessons for JavaScript course
  const jsSections = await Section.find({ courseId: courses.javascript })
  const jsLessons = await Lesson.find({
    sectionId: { $in: jsSections.map((s) => s._id) },
  })

  // Get all lessons for Python course
  const pySections = await Section.find({ courseId: courses.python })
  const pyLessons = await Lesson.find({
    sectionId: { $in: pySections.map((s) => s._id) },
  })

  const progressRecords = []

  // Helper function for timestamps
  const daysAgo = (days: number, hours: number = 0) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000)

  // ==========================================
  // JAVASCRIPT STUDENTS
  // ==========================================

  // HIGH PERFORMER: liam_js (level 7) - Fast progress, completed 8 lessons
  const liamId = users.students[2]
  for (let i = 0; i < Math.min(8, jsLessons.length); i++) {
    const lesson = jsLessons[i]
    progressRecords.push({
      studentId: liamId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(8 - i, 2),
      completedAt: daysAgo(8 - i, 1),
      timeSpentSeconds: 300 + Math.floor(Math.random() * 300), // 5-10 min (fast)
      xpEarned: lesson.xpReward,
    })
  }

  // STRUGGLING STUDENT: emma_dev (level 3) - Slow progress, completed 4 lessons
  const emmaId = users.students[1]
  for (let i = 0; i < Math.min(4, jsLessons.length); i++) {
    const lesson = jsLessons[i]
    progressRecords.push({
      studentId: emmaId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(9 - i * 2, 5),
      completedAt: daysAgo(9 - i * 2, 2),
      timeSpentSeconds: 1800 + Math.floor(Math.random() * 1200), // 30-50 min (slow)
      xpEarned: lesson.xpReward,
    })
  }
  // Emma has one in-progress lesson
  if (jsLessons.length > 4) {
    progressRecords.push({
      studentId: emmaId,
      lessonId: jsLessons[4]._id,
      status: 'in_progress',
      startedAt: daysAgo(1, 3),
      timeSpentSeconds: 900,
      xpEarned: 0,
    })
  }

  // AVERAGE STUDENT: noah_code (level 4) - Steady progress, completed 5 lessons
  const noahId = users.students[4]
  for (let i = 0; i < Math.min(5, jsLessons.length); i++) {
    const lesson = jsLessons[i]
    progressRecords.push({
      studentId: noahId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(7 - i, 8),
      completedAt: daysAgo(7 - i, 6),
      timeSpentSeconds: 900 + Math.floor(Math.random() * 600), // 15-25 min (average)
      xpEarned: lesson.xpReward,
    })
  }

  // HIGH PERFORMER: sophia_js (level 8) - Completed 10 lessons
  const sophiaId = users.students[7]
  for (let i = 0; i < Math.min(10, jsLessons.length); i++) {
    const lesson = jsLessons[i]
    progressRecords.push({
      studentId: sophiaId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(6 - Math.floor(i / 2), 3),
      completedAt: daysAgo(6 - Math.floor(i / 2), 2),
      timeSpentSeconds: 300 + Math.floor(Math.random() * 200), // 5-8 min (very fast)
      xpEarned: lesson.xpReward,
    })
  }
  // Sophia has one in-progress lesson
  if (jsLessons.length > 10) {
    progressRecords.push({
      studentId: sophiaId,
      lessonId: jsLessons[10]._id,
      status: 'in_progress',
      startedAt: daysAgo(0, 2),
      timeSpentSeconds: 180,
      xpEarned: 0,
    })
  }

  // AVERAGE STUDENT: alex_coder (level 5) - Completed 6 lessons
  const alexId = users.students[0]
  for (let i = 0; i < Math.min(6, jsLessons.length); i++) {
    const lesson = jsLessons[i]
    progressRecords.push({
      studentId: alexId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(7 - i, 10),
      completedAt: daysAgo(7 - i, 8),
      timeSpentSeconds: 1000 + Math.floor(Math.random() * 500), // 17-25 min
      xpEarned: lesson.xpReward,
    })
  }

  // STRUGGLING STUDENT: william_dev (level 1) - Completed only 2 lessons
  const williamId = users.students[6]
  for (let i = 0; i < Math.min(2, jsLessons.length); i++) {
    const lesson = jsLessons[i]
    progressRecords.push({
      studentId: williamId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(10 - i * 3, 6),
      completedAt: daysAgo(10 - i * 3, 2),
      timeSpentSeconds: 2400 + Math.floor(Math.random() * 1200), // 40-60 min (very slow)
      xpEarned: lesson.xpReward,
    })
  }

  // AVERAGE STUDENT: isabella_code (level 5) - Completed 6 lessons
  const isabellaId = users.students[9]
  for (let i = 0; i < Math.min(6, jsLessons.length); i++) {
    const lesson = jsLessons[i]
    progressRecords.push({
      studentId: isabellaId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(8 - i, 5),
      completedAt: daysAgo(8 - i, 3),
      timeSpentSeconds: 900 + Math.floor(Math.random() * 600), // 15-25 min
      xpEarned: lesson.xpReward,
    })
  }

  // ==========================================
  // PYTHON STUDENTS
  // ==========================================

  // HIGH PERFORMER: ava_tech (level 6) - Completed 7 lessons
  const avaId = users.students[5]
  for (let i = 0; i < Math.min(7, pyLessons.length); i++) {
    const lesson = pyLessons[i]
    progressRecords.push({
      studentId: avaId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(7 - i, 4),
      completedAt: daysAgo(7 - i, 3),
      timeSpentSeconds: 400 + Math.floor(Math.random() * 300), // 7-12 min (fast)
      xpEarned: lesson.xpReward,
    })
  }
  // Ava has one in-progress lesson
  if (pyLessons.length > 7) {
    progressRecords.push({
      studentId: avaId,
      lessonId: pyLessons[7]._id,
      status: 'in_progress',
      startedAt: daysAgo(0, 3),
      timeSpentSeconds: 240,
      xpEarned: 0,
    })
  }

  // STRUGGLING STUDENT: olivia_py (level 2) - Completed only 3 lessons
  const oliviaId = users.students[3]
  for (let i = 0; i < Math.min(3, pyLessons.length); i++) {
    const lesson = pyLessons[i]
    progressRecords.push({
      studentId: oliviaId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(9 - i * 2, 7),
      completedAt: daysAgo(9 - i * 2, 4),
      timeSpentSeconds: 2000 + Math.floor(Math.random() * 1000), // 33-50 min (slow)
      xpEarned: lesson.xpReward,
    })
  }

  // AVERAGE STUDENT: james_py (level 3) - Completed 4 lessons
  const jamesId = users.students[8]
  for (let i = 0; i < Math.min(4, pyLessons.length); i++) {
    const lesson = pyLessons[i]
    progressRecords.push({
      studentId: jamesId,
      lessonId: lesson._id,
      status: 'completed',
      startedAt: daysAgo(8 - i * 2, 9),
      completedAt: daysAgo(8 - i * 2, 7),
      timeSpentSeconds: 1100 + Math.floor(Math.random() * 500), // 18-27 min
      xpEarned: lesson.xpReward,
    })
  }
  // James has one in-progress lesson
  if (pyLessons.length > 4) {
    progressRecords.push({
      studentId: jamesId,
      lessonId: pyLessons[4]._id,
      status: 'in_progress',
      startedAt: daysAgo(1, 5),
      timeSpentSeconds: 600,
      xpEarned: 0,
    })
  }

  // Create all progress records
  if (progressRecords.length > 0) {
    await LessonProgress.insertMany(progressRecords)
  }

  logger.info(`Created ${progressRecords.length} lesson progress records with realistic patterns`)
}
