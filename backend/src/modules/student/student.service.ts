import { Types } from 'mongoose'
import { User } from '../users/users.model'
import { StudentProfile } from '../users/studentProfile.model'
import { Class } from '../classes/classes.model'
import { Course } from '../courses/courses.model'
import { Section } from '../sections/sections.model'
import { Lesson } from '../lessons/lessons.model'
import { Exercise } from '../exercises/exercises.model'
import { Quiz } from '../quizzes/quizzes.model'
import { LessonProgress } from '../progress/lessonProgress.model'
import { ExerciseSubmission } from '../progress/exerciseSubmission.model'
import { QuizSubmission } from '../progress/quizSubmission.model'
import { Badge, StudentBadge } from '../badges/badges.model'
import { ShopItem, Purchase } from '../shop/shop.model'
import { RefreshToken } from '../auth/refreshToken.model'
import { ApiError } from '../../utils/ApiError'
import { comparePassword } from '../../utils/password'
import { awardXp } from '../../utils/xpTracking'
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiry,
} from '../../utils/tokens'
import { config } from '../../config'
import type {
  StudentLoginInput,
  UpdateProfileInput,
  SubmitExerciseInput,
  SubmitQuizInput,
  EquipItemInput,
  XpHistoryQuery,
} from './student.schema'
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination'

// ============================================================================
// Auth Service
// ============================================================================

export interface StudentAuthResponse {
  id: string
  displayName: string
  username: string
  email: string
  role: 'student'
  avatarId: string | null
  status: string
  currentLevel: number
  totalXp: number
  currencyBalance: number
  currentStreakDays: number
  classId?: string
  className?: string
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
    editorTheme?: string
    fontSize?: number
  }
  accessToken: string
  refreshToken: string
}

export async function studentLogin(input: StudentLoginInput): Promise<StudentAuthResponse> {
  const { username, password } = input

  const user = await User.findOne({ username: username.toLowerCase() })
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials')
  }

  if (user.role !== 'student') {
    throw ApiError.forbidden('This login is for students only')
  }

  if (user.status !== 'active') {
    throw ApiError.unauthorized('Account is inactive')
  }

  const isValidPassword = await comparePassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw ApiError.unauthorized('Invalid credentials')
  }

  user.lastLoginAt = new Date()
  await user.save()

  const profile = await StudentProfile.findOne({ userId: user._id })
  let className: string | undefined

  if (profile?.classId) {
    const classDoc = await Class.findById(profile.classId)
    className = classDoc?.name
  }

  const tokenPayload = { userId: user._id.toString(), role: user.role }
  const accessToken = generateAccessToken(tokenPayload)
  const refreshToken = generateRefreshToken(tokenPayload)

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: getTokenExpiry(config.jwt.refreshExpiresIn),
  })

  return {
    id: user._id.toString(),
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    role: 'student',
    avatarId: user.avatarId || null,
    status: user.status,
    currentLevel: profile?.currentLevel || 1,
    totalXp: profile?.totalXp || 0,
    currencyBalance: profile?.currencyBalance || 0,
    currentStreakDays: profile?.currentStreakDays || 0,
    classId: profile?.classId?.toString(),
    className,
    preferences: profile?.preferences,
    accessToken,
    refreshToken,
  }
}

export async function studentLogout(refreshToken?: string): Promise<void> {
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken })
  }
}

export async function getStudentMe(userId: string): Promise<Omit<StudentAuthResponse, 'accessToken' | 'refreshToken'>> {
  const user = await User.findById(userId)
  if (!user || user.role !== 'student') {
    throw ApiError.notFound('Student')
  }

  const profile = await StudentProfile.findOne({ userId: user._id })
  let className: string | undefined

  if (profile?.classId) {
    const classDoc = await Class.findById(profile.classId)
    className = classDoc?.name
  }

  return {
    id: user._id.toString(),
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    role: 'student',
    avatarId: user.avatarId || null,
    status: user.status,
    currentLevel: profile?.currentLevel || 1,
    totalXp: profile?.totalXp || 0,
    currencyBalance: profile?.currencyBalance || 0,
    currentStreakDays: profile?.currentStreakDays || 0,
    classId: profile?.classId?.toString(),
    className,
    preferences: profile?.preferences,
  }
}

// ============================================================================
// Dashboard Service
// ============================================================================

