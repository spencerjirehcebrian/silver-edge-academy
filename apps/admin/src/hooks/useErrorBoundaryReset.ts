import { useCallback } from 'react'

/**
 * Hook for programmatically resetting error boundaries
 * Can be used to reset boundaries from within the error fallback or from external components
 */
export function useErrorBoundaryReset() {
  const reset = useCallback(() => {
    // Force a re-render by updating the key of the error boundary
    // This is typically handled by the error boundary's internal state
    // But can be extended to work with React Query or other state management
    window.location.reload()
  }, [])

  const resetToHome = useCallback(() => {
    window.location.href = '/'
  }, [])

  return {
    reset,
    resetToHome,
  }
}
