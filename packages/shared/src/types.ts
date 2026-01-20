// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student'
export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  email?: string // Optional for students, required for others
  displayName: string
  role: UserRole
  avatarId: string | null
  status: UserStatus
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Admin extends User {
  role: 'admin'
  email: string // Required for admins
}

export interface StudentPreferences {
  theme?: 'light' | 'dark' | 'system'
  editorTheme?: string
  fontSize?: number
}

export interface Student extends User {
  role: 'student'
  username: string
  parentIds: string[]
  classId?: string
  className?: string
  currentLevel: number
  totalXp: number
  currencyBalance: number
  currentStreakDays: number
  lastActivityDate?: string
  preferences?: StudentPreferences
}

export interface Teacher extends User {
  role: 'teacher'
  email: string // Required for teachers
  classIds: string[]
  classCount: number
  studentCount: number
}

export interface Parent extends User {
  role: 'parent'
  email: string // Required for parents
  childIds: string[]
  childNames: string[]
}

// User creation inputs
export interface UserCreateInput {
  email?: string
  displayName: string
  password: string
  role: UserRole
  status?: UserStatus
}

export interface StudentCreateInput extends Omit<UserCreateInput, 'role'> {
  username: string
  classId?: string
  parentIds?: string[]
}

export interface TeacherCreateInput extends Omit<UserCreateInput, 'role' | 'email'> {
  email: string
  classIds?: string[]
}

export interface ParentCreateInput extends Omit<UserCreateInput, 'role' | 'email'> {
  email: string
  childIds?: string[]
}

// User update inputs
export interface UserUpdateInput {
  displayName?: string
  email?: string
  avatarId?: string | null
  status?: UserStatus
}

export interface StudentUpdateInput extends UserUpdateInput {
  username?: string
  classId?: string
  parentIds?: string[]
  preferences?: StudentPreferences
}

export interface ParentUpdateInput extends UserUpdateInput {
  childIds?: string[]
}

// ============================================================================
// Course Types
// ============================================================================

export type ProgrammingLanguage = 'javascript' | 'python'
export type ContentStatus = 'draft' | 'published'
export type CodeMode = 'visual' | 'text' | 'mixed'
export type EditorComplexity = 'simplified' | 'standard' | 'advanced'

export interface Course {
  id: string
  title: string
  description?: string
  language: ProgrammingLanguage
  createdBy: string
  status: ContentStatus
  sectionCount: number
  lessonCount: number
  classCount: number
  createdAt: string
  updatedAt: string
}

export interface CourseWithSections extends Course {
  sections: SectionWithLessons[]
}

export interface Section {
  id: string
  courseId: string
  title: string
  description?: string
  orderIndex: number
  lessonCount: number
}

export interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  sectionId: string
  title: string
  content: string
  codeMode: CodeMode
  editorComplexity: EditorComplexity
  starterCode?: string
  duration?: number
  xpReward?: number
  status: ContentStatus
  orderIndex: number
  lockedBy?: string
  lockedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
}

export interface Exercise {
  id: string
  lessonId: string
  title: string
  instructions: string
  starterCode: string
  solution: string
  testCases: TestCase[]
  orderIndex: number
}

export interface LessonWithContent extends Lesson {
  exercises: Exercise[]
  quiz: QuizQuestion[]
}

export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'code-output'

export interface QuizQuestion {
  id: string
  lessonId: string
  type: QuizQuestionType
  question: string
  options: string[]
  correctIndex: number
  codeSnippet?: string
  explanation?: string
  orderIndex: number
}

// ============================================================================
// Class Types
// ============================================================================

export type ClassStatus = 'active' | 'archived' | 'draft'

export interface Class {
  id: string
  name: string
  description?: string
  color?: string
  teacherId: string | null
  teacherName?: string
  studentCount: number
  courseCount: number
  startDate?: string
  endDate?: string
  status: ClassStatus
  createdAt: string
  updatedAt: string
  // Computed fields (returned by backend but not stored in DB)
  attendanceRate?: number
  avgProgress?: number
  lastActivity?: string
}

export interface ClassWithDetails extends Class {
  students: Student[]
  courses: Course[]
}

export interface LessonUnlock {
  id: string
  lessonId: string
  classId: string
  studentId?: string // null means class-wide unlock
  unlockedBy: string
  unlockedAt: string
  expiresAt?: string
}

// ============================================================================
// Progress Types
// ============================================================================

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface LessonProgress {
  id: string
  studentId: string
  lessonId: string
  status: ProgressStatus
  startedAt?: string
  completedAt?: string
  timeSpentSeconds: number
  xpEarned: number
}

export interface CourseProgress {
  id: string
  studentId: string
  courseId: string
  lessonsCompleted: number
  totalLessons: number
  progressPercent: number
  startedAt: string
  lastAccessedAt: string
  completedAt?: string
}

export interface QuizAnswer {
  questionId: string
  selectedIndex: number
  isCorrect: boolean
}

