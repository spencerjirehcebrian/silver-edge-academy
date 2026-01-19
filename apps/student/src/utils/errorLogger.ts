import type React from 'react'
import { logError as sharedLogError } from '@silveredge/shared'

/**
 * Centralized error logging for the student app
 * Wraps shared logger and adds student-specific context
 */
export function logError(
  error: Error,
  errorInfo: React.ErrorInfo | { componentStack?: string } | null,
  context: string
): void {
  // Convert React.ErrorInfo to the format expected by shared logger
  const normalizedErrorInfo = errorInfo
    ? { componentStack: errorInfo.componentStack ?? undefined }
    : null

  // Use shared logger
  sharedLogError(error, normalizedErrorInfo, `Student:${context}`)

  // Hook point for student-specific monitoring or analytics
  // Example: Track errors for educational insights
  // if (window.studentAnalytics) {
  //   window.studentAnalytics.trackError(error, context)
  // }
}

/**
 * Log query errors from React Query
 */
export function logQueryError(error: Error, query: { queryKey: unknown[] }): void {
  console.group('[React Query Error]')
  console.error('Query Key:', query.queryKey)
  console.error('Error:', error)
  console.groupEnd()
}
