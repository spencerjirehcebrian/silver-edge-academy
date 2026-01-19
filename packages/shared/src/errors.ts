/**
 * Error classification and utilities for error boundaries
 */

export enum ErrorType {
  RENDER_ERROR = 'RENDER_ERROR',
  CHUNK_LOAD_ERROR = 'CHUNK_LOAD_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ErrorInfo {
  type: ErrorType
  severity: 'critical' | 'high' | 'medium' | 'low'
  recoverable: boolean
  requiresAuth: boolean
  message: string
  technicalDetails?: string
}

/**
 * Classifies an error based on its type and message
 */
export function classifyError(error: Error): ErrorInfo {
  const errorMessage = error.message?.toLowerCase() || ''
  const errorName = error.name?.toLowerCase() || ''

  // Chunk loading errors (code splitting failures)
  if (
    errorMessage.includes('loading chunk') ||
    errorMessage.includes('failed to fetch dynamically imported module') ||
    errorMessage.includes('dynamically imported module') ||
    errorName.includes('chunkerror')
  ) {
    return {
      type: ErrorType.CHUNK_LOAD_ERROR,
      severity: 'medium',
      recoverable: true,
      requiresAuth: false,
      message: 'Failed to load part of the application. This might be due to a network issue or an updated version.',
      technicalDetails: error.message,
    }
  }

  // Authentication errors
  if (
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('token') ||
    errorMessage.includes('session expired') ||
    error.name === 'AuthError'
  ) {
    return {
      type: ErrorType.AUTH_ERROR,
      severity: 'high',
      recoverable: true,
      requiresAuth: true,
      message: 'Your session has expired or you are not authorized to access this resource.',
      technicalDetails: error.message,
    }
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('failed to fetch') ||
    errorName.includes('networkerror')
  ) {
    return {
      type: ErrorType.NETWORK_ERROR,
      severity: 'medium',
      recoverable: true,
      requiresAuth: false,
      message: 'Network connection issue. Please check your internet connection and try again.',
      technicalDetails: error.message,
    }
  }

  // Render errors (component failures)
  if (
    errorMessage.includes('render') ||
    errorMessage.includes('cannot read property') ||
    errorMessage.includes('undefined is not an object') ||
    errorMessage.includes('null is not an object')
  ) {
    return {
      type: ErrorType.RENDER_ERROR,
      severity: 'high',
      recoverable: true,
      requiresAuth: false,
      message: 'Something went wrong while displaying this content.',
      technicalDetails: error.message,
    }
  }

  // Unknown error
  return {
    type: ErrorType.UNKNOWN_ERROR,
    severity: 'high',
    recoverable: true,
    requiresAuth: false,
    message: 'An unexpected error occurred.',
    technicalDetails: error.message,
  }
}

/**
 * Logs error details to console (can be extended for monitoring services)
 */
export function logError(
  error: Error,
  errorInfo: { componentStack?: string } | null,
  context: string
): void {
  const classification = classifyError(error)

  console.group(`[Error Boundary: ${context}]`)
  console.error('Error:', error)
  console.error('Error Type:', classification.type)
  console.error('Severity:', classification.severity)
  console.error('Message:', classification.message)

  if (errorInfo?.componentStack) {
    console.error('Component Stack:', errorInfo.componentStack)
  }

  if (error.stack) {
    console.error('Stack Trace:', error.stack)
  }

  console.groupEnd()

  // Hook point for monitoring services (Sentry, LogRocket, etc.)
  // if (window.errorMonitoring) {
  //   window.errorMonitoring.captureException(error, {
  //     context,
  //     classification,
  //     componentStack: errorInfo?.componentStack,
  //   })
  // }
}

/**
 * Checks if the error is likely caused by a chunk loading failure
 */
export function isChunkLoadError(error: Error): boolean {
  const errorMessage = error.message?.toLowerCase() || ''
  return (
    errorMessage.includes('loading chunk') ||
    errorMessage.includes('failed to fetch dynamically imported module') ||
    errorMessage.includes('dynamically imported module')
  )
}

/**
 * Checks if the error requires authentication
 */
export function isAuthError(error: Error): boolean {
  const classification = classifyError(error)
  return classification.type === ErrorType.AUTH_ERROR || classification.requiresAuth
}