export interface DashboardResponse {
  user: {
    displayName: string
    username: string
    avatarId: string | null
    currentLevel: number
    totalXp: number
    xpForNextLevel: number
    xpProgress: number
    currencyBalance: number
    currentStreakDays: number
  }
  activeCourses: {
    id: string
    title: string
    language: 'javascript' | 'python'
    currentSection: string
    currentLessonId: string
    progressPercent: number
    lessonsCompleted: number
    totalLessons: number
  }[]
  recentBadges: {
    id: string
    name: string
    description: string
    iconUrl: string
    earnedAt: string
  }[]
  stats: {
    lessonsCompleted: number
    exercisesPassed: number
    quizzesPassed: number
  }
  nextBadge?: {
    name: string
    progress: number
    target: number
  }
}

function calculateXpForLevel(level: number): number {
  // Simple formula: each level requires more XP
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export async function getStudentDashboard(userId: string): Promise<DashboardResponse> {
  const user = await User.findById(userId)
  if (!user || user.role !== 'student') {
    throw ApiError.notFound('Student')
  }

  const profile = await StudentProfile.findOne({ userId: user._id })
  if (!profile) {
    throw ApiError.notFound('Student profile')
  }

  // Calculate XP progress
  const currentLevelXp = calculateXpForLevel(profile.currentLevel)
  const nextLevelXp = calculateXpForLevel(profile.currentLevel + 1)
  const xpInCurrentLevel = profile.totalXp - currentLevelXp
  const xpForNextLevel = nextLevelXp - currentLevelXp
  const xpProgress = Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100))

  // Get active courses from class
  const activeCourses: DashboardResponse['activeCourses'] = []
  if (profile.classId) {
    const classDoc = await Class.findById(profile.classId)
    if (classDoc) {
      for (const courseId of classDoc.courseIds) {
        const course = await Course.findById(courseId)
        if (!course || course.status !== 'published') continue

        const sections = await Section.find({ courseId }).sort({ orderIndex: 1 })
        const lessons = await Lesson.find({
          sectionId: { $in: sections.map((s) => s._id) },
        })

        const completedLessons = await LessonProgress.countDocuments({
          studentId: new Types.ObjectId(userId),
          lessonId: { $in: lessons.map((l) => l._id) },
          status: 'completed',
        })

        // Find current lesson (first incomplete)
        let currentLessonId = ''
        let currentSection = ''
        for (const section of sections) {
          const sectionLessons = await Lesson.find({ sectionId: section._id }).sort({ orderIndex: 1 })
          for (const lesson of sectionLessons) {
            const progress = await LessonProgress.findOne({
              studentId: new Types.ObjectId(userId),
              lessonId: lesson._id,
            })
            if (!progress || progress.status !== 'completed') {
              currentLessonId = lesson._id.toString()
              currentSection = section.title
              break
            }
          }
          if (currentLessonId) break
        }

        if (!currentLessonId && lessons.length > 0) {
          currentLessonId = lessons[lessons.length - 1]._id.toString()
          currentSection = sections[sections.length - 1]?.title || ''
        }

        activeCourses.push({
          id: course._id.toString(),
          title: course.title,
          language: course.language,
          currentSection,
          currentLessonId,
          progressPercent: lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
          lessonsCompleted: completedLessons,
          totalLessons: lessons.length,
        })
      }
    }
  }

  // Get recent badges
  const recentStudentBadges = await StudentBadge.find({ studentId: new Types.ObjectId(userId) })
    .sort({ earnedAt: -1 })
    .limit(5)

  const badgeIds = recentStudentBadges.map((sb) => sb.badgeId)
  const badges = await Badge.find({ _id: { $in: badgeIds } })
  const badgeMap = new Map(badges.map((b) => [b._id.toString(), b]))

  const recentBadges = recentStudentBadges.map((sb) => {
    const badge = badgeMap.get(sb.badgeId.toString())
    return {
      id: sb.badgeId.toString(),
      name: badge?.name || 'Unknown Badge',
      description: badge?.description || '',
      iconUrl: badge?.iconName || '',
      earnedAt: sb.earnedAt.toISOString(),
    }
  })

  // Get stats
  const [lessonsCompleted, exercisesPassed, quizzesPassed] = await Promise.all([
    LessonProgress.countDocuments({
      studentId: new Types.ObjectId(userId),
      status: 'completed',
    }),
    ExerciseSubmission.countDocuments({
      studentId: new Types.ObjectId(userId),
      passed: true,
    }),
    QuizSubmission.countDocuments({
      studentId: new Types.ObjectId(userId),
      passed: true,
    }),
  ])

  // Find next badge to earn
  const earnedBadgeIds = (await StudentBadge.find({ studentId: new Types.ObjectId(userId) })).map((sb) =>
    sb.badgeId.toString()
  )
  const unearnedBadges = await Badge.find({
    _id: { $nin: earnedBadgeIds },
    isActive: true,
  })
    .sort({ triggerValue: 1 })
    .limit(1)

  let nextBadge: DashboardResponse['nextBadge']
  if (unearnedBadges.length > 0) {
    const badge = unearnedBadges[0]
    nextBadge = {
      name: badge.name,
      progress: profile.totalXp,
      target: badge.triggerValue || 0,
    }
  }

  return {
    user: {
      displayName: user.displayName,
      username: user.username,
      avatarId: user.avatarId || null,
      currentLevel: profile.currentLevel,
      totalXp: profile.totalXp,
      xpForNextLevel,
      xpProgress,
      currencyBalance: profile.currencyBalance,
      currentStreakDays: profile.currentStreakDays,
    },
    activeCourses,
    recentBadges,
    stats: {
      lessonsCompleted,
      exercisesPassed,
      quizzesPassed,
    },
    nextBadge,
  }
}

