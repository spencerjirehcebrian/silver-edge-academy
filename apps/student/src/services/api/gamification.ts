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

// Backend returns array of badges directly, not separated into earned/locked
export type BadgesResponse = StudentBadge[]

export interface XpHistoryItem {
  id: string
  amount: number
  actionType: string
  sourceId?: string
  description?: string
  createdAt: string
}

// Backend returns paginated response with data and meta
export interface XpHistoryResponse {
  data: XpHistoryItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all badges with earned status
 */
export async function getBadges(): Promise<BadgesResponse> {
  return api.get<BadgesResponse>(STUDENT_ENDPOINTS.badges)
}

/**
 * Get XP transaction history
 */
export async function getXpHistory(params?: {
  page?: number
  limit?: number
  actionType?: string
}): Promise<XpHistoryResponse> {
  // Use unwrapData: false to preserve pagination meta
  return api.get<XpHistoryResponse>(STUDENT_ENDPOINTS.xpHistory, { params, unwrapData: false })
}
