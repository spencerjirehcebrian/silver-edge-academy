import { isChunkLoadError, isAuthError } from '@silveredge/shared'

/**
 * Reloads the page with cache busting to fix chunk loading errors
 */
export function reloadWithCacheBust(): void {
  // Add timestamp to force cache refresh
  const url = new URL(window.location.href)
  url.searchParams.set('_reload', Date.now().toString())
  window.location.href = url.toString()
}

/**
 * Resets to home page
 */
export function resetToHome(): void {
  window.location.href = '/app'
}

/**
 * Handles authentication errors by clearing session and redirecting to login
 */
export function handleAuthError(): void {
  // Clear any stored auth tokens
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  sessionStorage.clear()

  // Redirect to login
  window.location.href = '/app/login'
}

/**
 * Determines the appropriate recovery action based on error type
 */
export function getRecoveryAction(error: Error): {
  primary: () => void
  secondary?: () => void
  logout?: () => void
} {
  if (isChunkLoadError(error)) {
    return {
      primary: reloadWithCacheBust,
      secondary: resetToHome,
    }
  }

  if (isAuthError(error)) {
    return {
      primary: handleAuthError,
      logout: handleAuthError,
    }
  }

  return {
    primary: () => window.location.reload(),
    secondary: resetToHome,
  }
}

/**
 * Saves code to localStorage for recovery
 */
export function saveCodeForRecovery(code: string, context: string): void {
  try {
    const key = `code_recovery_${context}_${Date.now()}`
    localStorage.setItem(key, code)
    localStorage.setItem('code_recovery_latest', key)
  } catch (error) {
    console.error('Failed to save code for recovery:', error)
  }
}

/**
 * Retrieves saved code from localStorage
 */
export function retrieveSavedCode(): string | null {
  try {
    const latestKey = localStorage.getItem('code_recovery_latest')
    if (latestKey) {
      return localStorage.getItem(latestKey)
    }
  } catch (error) {
    console.error('Failed to retrieve saved code:', error)
  }
  return null
}

/**
 * Clears application cache and storage
 */
export function clearAppCache(): void {
  // Clear localStorage (except important items)
  const keysToPreserve = ['theme', 'preferences', 'code_recovery_latest']
  const storage: Record<string, string> = {}

  keysToPreserve.forEach((key) => {
    const value = localStorage.getItem(key)
    if (value) storage[key] = value
  })

  // Also preserve any code recovery keys
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('code_recovery_')) {
      const value = localStorage.getItem(key)
      if (value) storage[key] = value
    }
  })

  localStorage.clear()

  Object.entries(storage).forEach(([key, value]) => {
    localStorage.setItem(key, value)
  })

  // Clear sessionStorage
  sessionStorage.clear()

  // Reload with cache bust
  reloadWithCacheBust()
}