// ============================================================================
// Course Service
// ============================================================================

export interface StudentCourseListItem {
  id: string
  title: string
  language: 'javascript' | 'python'
  description?: string
  progressPercent: number
  lessonsCompleted: number
  totalLessons: number
  isAssigned: boolean
}

export async function getStudentCourses(userId: string): Promise<StudentCourseListItem[]> {
  const profile = await StudentProfile.findOne({ userId: new Types.ObjectId(userId) })
  if (!profile?.classId) {
    return []
  }

  const classDoc = await Class.findById(profile.classId)
  if (!classDoc) {
    return []
  }

  const courses: StudentCourseListItem[] = []
  for (const courseId of classDoc.courseIds) {
    const course = await Course.findById(courseId)
    if (!course || course.status !== 'published') continue

    const sections = await Section.find({ courseId })
    const lessons = await Lesson.find({
      sectionId: { $in: sections.map((s) => s._id) },
    })

    const completedLessons = await LessonProgress.countDocuments({
      studentId: new Types.ObjectId(userId),
      lessonId: { $in: lessons.map((l) => l._id) },
      status: 'completed',
    })

    courses.push({
      id: course._id.toString(),
      title: course.title,
      language: course.language,
      description: course.description,
      progressPercent: lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
      lessonsCompleted: completedLessons,
      totalLessons: lessons.length,
      isAssigned: true,
    })
  }

  return courses
}

export interface StudentCourseMap {
  id: string
  title: string
  language: 'javascript' | 'python'
  description?: string
  sections: {
    id: string
    title: string
    orderIndex: number
    lessons: {
      id: string
      sectionId: string
      title: string
      orderIndex: number
      status: 'completed' | 'current' | 'available' | 'locked'
      xpReward: number
    }[]
    status: 'completed' | 'in_progress' | 'locked'
    completedCount: number
    totalCount: number
  }[]
  progressPercent: number
}

export async function getStudentCourseMap(userId: string, courseId: string): Promise<StudentCourseMap> {
  const course = await Course.findById(courseId)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  // Verify student has access
  const profile = await StudentProfile.findOne({ userId: new Types.ObjectId(userId) })
  if (profile?.classId) {
    const classDoc = await Class.findById(profile.classId)
    if (!classDoc?.courseIds.some((id) => id.toString() === courseId)) {
      throw ApiError.forbidden('You do not have access to this course')
    }
  } else {
    throw ApiError.forbidden('You are not enrolled in a class')
  }

  const sections = await Section.find({ courseId: new Types.ObjectId(courseId) }).sort({ orderIndex: 1 })

  let foundCurrent = false
  let totalCompleted = 0
  let totalLessons = 0

  const sectionsData: typeof sections extends (infer _T)[]
    ? {
        id: string
        title: string
        orderIndex: number
        lessons: {
          id: string
          sectionId: string
          title: string
          orderIndex: number
          status: 'completed' | 'current' | 'available' | 'locked'
          xpReward: number
        }[]
        status: 'completed' | 'in_progress' | 'locked'
        completedCount: number
        totalCount: number
      }[]
    : never = []

  for (const section of sections) {
    const lessons = await Lesson.find({ sectionId: section._id }).sort({ orderIndex: 1 })
    let sectionCompleted = 0

    const lessonsData: {
      id: string
      sectionId: string
      title: string
      orderIndex: number
      status: 'completed' | 'current' | 'available' | 'locked'
      xpReward: number
    }[] = []

    // Process lessons sequentially to maintain order for foundCurrent logic
    for (const lesson of lessons) {
      const progress = await LessonProgress.findOne({
        studentId: new Types.ObjectId(userId),
        lessonId: lesson._id,
      })

      let status: 'completed' | 'current' | 'available' | 'locked'
      if (progress?.status === 'completed') {
        status = 'completed'
        sectionCompleted++
        totalCompleted++
      } else if (!foundCurrent) {
        status = 'current'
        foundCurrent = true
      } else {
        status = 'available' // For now, all lessons are available (no locking)
      }

      totalLessons++

      lessonsData.push({
        id: lesson._id.toString(),
        sectionId: section._id.toString(),
        title: lesson.title,
        orderIndex: lesson.orderIndex,
        status,
        xpReward: lesson.xpReward,
      })
    }

    let sectionStatus: 'completed' | 'in_progress' | 'locked'
    if (sectionCompleted === lessons.length && lessons.length > 0) {
      sectionStatus = 'completed'
    } else if (sectionCompleted > 0) {
      sectionStatus = 'in_progress'
    } else {
      sectionStatus = 'locked'
    }

    sectionsData.push({
      id: section._id.toString(),
      title: section.title,
      orderIndex: section.orderIndex,
      lessons: lessonsData,
      status: sectionStatus,
      completedCount: sectionCompleted,
      totalCount: lessons.length,
    })
  }

  // Mark first section as in_progress if no progress yet
  if (sectionsData.length > 0 && sectionsData[0].status === 'locked') {
    sectionsData[0].status = 'in_progress'
  }

  return {
    id: course._id.toString(),
    title: course.title,
    language: course.language,
    description: course.description,
    sections: sectionsData,
    progressPercent: totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0,
  }
}