export interface QuizSubmission {
  id: string
  studentId: string
  lessonId: string
  answers: QuizAnswer[]
  score: number
  maxScore: number
  passed: boolean
  xpEarned: number
  submittedAt: string
}

export interface ExerciseSubmission {
  id: string
  studentId: string
  exerciseId: string
  code: string
  passed: boolean
  testResults: {
    testCaseId: string
    passed: boolean
    actualOutput?: string
    error?: string
  }[]
  xpEarned: number
  submittedAt: string
}

// ============================================================================
// Attendance Types
// ============================================================================

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface AttendanceRecord {
  id: string
  studentId: string
  classId: string
  date: string
  status: AttendanceStatus
  notes?: string
  recordedBy: string
  recordedAt: string
}

export interface AttendanceSummary {
  studentId: string
  classId: string
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  excusedDays: number
  attendanceRate: number
}

// ============================================================================
// Video Tracking Types
// ============================================================================

export interface VideoView {
  id: string
  studentId: string
  lessonId: string
  videoUrl: string
  watchedSeconds: number
  totalSeconds: number
  completedAt?: string
  lastPosition: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Gamification Types
// ============================================================================

export type BadgeTriggerType =
  | 'first_login'
  | 'first_lesson'
  | 'first_exercise'
  | 'first_quiz'
  | 'first_sandbox'
  | 'lessons_completed'
  | 'exercises_passed'
  | 'courses_finished'
  | 'login_streak'
  | 'xp_earned'
  | 'level_reached'

export interface Badge {
  id: string
  name: string
  description: string
  iconName: string
  gradientFrom: string
  gradientTo: string
  triggerType: BadgeTriggerType
  triggerValue?: number
  isActive: boolean
  earnedCount: number
  createdAt: string
  updatedAt: string
}

export interface StudentBadge {
  id: string
  studentId: string
  badgeId: string
  badge: Badge
  earnedAt: string
}

export type ShopItemCategory = 'avatar_pack' | 'ui_theme' | 'editor_theme' | 'teacher_reward'

export interface ShopItem {
  id: string
  name: string
  description?: string
  category: ShopItemCategory
  price: number
  previewData?: {
    icons?: string[]
    gradientFrom?: string
    gradientTo?: string
  }
  assetUrl?: string
  isPermanent: boolean
  isActive: boolean
  purchaseCount: number
  createdBy: string
  classId?: string // For teacher rewards scoped to a class
  createdAt: string
  updatedAt: string
}

export interface Purchase {
  id: string
  studentId: string
  itemId: string
  item: ShopItem
  price: number
  purchasedAt: string
}

export type XpActionType =
  | 'lesson_complete'
  | 'exercise_complete'
  | 'quiz_complete'
  | 'daily_login'
  | 'streak_bonus'
  | 'badge_earned'
  | 'manual_adjustment'

export interface XpTransaction {
  id: string
  studentId: string
  amount: number
  actionType: XpActionType
  sourceId?: string // lessonId, exerciseId, etc.
  description?: string
  createdAt: string
}

export interface LevelInfo {
  level: number
  currentXp: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  progressPercent: number
}

// ============================================================================
// Help Request Types
// ============================================================================

export type HelpRequestStatus = 'pending' | 'in_progress' | 'resolved' | 'closed'

export interface HelpRequest {
  id: string
  studentId: string
  studentName: string
  classId?: string
  className?: string
  lessonId: string
  lessonTitle: string
  exerciseId?: string
  exerciseTitle?: string
  message: string
  codeSnapshot?: string
  status: HelpRequestStatus
  assignedTeacherId?: string
  assignedTeacherName?: string
  response?: string
  respondedAt?: string
  createdAt: string
  updatedAt: string
}

export interface HelpRequestCreateInput {
  lessonId: string
  exerciseId?: string
  message: string
  codeSnapshot?: string
}

export interface HelpRequestResponseInput {
  response: string
  status: 'resolved' | 'closed'
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Auth API types
export interface LoginRequest {
  email?: string
  username?: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

// Exercise/Quiz submission API types
export interface ExerciseSubmitRequest {
  code: string
}

export interface ExerciseSubmitResponse {
  passed: boolean
  testResults: {
    testCaseId: string
    passed: boolean
    actualOutput?: string
    error?: string
  }[]
  xpEarned: number
}

export interface QuizSubmitRequest {
  answers: { questionId: string; selectedIndex: number }[]
}

export interface QuizSubmitResponse {
  score: number
  maxScore: number
  passed: boolean
  xpEarned: number
  results: {
    questionId: string
    isCorrect: boolean
    correctIndex: number
  }[]
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalStudents: {
    value: number
    breakdown: {
      active: number
      archived: number
      enrolledThisWeek: number
    }
  }
  activeTeachers: {
    value: number
    breakdown: {
      active: number
      inactive: number
      avgClassesPerTeacher: number
    }
  }
  totalCourses: {
    value: number
    breakdown: {
      javascript: number
      python: number
      published: number
    }
  }
  avgCompletionRate: {
    value: number
    breakdown: {
      javascript: number
      python: number
      exercisesPassed: number
    }
  }
}

export interface ActivityData {
  date: string
  lessonsCompleted: number
  exercisesCompleted: number
  quizzesCompleted: number
}

export interface CourseCompletionData {
  courseId: string
  courseName: string
  totalStudents: number
  completedStudents: number
  inProgressStudents: number
  completionRate: number
}

export interface RecentlyViewedItem {
  type: 'course' | 'class' | 'user'
  id: string
  name: string
  viewedAt: string
}

// ============================================================================
// Settings Types
// ============================================================================

export interface GamificationSettings {
  xpPerLesson: number
  xpPerExercise: number
  xpPerQuiz: number
  xpPerStreak: number
  levelBaseXp: number
  levelMultiplier: number
}

export interface FeatureToggle {
  key: string
  enabled: boolean
  description: string
}

export interface SystemSettings {
  maintenanceMode: boolean
  allowRegistration: boolean
  maxFileUploadSize: number
}

export interface StorageInfo {
  used: number
  total: number
  fileCount: number
}

// ============================================================================
// Course Input Types
// ============================================================================

export interface CourseCreateInput {
  title: string
  description?: string
  language: ProgrammingLanguage
  status?: ContentStatus
}

export interface CourseUpdateInput {
  title?: string
  description?: string
  language?: ProgrammingLanguage
  status?: ContentStatus
}

// ============================================================================
// Section Input Types
// ============================================================================

export interface SectionCreateInput {
  title: string
  description?: string
}

export interface SectionUpdateInput {
  title?: string
  description?: string
  orderIndex?: number
}

// ============================================================================
// Lesson Input Types
// ============================================================================

export interface LessonCreateInput {
  title: string
  content?: string
  codeMode?: CodeMode
  editorComplexity?: EditorComplexity
  starterCode?: string
  duration?: number
  xpReward?: number
  status?: ContentStatus
}

export interface LessonUpdateInput {
  title?: string
  content?: string
  codeMode?: CodeMode
  editorComplexity?: EditorComplexity
  starterCode?: string
  duration?: number
  xpReward?: number
  status?: ContentStatus
  orderIndex?: number
}

// ============================================================================
// Exercise Input Types
// ============================================================================

export interface TestCaseInput {
  input: string
  expectedOutput: string
  isHidden?: boolean
}

export interface ExerciseCreateInput {
  title: string
  instructions: string
  starterCode: string
  solution: string
  testCases: TestCaseInput[]
}

export interface ExerciseUpdateInput {
  title?: string
  instructions?: string
  starterCode?: string
  solution?: string
  testCases?: TestCaseInput[]
  orderIndex?: number
}

// ============================================================================
// Quiz Question Input Types
// ============================================================================

export interface QuizQuestionCreateInput {
  type: QuizQuestionType
  question: string
  options: string[]
  correctIndex: number
  codeSnippet?: string
  explanation?: string
}

export interface QuizQuestionUpdateInput {
  type?: QuizQuestionType
  question?: string
  options?: string[]
  correctIndex?: number
  codeSnippet?: string
  explanation?: string
  orderIndex?: number
}

// ============================================================================
// Class Input Types
// ============================================================================

export interface ClassCreateInput {
  name: string
  description?: string
  color?: string
  teacherId?: string
  startDate?: string
  endDate?: string
  status?: ClassStatus
}

export interface ClassUpdateInput {
  name?: string
  description?: string
  color?: string
  teacherId?: string | null
  startDate?: string
  endDate?: string
  status?: ClassStatus
}

// ============================================================================
// Badge Input Types
// ============================================================================

export interface BadgeCreateInput {
  name: string
  description: string
  iconName: string
  gradientFrom: string
  gradientTo: string
  triggerType: BadgeTriggerType
  triggerValue?: number
  isActive?: boolean
}

export interface BadgeUpdateInput {
  name?: string
  description?: string
  iconName?: string
  gradientFrom?: string
  gradientTo?: string
  triggerType?: BadgeTriggerType
  triggerValue?: number
  isActive?: boolean
}

// ============================================================================
// Shop Item Input Types
// ============================================================================

export interface ShopItemCreateInput {
  name: string
  description?: string
  category: ShopItemCategory
  price: number
  previewData?: {
    icons?: string[]
    gradientFrom?: string
    gradientTo?: string
  }
  assetUrl?: string
  isPermanent?: boolean
  isActive?: boolean
  classId?: string
}

export interface ShopItemUpdateInput {
  name?: string
  description?: string
  category?: ShopItemCategory
  price?: number
  previewData?: {
    icons?: string[]
    gradientFrom?: string
    gradientTo?: string
  }
  assetUrl?: string
  isPermanent?: boolean
  isActive?: boolean
}
