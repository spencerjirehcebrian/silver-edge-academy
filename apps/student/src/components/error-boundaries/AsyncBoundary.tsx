import { Component, ReactNode, Suspense } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { isChunkLoadError } from '@silveredge/shared'
import { logError } from '@/utils/errorLogger'
import { reloadWithCacheBust } from '@/utils/errorRecovery'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  isRetrying: boolean
}

/**
 * Specialized error boundary for lazy-loaded components in the student app
 * Handles chunk loading failures with cache-busting retry
 * Features playful, encouraging design
 */
export class AsyncBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    isRetrying: false,
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, errorInfo, 'AsyncBoundary')
  }

  handleRetry = () => {
    const { error } = this.state

    if (error && isChunkLoadError(error)) {
      // For chunk errors, reload with cache bust
      this.setState({ isRetrying: true })
      setTimeout(() => {
        reloadWithCacheBust()
      }, 500)
    } else {
      // For other errors, reset boundary
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, isRetrying } = this.state
      const isChunkError = error && isChunkLoadError(error)

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="crystal-glass rounded-2xl p-8 max-w-md text-center space-y-4 crystal-shimmer">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-coral-500 crystal-refract">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-display font-bold text-slate-800">
                {isChunkError ? 'New Update Available!' : 'Loading Hiccup'}
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                {isChunkError
                  ? "We've made some improvements! Let's reload to get the latest version."
                  : "Something went wrong while loading this section. Let's try again!"}
              </p>
            </div>

            <button
              onClick={this.handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isRetrying ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reloading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {isChunkError ? 'Reload Now' : 'Try Again'}
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 italic">
              You&apos;re doing great! Keep learning!
            </p>
          </div>
        </div>
      )
    }

    // Wrap children in Suspense with fallback
    return (
      <Suspense
        fallback={
          this.props.fallback || (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-coral-500 crystal-refract animate-pulse"></div>
                <p className="mt-4 text-sm text-slate-600 font-medium">Loading...</p>
              </div>
            </div>
          )
        }
      >
        {this.props.children}
      </Suspense>
    )
  }
}
