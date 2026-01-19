import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { classifyError } from '@silveredge/shared'
import { logError } from '@/utils/errorLogger'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Layout-level error boundary that shows an inline error message
 * while keeping the sidebar and navigation functional
 */
export class LayoutErrorBoundary extends Component<Props, State> {
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
    logError(error, errorInfo, 'LayoutErrorBoundary')
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state
      const errorClassification = error ? classifyError(error) : null

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Error Loading Content
            </h2>

            <p className="text-sm text-slate-600">
              {errorClassification?.message ||
                'Something went wrong while loading this section. Please try again.'}
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <Button variant="primary" onClick={this.handleReset} icon={<RefreshCw className="h-4 w-4" />}>
                Try Again
              </Button>

              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