// ============================================================================
// Lesson Service
// ============================================================================

export interface LessonContentResponse {
  id: string
  title: string
  sectionTitle: string
  sectionId: string
  courseId: string
  content: string
  codeMode: string
  starterCode?: string
  xpReward: number
  steps: {
    type: 'content' | 'exercise' | 'quiz'
    id: string
    title: string
    completed: boolean
  }[]
  currentStepIndex: number
}

export async function getLessonContent(userId: string, lessonId: string): Promise<LessonContentResponse> {
  const lesson = await Lesson.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  const section = await Section.findById(lesson.sectionId)
  if (!section) {
    throw ApiError.notFound('Section')
  }

  // Get exercises and quizzes for this lesson
  const [exercises, quizzes] = await Promise.all([
    Exercise.find({ lessonId: lesson._id }).sort({ orderIndex: 1 }),
    Quiz.find({ lessonId: lesson._id }),
  ])

  // Build steps
  const steps: LessonContentResponse['steps'] = [
    { type: 'content', id: lesson._id.toString(), title: 'Lesson Content', completed: false },
  ]

  // Check lesson progress
  const lessonProgress = await LessonProgress.findOne({
    studentId: new Types.ObjectId(userId),
    lessonId: lesson._id,
  })
  steps[0].completed = lessonProgress?.status === 'completed'

  // Add exercises
  for (const exercise of exercises) {
    const submission = await ExerciseSubmission.findOne({
      studentId: new Types.ObjectId(userId),
      exerciseId: exercise._id,
      passed: true,
    })
    steps.push({
      type: 'exercise',
      id: exercise._id.toString(),
      title: exercise.title,
      completed: !!submission,
    })
  }

  // Add quizzes
  for (const quiz of quizzes) {
    const submission = await QuizSubmission.findOne({
      studentId: new Types.ObjectId(userId),
      quizId: quiz._id,
      passed: true,
    })
    steps.push({
      type: 'quiz',
      id: quiz._id.toString(),
      title: quiz.title,
      completed: !!submission,
    })
  }

  // Find current step
  let currentStepIndex = 0
  for (let i = 0; i < steps.length; i++) {
    if (!steps[i].completed) {
      currentStepIndex = i
      break
    }
    currentStepIndex = i
  }

  // Mark lesson as started if not already
  if (!lessonProgress) {
    await LessonProgress.create({
      studentId: new Types.ObjectId(userId),
      lessonId: lesson._id,
      status: 'in_progress',
      startedAt: new Date(),
    })
    await StudentProfile.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { lastActivityDate: new Date() }
    )
  }

  return {
    id: lesson._id.toString(),
    title: lesson.title,
    sectionTitle: section.title,
    sectionId: section._id.toString(),
    courseId: section.courseId.toString(),
    content: lesson.content,
    codeMode: lesson.codeMode,
    starterCode: lesson.starterCode,
    xpReward: lesson.xpReward,
    steps,
    currentStepIndex,
  }
}

