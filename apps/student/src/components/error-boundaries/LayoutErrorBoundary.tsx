import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { classifyError } from '@silveredge/shared'
import { logError } from '@/utils/errorLogger'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Layout-level error boundary for the student app
 * Shows an inline error message while keeping the navigation functional
 * Features playful, encouraging design with crystal effects
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
          <div className="max-w-md w-full text-center space-y-4 crystal-glass rounded-2xl p-6">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 crystal-refract">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>

            <h2 className="text-lg font-display font-bold text-slate-800">
              Oops! A Little Hiccup
            </h2>

            <p className="text-sm text-slate-600">
              {errorClassification?.message ||
                "Something went wrong while loading this section. Let's try again!"}
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl crystal-glass text-slate-700 font-medium hover:bg-white/50 transition-all min-h-[44px]"
              >
                Reload Page
              </button>
            </div>

            <p className="text-xs text-slate-500 italic">
              Keep going! You&apos;re doing great!
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
