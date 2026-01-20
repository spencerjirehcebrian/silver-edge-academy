import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type { StudentAuthUser, StudentNotification } from '@/types/student'
import type { Badge } from '@silveredge/shared'

// ============================================================================
// Types
// ============================================================================

export interface ProfileResponse {
  profile: StudentAuthUser
  stats: {
    lessonsCompleted: number
    exercisesPassed: number
    quizzesPassed: number
    badgesEarned: number
  }
  recentBadges: Badge[]
  equippedItems: Record<string, string>
}

export interface UpdateProfileInput {
  displayName?: string
  avatarId?: string | null
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
    editorTheme?: string
    fontSize?: number
  }
}

export interface NotificationsResponse {
  notifications: StudentNotification[]
  unreadCount: number
}

// ============================================================================
// Profile Functions
// ============================================================================

/**
 * Get student profile
 */
export async function getProfile(): Promise<ProfileResponse> {
  return api.get<ProfileResponse>(STUDENT_ENDPOINTS.profile)
}

/**
 * Update student profile
 */
export async function updateProfile(data: UpdateProfileInput): Promise<StudentAuthUser> {
  return api.patch<StudentAuthUser>(STUDENT_ENDPOINTS.profile, data)
}

// ============================================================================
// Notification Functions
// ============================================================================

/**
 * Get notifications list
 */
export async function getNotifications(params?: {
  page?: number
  limit?: number
  read?: boolean
  type?: 'help_response' | 'badge_earned' | 'level_up' | 'streak' | 'general'
}): Promise<NotificationsResponse> {
  return api.get<NotificationsResponse>(STUDENT_ENDPOINTS.notifications.list, {
    params: params
      ? {
          ...params,
          read: params.read !== undefined ? String(params.read) : undefined,
        }
      : undefined,
  })
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<StudentNotification> {
  return api.patch<StudentNotification>(STUDENT_ENDPOINTS.notifications.markRead(notificationId))
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<{ updatedCount: number }> {
  return api.patch<{ updatedCount: number }>(STUDENT_ENDPOINTS.notifications.markAllRead)
}
