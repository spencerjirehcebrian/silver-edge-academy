import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { classifyError } from '@silveredge/shared'
import { logError } from '@/utils/errorLogger'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type FallbackType = 'inline' | 'card' | 'minimal'

interface Props {
  children: ReactNode
  fallbackType?: FallbackType
  featureName?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Feature-level error boundary for wrapping complex components
 * Provides different fallback types based on context
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { featureName, onError } = this.props
    const context = featureName ? `FeatureErrorBoundary:${featureName}` : 'FeatureErrorBoundary'

    logError(error, errorInfo, context)

    if (onError) {
      onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  renderFallback() {
    const { fallbackType = 'card', featureName } = this.props
    const { error } = this.state
    const errorClassification = error ? classifyError(error) : null

    if (fallbackType === 'minimal') {
      return (
        <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">Error loading {featureName || 'content'}</p>
          <Button variant="ghost" size="sm" onClick={this.handleReset} className="ml-2">
            Retry
          </Button>
        </div>
      )
    }

    if (fallbackType === 'inline') {
      return (
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Error loading {featureName || 'this section'}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {errorClassification?.message || 'Please try again'}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={this.handleReset} icon={<RefreshCw className="h-3 w-3" />}>
            Retry
          </Button>
        </div>
      )
    }

    // Card fallback (default)
    return (
      <Card className="max-w-lg mx-auto">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Error Loading {featureName || 'Content'}
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              {errorClassification?.message ||
                'Something went wrong while loading this feature. Please try again.'}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="primary" onClick={this.handleReset} icon={<RefreshCw className="h-4 w-4" />}>
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback()
    }

    return this.props.children
  }
}
