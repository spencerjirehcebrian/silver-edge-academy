import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type { Badge } from '@silveredge/shared'

// ============================================================================
// Types
// ============================================================================

export type StudentBadge = Badge & {
  isEarned: boolean
  earnedAt?: string
}

export interface BadgesResponse {
  earned: StudentBadge[]
  locked: StudentBadge[]
  totalEarned: number
  totalAvailable: number
}

export interface XpHistoryItem {
  id: string
  amount: number
  actionType: string
  sourceId?: string
  description?: string
  createdAt: string
}

export interface XpHistoryResponse {
  history: XpHistoryItem[]
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all badges with earned status
 */
export async function getBadges(): Promise<BadgesResponse> {
  return api.get<BadgesResponse>(STUDENT_ENDPOINTS.badges, { unwrapData: false })
}

/**
 * Get XP transaction history
 */
export async function getXpHistory(params?: {
  page?: number
  limit?: number
  actionType?: string
}): Promise<XpHistoryResponse> {
  return api.get<XpHistoryResponse>(STUDENT_ENDPOINTS.xpHistory, {
    params,
    unwrapData: false,
  })
}
