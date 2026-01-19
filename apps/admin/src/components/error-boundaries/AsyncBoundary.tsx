import { Component, ReactNode, Suspense } from 'react'
import { RefreshCw, Wifi } from 'lucide-react'
import { isChunkLoadError } from '@silveredge/shared'
import { logError } from '@/utils/errorLogger'
import { reloadWithCacheBust } from '@/utils/errorRecovery'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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
 * Specialized error boundary for lazy-loaded components
 * Handles chunk loading failures with cache-busting retry
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
          <Card className="max-w-md">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Wifi className="h-6 w-6 text-indigo-600" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {isChunkError ? 'Update Available' : 'Error Loading Component'}
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  {isChunkError
                    ? 'A newer version of this page is available. Please reload to continue.'
                    : 'Something went wrong while loading this component. Please try again.'}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={this.handleRetry}
                  isLoading={isRetrying}
                  icon={!isRetrying ? <RefreshCw className="h-4 w-4" /> : undefined}
                >
                  {isChunkError ? 'Reload Now' : 'Try Again'}
                </Button>
              </div>
            </div>
          </Card>
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
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-4 text-sm text-slate-600">Loading...</p>
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
