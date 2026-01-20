// ============================================================================
// Admin-specific Type Extensions
// These types extend shared types with admin-only fields or transform
// backend types into UI-friendly structures.
//
// NOTE: Some types (GamificationSettings, StorageInfo, etc.) differ from
// shared types because the admin UI uses nested structures while the backend
// API uses flat structures. Transform functions in services/api/settings.ts
// handle the conversion between formats.
// ============================================================================

import type {
  Student,
  Teacher,
  Parent,
  Course,
  Class,
  Badge,
  ShopItem,
  BadgeTriggerType,
  User,
  DashboardStats as SharedDashboardStats,
  ActivityData,
} from '@silveredge/shared'

// ============================================================================
// Dashboard Types (Admin-only)
// Re-export shared DashboardStats - same structure used by both
// ============================================================================

export type DashboardStats = SharedDashboardStats

// Re-export ActivityData from shared types
export type { ActivityData }

export interface RecentItem {
  id: string
  name: string
  type: 'teacher' | 'student' | 'class' | 'badge' | 'course'
  time: string
}

export interface CourseCompletion {
  javascript: {
    percentage: number
    courseCount: number
  }
  python: {
    percentage: number
    courseCount: number
  }
}

// ============================================================================
// Settings Types (Admin UI)
// These use nested structures for better UI organization.
// Transform functions in services/api/settings.ts convert to/from backend format.
// ============================================================================

/**
 * Admin UI gamification settings with nested structure.
 * Backend uses flat structure (see shared GamificationSettings).
 */
export interface GamificationSettings {
  xp: {
    lessonCompletion: number
    exercisePass: number
    quizBasePoints: number
  }
  currency: {
    coinsPerXp: number
  }
  levelProgression: {
    baseXp: number
    growthMultiplier: number
    overrides: { level: number; threshold: number }[]
  }
  streaksEnabled: boolean
}

export interface FeatureToggles {
  sandboxMode: boolean
  visualCoding: boolean
  canvasGraphics: boolean
  helpRequests: boolean
  loginStreaks: boolean
}

export type FeatureKey = keyof FeatureToggles

export interface FeatureInfo {
  key: FeatureKey
  name: string
  description: string
  icon: string
  color: string
}

export interface SystemSettings {
  codeExecution: {
    timeoutSeconds: number
    maxOutputLength: number
  }
  fileUpload: {
    maxFileSizeMb: number
    maxVideoDurationMinutes: number
    allowedTypes: string[]
  }
  session: {
    timeoutMinutes: number
    refreshTokenDays: number
  }
  editor: {
    defaultMode: 'text' | 'visual' | 'mixed'
    defaultComplexity: 'simplified' | 'standard' | 'advanced'
    fontSize: number
  }
}

export interface StorageInfo {
  used: number
  total: number
  breakdown: {
    lessonMedia: number
    sandbox: number
    database: number
  }
}

// ============================================================================
// Admin User Extensions
// ============================================================================

// Admin student extends shared Student with admin-specific fields
export interface AdminStudent extends Student {
  studentNumber: string // Admin-assigned ID for reference
}

// Admin teacher extends shared Teacher
export interface AdminTeacher extends Teacher {
  // Admin may have additional fields
}

// Admin parent extends shared Parent
export interface AdminParent extends Parent {
  studentIds: string[] // Legacy field for linking
}

// ============================================================================
// Admin Course Extensions
// ============================================================================

// Inline section type for admin UI (matches CourseSection in services/api/courses.ts)
export interface AdminCourseSection {
  id: string
  title: string
  description?: string
  order: number
  lessonCount: number
}

export interface AdminCourse extends Course {
  createdByName: string
  assignedClasses?: { id: string; name: string }[]
  sections?: AdminCourseSection[]
}

// ============================================================================
// Admin Class Extensions
// ============================================================================

export interface AdminClass extends Class {
  teacherEmail?: string
  avgProgress: number
  attendanceRate: number
  lastActivity: string
  courses?: ClassCourse[]
  students?: ClassStudent[]
}

export interface ClassCourse {
  id: string
  name: string
  category: string
  progress: number
}

