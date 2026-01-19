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
 * Resets to home/dashboard page
 */
export function resetToHome(): void {
  window.location.href = '/'
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
  window.location.href = '/login'
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
 * Clears application cache and storage
 */
export function clearAppCache(): void {
  // Clear localStorage (except important items)
  const keysToPreserve = ['theme', 'preferences']
  const storage: Record<string, string> = {}

  keysToPreserve.forEach((key) => {
    const value = localStorage.getItem(key)
    if (value) storage[key] = value
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