export async function completeLesson(userId: string, lessonId: string): Promise<{ xpEarned: number }> {
  const lesson = await Lesson.findById(lessonId)
  if (!lesson) {
    throw ApiError.notFound('Lesson')
  }

  let progress = await LessonProgress.findOne({
    studentId: new Types.ObjectId(userId),
    lessonId: new Types.ObjectId(lessonId),
  })

  if (progress?.status === 'completed') {
    return { xpEarned: 0 }
  }

  if (!progress) {
    progress = await LessonProgress.create({
      studentId: new Types.ObjectId(userId),
      lessonId: new Types.ObjectId(lessonId),
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      xpEarned: lesson.xpReward,
    })
  } else {
    progress.status = 'completed'
    progress.completedAt = new Date()
    progress.xpEarned = lesson.xpReward
    await progress.save()
  }

  // Update student XP
  await awardXp({
    studentId: userId,
    amount: lesson.xpReward,
    source: `Completed Lesson: ${lesson.title}`,
    sourceId: lessonId,
  })

  return { xpEarned: lesson.xpReward }
}

// ============================================================================
// Exercise Service
// ============================================================================

export interface ExerciseResponse {
  id: string
  lessonId: string
  title: string
  instructions: string
  starterCode: string
  xpReward: number
  orderIndex: number
}

export async function getExercise(userId: string, exerciseId: string): Promise<ExerciseResponse> {
  const exercise = await Exercise.findById(exerciseId)
  if (!exercise) {
    throw ApiError.notFound('Exercise')
  }

  return {
    id: exercise._id.toString(),
    lessonId: exercise.lessonId.toString(),
    title: exercise.title,
    instructions: exercise.instructions,
    starterCode: exercise.starterCode,
    xpReward: exercise.xpReward,
    orderIndex: exercise.orderIndex,
  }
}

export interface ExerciseSubmitResult {
  passed: boolean
  testsTotal: number
  testsPassed: number
  xpEarned: number
  feedback?: string
  testResults: {
    testCaseId: string
    passed: boolean
    input?: string
    expected?: string
    actual?: string
    error?: string
  }[]
}

export async function submitExercise(
  userId: string,
  exerciseId: string,
  input: SubmitExerciseInput
): Promise<ExerciseSubmitResult> {
  const exercise = await Exercise.findById(exerciseId)
  if (!exercise) {
    throw ApiError.notFound('Exercise')
  }

  // Check if already passed
  const existingSubmission = await ExerciseSubmission.findOne({
    studentId: new Types.ObjectId(userId),
    exerciseId: exercise._id,
    passed: true,
  })

  // For now, simulate test results (actual code execution would require a sandbox)
  // In production, this would call a code execution service
  const testResults = exercise.testCases.map((tc) => ({
    testCaseId: tc.id,
    passed: true, // Simplified - would actually run tests
    actualOutput: tc.expectedOutput, // Simulated - would be actual output in production
  }))

  const passed = testResults.every((r) => r.passed)
  const xpEarned = passed && !existingSubmission ? exercise.xpReward : 0

  // Save submission
  await ExerciseSubmission.create({
    studentId: new Types.ObjectId(userId),
    exerciseId: exercise._id,
    code: input.code,
    passed,
    testResults,
    xpEarned,
    submittedAt: new Date(),
  })

  // Award XP if passed and first time
  if (xpEarned > 0) {
    await awardXp({
      studentId: userId,
      amount: xpEarned,
      source: `Completed Exercise: ${exercise.title}`,
      sourceId: exerciseId,
    })
  }

  return {
    passed,
    testsTotal: testResults.length,
    testsPassed: testResults.filter((r) => r.passed).length,
    xpEarned,
    testResults,
  }
}

// ============================================================================
// Quiz Service
// ============================================================================

export interface QuizResponse {
  id: string
  lessonId: string
  title: string
  description?: string
  questionCount: number
  xpReward: number
  maxAttempts: number
  currentAttempt: number
  questions: {
    id: string
    type: string
    question: string
    options: string[]
    codeSnippet?: string
  }[]
}

export async function getQuiz(userId: string, quizId: string): Promise<QuizResponse> {
  const quiz = await Quiz.findById(quizId)
  if (!quiz) {
    throw ApiError.notFound('Quiz')
  }

  // Count attempts
  const attemptCount = await QuizSubmission.countDocuments({
    studentId: new Types.ObjectId(userId),
    quizId: quiz._id,
  })

  return {
    id: quiz._id.toString(),
    lessonId: quiz.lessonId.toString(),
    title: quiz.title,
    description: quiz.description,
    questionCount: quiz.questions.length,
    xpReward: quiz.xpReward,
    maxAttempts: quiz.maxAttempts || 3,
    currentAttempt: attemptCount + 1,
    questions: quiz.questions.map((q) => ({
      id: q._id?.toString() || '',
      type: q.type,
      question: q.question,
      options: q.options,
      codeSnippet: q.codeSnippet,
      // Note: correctIndex is NOT included (hidden from student)
    })),
  }
}