export interface ClassStudent {
  id: string
  displayName: string
  email: string
  level: number
  progress: number
  lastActive: string
}

// ============================================================================
// Admin Badge Extensions
// ============================================================================

// Badge icon and color types for admin UI
export type BadgeIcon =
  | 'award'
  | 'star'
  | 'flame'
  | 'zap'
  | 'trophy'
  | 'gem'
  | 'heart'
  | 'rocket'
  | 'code'
  | 'bug'
  | 'lightbulb'
  | 'target'
  | 'footprints'
  | 'crown'
  | 'medal'
  | 'sparkles'

export type BadgeColor =
  | 'indigo'
  | 'amber'
  | 'emerald'
  | 'blue'
  | 'rose'
  | 'violet'
  | 'cyan'
  | 'pink'

// Admin badge extends shared Badge with UI-specific fields
export interface AdminBadge extends Omit<Badge, 'iconName' | 'isActive'> {
  icon: BadgeIcon
  color: BadgeColor
  status: 'active' | 'inactive'
}

export interface BadgeEarnedStudent {
  id: string
  displayName: string
  className: string
  earnedAt: string
}

// Badge color gradients for admin UI
export const badgeColorGradients: Record<BadgeColor, { from: string; to: string }> = {
  indigo: { from: '#6366f1', to: '#4f46e5' },
  amber: { from: '#f59e0b', to: '#d97706' },
  emerald: { from: '#10b981', to: '#059669' },
  blue: { from: '#3b82f6', to: '#2563eb' },
  rose: { from: '#f43f5e', to: '#e11d48' },
  violet: { from: '#8b5cf6', to: '#7c3aed' },
  cyan: { from: '#06b6d4', to: '#0891b2' },
  pink: { from: '#ec4899', to: '#db2777' },
}

// ============================================================================
// Admin Shop Extensions
// ============================================================================

export interface AdminShopItem extends Omit<ShopItem, 'isActive' | 'previewData'> {
  status: 'enabled' | 'disabled'
  gradientFrom?: string
  gradientTo?: string
  previewIcons?: string[]
  teacherName?: string
  className?: string
  type?: 'consumable' | 'permanent'
}

// ============================================================================
// Admin Auth Types
// ============================================================================

export interface AdminAuthUser extends User {
  role: 'admin' | 'teacher'
  avatarUrl?: string
  assignedClassIds: string[] // For teachers - which classes they can access
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AdminLoginResponse {
  user: AdminAuthUser
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: AdminAuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  isAdmin: boolean
  isTeacher: boolean
  canAccessClass: (classId: string) => boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// ============================================================================
// Student Detail Types (Admin view)
// ============================================================================

export interface StudentCourse {
  id: string
  title: string
  language: 'javascript' | 'python'
  lessonsCompleted: number
  totalLessons: number
  progress: number
  lastAccessed: string
}

export interface StudentBadgeDisplay {
  id: string
  name: string
  description: string
  icon: string
  color: string
  gradientFrom: string
  gradientTo: string
  earnedAt: string
}

export interface XpHistoryItem {
  date: string
  xp: number
  source: string
}

export interface StudentAchievements {
  badges: StudentBadgeDisplay[]
  xpHistory: XpHistoryItem[]
  totalXp: number
  level: number
}

// ============================================================================
// Lesson Detail Types (Admin editor)
// ============================================================================

export interface LessonExercise {
  id: string
  title: string
  instructions: string
  starterCode: string
  solution: string
}

export interface LessonQuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'code-output'
  question: string
  options: string[]
  correctIndex: number
  codeSnippet?: string
  explanation?: string
}

export interface LessonDetail {
  id: string
  title: string
  content: string
  courseId: string
  courseTitle: string
  sectionId: string
  sectionTitle: string
  order: number
  duration: number
  xpReward: number
  editorMode: 'visual' | 'text' | 'mixed'
  status: 'draft' | 'published'
  exercises: LessonExercise[]
  quiz: LessonQuizQuestion[]
  completions: number
  passRate: number
  avgTime: number
  rating: number
  createdAt: string
  updatedAt: string
  updatedByName: string
}

// Re-export BadgeTriggerType from shared for convenience
export type { BadgeTriggerType }
