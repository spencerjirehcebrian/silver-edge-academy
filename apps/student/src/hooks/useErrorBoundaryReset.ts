import { useCallback } from 'react'

/**
 * Hook for programmatically resetting error boundaries in the student app
 * Can be used to reset boundaries from within the error fallback or from external components
 */
export function useErrorBoundaryReset() {
  const reset = useCallback(() => {
    // Force a re-render by reloading the page
    // This can be extended to work with React Query or other state management
    window.location.reload()
  }, [])

  const resetToHome = useCallback(() => {
    window.location.href = '/app'
  }, [])

  return {
    reset,
    resetToHome,
  }
}