export interface QuizSubmitResult {
  score: number
  total: number
  passed: boolean
  xpEarned: number
  results: {
    questionId: string
    isCorrect: boolean
    correctIndex: number
    selectedIndex: number
  }[]
}

export async function submitQuiz(
  userId: string,
  quizId: string,
  input: SubmitQuizInput
): Promise<QuizSubmitResult> {
  const quiz = await Quiz.findById(quizId)
  if (!quiz) {
    throw ApiError.notFound('Quiz')
  }

  // Check if already passed
  const existingPass = await QuizSubmission.findOne({
    studentId: new Types.ObjectId(userId),
    quizId: quiz._id,
    passed: true,
  })

  // Grade answers
  const results = input.answers.map((answer) => {
    const question = quiz.questions.find((q) => q.id === answer.questionId)
    const isCorrect = question?.correctIndex === answer.selectedIndex
    return {
      questionId: answer.questionId,
      isCorrect,
      correctIndex: question?.correctIndex || 0,
      selectedIndex: answer.selectedIndex,
    }
  })

  const score = results.filter((r) => r.isCorrect).length
  const total = quiz.questions.length
  const passed = score / total >= (quiz.passingScore || 0.7)
  const xpEarned = passed && !existingPass ? quiz.xpReward : 0

  // Save submission with graded answers
  await QuizSubmission.create({
    studentId: new Types.ObjectId(userId),
    quizId: quiz._id,
    lessonId: quiz.lessonId,
    answers: results.map((r) => ({
      questionId: r.questionId,
      selectedIndex: r.selectedIndex,
      isCorrect: r.isCorrect,
    })),
    score,
    maxScore: total,
    passed,
    xpEarned,
    submittedAt: new Date(),
  })

  // Award XP if passed and first time
  if (xpEarned > 0) {
    await awardXp({
      studentId: userId,
      amount: xpEarned,
      source: `Passed Quiz: ${quiz.title}`,
      sourceId: quizId,
    })
  }

  return {
    score,
    total,
    passed,
    xpEarned,
    results,
  }
}

// ============================================================================
// Badge Service
// ============================================================================

export interface StudentBadgeResponse {
  id: string
  name: string
  description: string
  iconName: string
  gradientFrom: string
  gradientTo: string
  triggerType: string
  triggerValue?: number
  isEarned: boolean
  earnedAt?: string
}

export async function getStudentBadges(userId: string): Promise<StudentBadgeResponse[]> {
  const allBadges = await Badge.find({ isActive: true }).sort({ triggerValue: 1 })
  const earnedBadges = await StudentBadge.find({ studentId: new Types.ObjectId(userId) })
  const earnedMap = new Map(earnedBadges.map((eb) => [eb.badgeId.toString(), eb]))

  return allBadges.map((badge) => {
    const earned = earnedMap.get(badge._id.toString())
    return {
      id: badge._id.toString(),
      name: badge.name,
      description: badge.description,
      iconName: badge.iconName,
      gradientFrom: badge.gradientFrom,
      gradientTo: badge.gradientTo,
      triggerType: badge.triggerType,
      triggerValue: badge.triggerValue,
      isEarned: !!earned,
      earnedAt: earned?.earnedAt.toISOString(),
    }
  })
}

// ============================================================================
// Shop Service
// ============================================================================

export interface StudentShopItem {
  id: string
  name: string
  description: string
  category: string
  price: number
  imageUrl?: string
  isActive: boolean
  isOwned: boolean
  isEquipped: boolean
}

export async function getStudentShopItems(userId: string): Promise<StudentShopItem[]> {
  const items = await ShopItem.find({ isActive: true })
  const purchases = await Purchase.find({ studentId: new Types.ObjectId(userId) })
  const purchasedItemIds = new Set(purchases.map((p) => p.itemId.toString()))

  const profile = await StudentProfile.findOne({ userId: new Types.ObjectId(userId) })
  const equippedItems = (profile as unknown as { equippedItems?: Record<string, string> })?.equippedItems || {}

  return items.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price,
    imageUrl: item.imageUrl,
    isActive: item.isActive,
    isOwned: purchasedItemIds.has(item._id.toString()),
    isEquipped: Object.values(equippedItems).includes(item._id.toString()),
  }))
}

