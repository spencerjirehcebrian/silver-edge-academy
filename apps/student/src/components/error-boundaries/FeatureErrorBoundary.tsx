import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react'
import { classifyError } from '@silveredge/shared'
import { logError } from '@/utils/errorLogger'

type FallbackType = 'playful' | 'card' | 'minimal'

interface Props {
  children: ReactNode
  fallbackType?: FallbackType
  featureName?: string
  showHelpButton?: boolean
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Feature-level error boundary for wrapping complex components in the student app
 * Provides different fallback types based on context with playful, encouraging design
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

  handleAskForHelp = () => {
    // TODO: Integrate with help request system
    alert('Help request feature coming soon!')
  }

  renderFallback() {
    const { fallbackType = 'playful', featureName, showHelpButton = false } = this.props
    const { error } = this.state
    const errorClassification = error ? classifyError(error) : null

    if (fallbackType === 'minimal') {
      return (
        <div className="flex items-center justify-center p-3 bg-orange-50 rounded-xl border border-orange-200">
          <p className="text-sm text-orange-700">Error loading {featureName || 'content'}</p>
          <button
            onClick={this.handleReset}
            className="ml-3 px-3 py-1.5 text-xs rounded-lg crystal-glass text-slate-700 hover:bg-white/50 transition-all"
          >
            Retry
          </button>
        </div>
      )
    }

    if (fallbackType === 'card') {
      return (
        <div className="crystal-glass rounded-2xl p-6 max-w-lg mx-auto">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 crystal-refract">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-display font-bold text-slate-800">
                Uh-oh! {featureName ? `${featureName} Hit a Snag` : 'Something Went Wrong'}
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                {errorClassification?.message ||
                  'Don\'t worry! Let\'s try loading this again.'}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              {showHelpButton && (
                <button
                  onClick={this.handleAskForHelp}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl crystal-glass text-slate-700 font-medium hover:bg-white/50 transition-all min-h-[44px]"
                >
                  <HelpCircle className="h-4 w-4" />
                  Ask for Help
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    // Playful fallback (default)
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-coral-50 rounded-xl border-2 border-violet-200/50 crystal-shimmer">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-coral-500 crystal-refract flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-slate-800">
              Oops! {featureName || 'This section'} had a little hiccup!
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {errorClassification?.message || 'Let\'s give it another go!'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg hover:scale-105 min-h-[44px]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>

          {showHelpButton && (
            <button
              onClick={this.handleAskForHelp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg crystal-glass text-slate-700 text-sm font-medium hover:bg-white/50 transition-all min-h-[44px]"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Help
            </button>
          )}
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback()
    }

    return this.props.children
  }
}
