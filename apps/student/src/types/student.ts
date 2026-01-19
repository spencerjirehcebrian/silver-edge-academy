import type { Badge, ShopItem, Course, CourseProgress } from '@silveredge/shared'

// Student-specific auth types
export interface StudentAuthUser {
  id: string
  displayName: string
  username: string
  email: string
  role: 'student'
  avatarId: string | null
  status: 'active' | 'inactive'
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
  emailVerified?: boolean
  parentIds?: string[]
  lastActivityDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface StudentLoginCredentials {
  username: string
  password: string
}

export interface StudentLoginResponse {
  user: StudentAuthUser
  token: string
  refreshToken?: string
}

export interface AuthContextValue {
  user: StudentAuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// Dashboard types
export interface DashboardData {
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
  activeCourses: ActiveCourse[]
  recentBadges: Badge[]
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

export interface ActiveCourse {
  id: string
  title: string
  language: 'javascript' | 'python'
  currentSection: string
  currentLessonId: string
  progressPercent: number
  lessonsCompleted: number
  totalLessons: number
}

// Course/Lesson types for student view
export interface StudentCourse extends Course {
  progress?: CourseProgress
  isAssigned: boolean
}

export interface StudentLesson {
  id: string
  sectionId: string
  title: string
  orderIndex: number
  status: 'completed' | 'current' | 'available' | 'locked'
  xpReward?: number
}

export interface StudentSection {
  id: string
  title: string
  orderIndex: number
  lessons: StudentLesson[]
  status: 'completed' | 'in_progress' | 'locked'
  completedCount: number
  totalCount: number
}

export interface StudentCourseMap {
  id: string
  title: string
  language: 'javascript' | 'python'
  description?: string
  sections: StudentSection[]
  progressPercent: number
}

// Lesson content types
export interface LessonContent {
  id: string
  title: string
  sectionTitle: string
  sectionId: string
  courseId: string
  content: string
  codeMode: 'visual' | 'text' | 'mixed'
  starterCode?: string
  xpReward: number
  steps: LessonStep[]
  currentStepIndex: number
}

export interface LessonStep {
  type: 'content' | 'exercise' | 'quiz'
  id: string
  title: string
  completed: boolean
}

// Exercise types
export interface StudentExercise {
  id: string
  lessonId: string
  title: string
  instructions: string
  starterCode: string
  xpReward: number
  orderIndex: number
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

// Quiz types
export interface QuizQuestion {
  id: string
  type: string
  question: string
  options: string[]
  codeSnippet?: string
}

export interface StudentQuiz {
  id: string
  lessonId: string
  title: string
  description?: string
  questionCount: number
  xpReward: number
  maxAttempts: number
  currentAttempt: number
  questions?: QuizQuestion[]
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

// Shop types
export interface StudentShopItem extends ShopItem {
  isOwned: boolean
  isEquipped: boolean
}

export interface PurchaseResult {
  success: boolean
  newBalance: number
  item: ShopItem
}

// Sandbox types
export interface SandboxProject {
  id: string
  name: string
  description?: string
  language: 'javascript' | 'python'
  code: string
  createdAt: string
  updatedAt: string
}

// Help request types
export interface StudentHelpRequest {
  id: string
  lessonId: string
  lessonTitle: string
  exerciseId?: string
  exerciseTitle?: string
  message: string
  codeSnapshot?: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  response?: string
  teacherName?: string
  respondedAt?: string
  createdAt: string
}

// Gamification animation types
export interface XpGainEvent {
  id: string
  amount: number
  source: 'exercise' | 'quiz' | 'lesson' | 'daily' | 'streak'
  timestamp: number
}

export interface BadgeUnlockEvent {
  id: string
  badge: Badge
  timestamp: number
}

export interface LevelUpEvent {
  id: string
  oldLevel: number
  newLevel: number
  timestamp: number
}

export interface CoinEarnEvent {
  id: string
  amount: number
  source: string
  timestamp: number
}

// Notification types
export interface StudentNotification {
  id: string
  type: 'help_response' | 'badge_earned' | 'level_up' | 'streak' | 'general'
  title: string
  message: string
  read: boolean
  data?: Record<string, unknown>
  createdAt: string
}