export async function getStudentInventory(userId: string): Promise<StudentShopItem[]> {
  const purchases = await Purchase.find({ studentId: new Types.ObjectId(userId) })
  const itemIds = purchases.map((p) => p.itemId)
  const items = await ShopItem.find({ _id: { $in: itemIds } })

  const profile = await StudentProfile.findOne({ userId: new Types.ObjectId(userId) })
  const equippedItems = (profile as unknown as { equippedItems?: Record<string, string> })?.equippedItems || {}

  return items.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price,
    imageUrl: item.imageUrl,
    isActive: item.isActive,
    isOwned: true,
    isEquipped: Object.values(equippedItems).includes(item._id.toString()),
  }))
}

export interface PurchaseResult {
  success: boolean
  newBalance: number
  item: {
    id: string
    name: string
    category: string
    price: number
  }
}

export async function purchaseItem(userId: string, itemId: string): Promise<PurchaseResult> {
  const item = await ShopItem.findById(itemId)
  if (!item) {
    throw ApiError.notFound('Shop item')
  }

  if (!item.isActive) {
    throw ApiError.badRequest('This item is not available')
  }

  const profile = await StudentProfile.findOne({ userId: new Types.ObjectId(userId) })
  if (!profile) {
    throw ApiError.notFound('Student profile')
  }

  // Check if already owned
  const existing = await Purchase.findOne({
    studentId: new Types.ObjectId(userId),
    itemId: item._id,
  })
  if (existing && item.isPermanent) {
    throw ApiError.conflict('You already own this item')
  }

  // Check balance
  if (profile.currencyBalance < item.price) {
    throw ApiError.badRequest('Insufficient coins')
  }

  // Deduct and purchase
  profile.currencyBalance -= item.price
  await profile.save()

  await Purchase.create({
    studentId: new Types.ObjectId(userId),
    itemId: item._id,
    price: item.price,
  })

  await ShopItem.findByIdAndUpdate(itemId, { $inc: { purchaseCount: 1 } })

  return {
    success: true,
    newBalance: profile.currencyBalance,
    item: {
      id: item._id.toString(),
      name: item.name,
      category: item.category,
      price: item.price,
    },
  }
}

export async function equipItem(userId: string, input: EquipItemInput): Promise<{ success: boolean }> {
  const { itemId, slot } = input

  // Verify ownership
  const purchase = await Purchase.findOne({
    studentId: new Types.ObjectId(userId),
    itemId: new Types.ObjectId(itemId),
  })
  if (!purchase) {
    throw ApiError.forbidden('You do not own this item')
  }

  // Update equipped item
  await StudentProfile.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { [`equippedItems.${slot}`]: new Types.ObjectId(itemId) }
  )

  return { success: true }
}

// ============================================================================
// Profile Service
// ============================================================================

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<Omit<StudentAuthResponse, 'accessToken' | 'refreshToken'>> {
  const user = await User.findById(userId)
  if (!user || user.role !== 'student') {
    throw ApiError.notFound('Student')
  }

  // Update user fields
  if (input.displayName) {
    user.displayName = input.displayName
  }
  if (input.avatarId !== undefined) {
    user.avatarId = input.avatarId
  }
  await user.save()

  // Update profile preferences
  if (input.preferences) {
    await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: { preferences: input.preferences } }
    )
  }

  return getStudentMe(userId)
}

// ============================================================================
// XP History Service
// ============================================================================

export interface XpHistoryItem {
  id: string
  amount: number
  actionType: string
  sourceId?: string
  description?: string
  createdAt: string
}

