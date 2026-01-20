import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type { StudentHelpRequest } from '@/types/student'

// ============================================================================
// Types
// ============================================================================

// Backend returns array directly (unwrapped by API client)
export type HelpRequestsListResponse = StudentHelpRequest[]
export type HelpRequestResponse = StudentHelpRequest

export interface CreateHelpRequestInput {
  lessonId: string
  exerciseId?: string
  message: string
  codeSnapshot?: string
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get list of help requests
 */
export async function getHelpRequests(params?: {
  page?: number
  limit?: number
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed'
}): Promise<HelpRequestsListResponse> {
  return api.get<HelpRequestsListResponse>(STUDENT_ENDPOINTS.helpRequests.list, { params })
}

/**
 * Get a help request by ID
 */
export async function getHelpRequest(requestId: string): Promise<HelpRequestResponse> {
  return api.get<HelpRequestResponse>(STUDENT_ENDPOINTS.helpRequests.detail(requestId))
}

/**
 * Create a new help request
 */
export async function createHelpRequest(data: CreateHelpRequestInput): Promise<StudentHelpRequest> {
  return api.post<StudentHelpRequest>(STUDENT_ENDPOINTS.helpRequests.create, data)
}
