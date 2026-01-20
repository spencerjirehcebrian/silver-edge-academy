import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type {
  StudentCourseMap,
  LessonContent,
  StudentExercise,
  StudentQuiz,
  QuizQuestion,
  ExerciseSubmitResult,
  QuizSubmitResult,
} from '@/types/student'

// ============================================================================
// Types
// ============================================================================

export interface CourseListItem {
  id: string
  title: string
  language: 'javascript' | 'python'
  description?: string
  progressPercent: number
  totalLessons: number
  completedLessons: number
  isAssigned?: boolean
}

// Note: Backend returns data directly (unwrapped by API client),
// not wrapped in additional { courses: ... }, { course: ... }, etc.
export type CoursesListResponse = CourseListItem[]
export type CourseMapResponse = StudentCourseMap
export type LessonResponse = LessonContent
export type ExerciseResponse = StudentExercise
export type QuizResponse = StudentQuiz // Quiz includes questions embedded

// ============================================================================
// Courses
// ============================================================================

/**
 * Get list of enrolled courses with progress
 */
export async function getCourses(): Promise<CoursesListResponse> {
  return api.get<CoursesListResponse>(STUDENT_ENDPOINTS.courses.list)
}

/**
 * Get course map with sections and lessons
 */
export async function getCourseMap(courseId: string): Promise<CourseMapResponse> {
  return api.get<CourseMapResponse>(STUDENT_ENDPOINTS.courses.detail(courseId))
}

// ============================================================================
// Lessons
// ============================================================================

/**
 * Get lesson content
 */
export async function getLesson(lessonId: string): Promise<LessonResponse> {
  return api.get<LessonResponse>(STUDENT_ENDPOINTS.lessons.detail(lessonId))
}

/**
 * Mark lesson as complete
 */
export async function completeLesson(lessonId: string): Promise<{ xpEarned: number }> {
  return api.post<{ xpEarned: number }>(STUDENT_ENDPOINTS.lessons.complete(lessonId))
}

// ============================================================================
// Exercises
// ============================================================================

/**
 * Get exercise details
 */
export async function getExercise(exerciseId: string): Promise<ExerciseResponse> {
  return api.get<ExerciseResponse>(STUDENT_ENDPOINTS.exercises.detail(exerciseId))
}

/**
 * Submit exercise code for testing
 */
export async function submitExercise(exerciseId: string, code: string): Promise<ExerciseSubmitResult> {
  return api.post<ExerciseSubmitResult>(STUDENT_ENDPOINTS.exercises.submit(exerciseId), { code })
}

// ============================================================================
// Quizzes
// ============================================================================

/**
 * Get quiz with questions
 */
export async function getQuiz(quizId: string): Promise<QuizResponse> {
  return api.get<QuizResponse>(STUDENT_ENDPOINTS.quizzes.detail(quizId))
}

/**
 * Submit quiz answers
 */
export async function submitQuiz(
  quizId: string,
  answers: { questionId: string; selectedIndex: number }[]
): Promise<QuizSubmitResult> {
  return api.post<QuizSubmitResult>(STUDENT_ENDPOINTS.quizzes.submit(quizId), { answers })
}
