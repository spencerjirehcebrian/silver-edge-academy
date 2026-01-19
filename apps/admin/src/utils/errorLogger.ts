import type React from 'react'
import { logError as sharedLogError } from '@silveredge/shared'

/**
 * Centralized error logging for the admin app
 * Wraps shared logger and adds admin-specific context
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
  sharedLogError(error, normalizedErrorInfo, `Admin:${context}`)

  // Hook point for admin-specific monitoring or analytics
  // Example: Send to admin dashboard analytics
  // if (window.adminAnalytics) {
  //   window.adminAnalytics.trackError(error, context)
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