export interface XpHistoryResult {
  items: XpHistoryItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getXpHistory(userId: string, query: XpHistoryQuery): Promise<XpHistoryResult> {
  // For now, we'll derive XP history from lesson progress, exercise submissions, and quiz submissions
  // In a full implementation, this would come from an XpTransaction model
  const { page, limit, skip } = parsePaginationParams(query)

  const lessonProgress = await LessonProgress.find({
    studentId: new Types.ObjectId(userId),
    status: 'completed',
    xpEarned: { $gt: 0 },
  })
    .sort({ completedAt: -1 })
    .lean()

  const exerciseSubmissions = await ExerciseSubmission.find({
    studentId: new Types.ObjectId(userId),
    passed: true,
    xpEarned: { $gt: 0 },
  })
    .sort({ submittedAt: -1 })
    .lean()

  const quizSubmissions = await QuizSubmission.find({
    studentId: new Types.ObjectId(userId),
    passed: true,
    xpEarned: { $gt: 0 },
  })
    .sort({ submittedAt: -1 })
    .lean()

  const allItems: XpHistoryItem[] = [
    ...lessonProgress.map((lp) => ({
      id: lp._id.toString(),
      amount: lp.xpEarned || 0,
      actionType: 'lesson_complete',
      sourceId: lp.lessonId.toString(),
      description: 'Lesson completed',
      createdAt: lp.completedAt?.toISOString() || new Date().toISOString(),
    })),
    ...exerciseSubmissions.map((es) => ({
      id: es._id.toString(),
      amount: es.xpEarned || 0,
      actionType: 'exercise_complete',
      sourceId: es.exerciseId.toString(),
      description: 'Exercise passed',
      createdAt: es.submittedAt.toISOString(),
    })),
    ...quizSubmissions.map((qs) => ({
      id: qs._id.toString(),
      amount: qs.xpEarned || 0,
      actionType: 'quiz_complete',
      sourceId: qs.quizId.toString(),
      description: 'Quiz passed',
      createdAt: qs.submittedAt.toISOString(),
    })),
  ]

  // Sort by date descending
  allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Filter by action type if specified
  const filtered = query.actionType
    ? allItems.filter((item) => item.actionType === query.actionType)
    : allItems

  const total = filtered.length
  const paginatedItems = filtered.slice(skip, skip + limit)

  return {
    items: paginatedItems,
    meta: buildPaginationMeta(total, page, limit),
  }
}

// ============================================================================
// Profile Page Service
// ============================================================================

export interface ProfilePageResponse {
  profile: {
    id: string
    displayName: string
    username: string
    avatarId: string | null
    currentLevel: number
    totalXp: number
    currencyBalance: number
    currentStreakDays: number
    preferences?: {
      theme?: 'light' | 'dark' | 'system'
      editorTheme?: string
      fontSize?: number
    }
  }
  stats: {
    lessonsCompleted: number
    exercisesPassed: number
    quizzesPassed: number
    badgesEarned: number
  }
  recentBadges: {
    id: string
    name: string
    description: string
    iconUrl: string | null
    earnedAt: string
  }[]
  equippedItems: Record<string, string>
}

export async function getStudentProfilePage(userId: string): Promise<ProfilePageResponse> {
  const user = await User.findById(userId)
  if (!user || user.role !== 'student') {
    throw ApiError.notFound('Student')
  }

  const profile = await StudentProfile.findOne({ userId: user._id })
  if (!profile) {
    throw ApiError.notFound('Student profile')
  }

  // Get stats
  const lessonsCompleted = await LessonProgress.countDocuments({
    studentId: new Types.ObjectId(userId),
    status: 'completed',
  })

  const exercisesPassed = await ExerciseSubmission.countDocuments({
    studentId: new Types.ObjectId(userId),
    passed: true,
  })

  const quizzesPassed = await QuizSubmission.countDocuments({
    studentId: new Types.ObjectId(userId),
    passed: true,
  })

  const badgesEarned = await StudentBadge.countDocuments({
    studentId: new Types.ObjectId(userId),
  })

  // Get recent badges
  const recentStudentBadges = await StudentBadge.find({
    studentId: new Types.ObjectId(userId),
  })
    .sort({ earnedAt: -1 })
    .limit(4)

  const recentBadges: ProfilePageResponse['recentBadges'] = []
  for (const sb of recentStudentBadges) {
    const badge = await Badge.findById(sb.badgeId)
    if (badge) {
      recentBadges.push({
        id: badge._id.toString(),
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl || null,
        earnedAt: sb.earnedAt.toISOString(),
      })
    }
  }

  // Get equipped items from purchases
  const equippedPurchases = await Purchase.find({
    studentId: new Types.ObjectId(userId),
    isEquipped: true,
  })

  const equippedItems: Record<string, string> = {}
  for (const purchase of equippedPurchases) {
    const item = await ShopItem.findById(purchase.itemId)
    if (item) {
      equippedItems[item.category] = item._id.toString()
    }
  }

  return {
    profile: {
      id: user._id.toString(),
      displayName: user.displayName,
      username: user.username,
      avatarId: user.avatarId || null,
      currentLevel: profile.currentLevel,
      totalXp: profile.totalXp,
      currencyBalance: profile.currencyBalance,
      currentStreakDays: profile.currentStreakDays,
      preferences: profile.preferences,
    },
    stats: {
      lessonsCompleted,
      exercisesPassed,
      quizzesPassed,
      badgesEarned,
    },
    recentBadges,
    equippedItems,
  }
}
