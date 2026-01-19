import { Component, ReactNode } from 'react'
import { Frown, Home, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { classifyError, type ErrorInfo as SharedErrorInfo } from '@silveredge/shared'
import { logError } from '@/utils/errorLogger'
import { getRecoveryAction, handleAuthError, resetToHome } from '@/utils/errorRecovery'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorClassification: SharedErrorInfo | null
  showDetails: boolean
}

/**
 * Root-level error boundary for the student app
 * Catches all component render errors (not router errors)
 * Features crystal glass styling with violet/coral colors and friendly messages
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorClassification: null,
    showDetails: false,
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorClassification: classifyError(error),
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with context
    logError(error, errorInfo, 'RootErrorBoundary')

    // Update state with error info
    this.setState({
      errorInfo,
    })
  }

  handleReload = () => {
    const { error } = this.state
    if (error) {
      const actions = getRecoveryAction(error)
      actions.primary()
    } else {
      window.location.reload()
    }
  }

  handleGoHome = () => {
    resetToHome()
  }

  handleLogout = () => {
    handleAuthError()
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorClassification, showDetails } = this.state
      const isDev = import.meta.env.DEV

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-500/10 via-violet-400/5 to-coral-500/10">
          <div className="max-w-2xl w-full crystal-glass rounded-2xl p-8 shadow-2xl crystal-shimmer">
            <div className="flex flex-col items-center text-center">
              {/* Friendly Error Icon */}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-600 crystal-refract">
                <Frown className="h-10 w-10 text-white" />
              </div>

              {/* Friendly Title */}
              <h1 className="text-3xl font-display font-bold text-slate-800 mb-3">
                Oops! Something went a bit wonky!
              </h1>

              {/* Friendly Message */}
              <p className="text-slate-600 mb-8 max-w-md text-lg">
                {errorClassification?.message ||
                  "Don&apos;t worry, these things happen! Let&apos;s get you back on track."}
              </p>

              {/* Recovery Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[44px]"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 text-white font-medium hover:from-coral-600 hover:to-coral-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[44px]"
                >
                  <Home className="h-5 w-5" />
                  Go Home
                </button>

                {errorClassification?.requiresAuth && (
                  <button
                    onClick={this.handleLogout}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl crystal-glass text-slate-700 font-medium hover:bg-white/50 transition-all min-h-[44px]"
                  >
                    Logout
                  </button>
                )}
              </div>

              {/* Encouraging Message */}
              <p className="text-sm text-slate-500 italic">
                You&apos;re doing great! Everyone hits a bump in the road sometimes.
              </p>

              {/* Dev Mode: Error Details */}
              {isDev && error && (
                <div className="w-full mt-8 border-t border-slate-200/50 pt-6">
                  <button
                    onClick={this.toggleDetails}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 mx-auto mb-4 transition-colors"
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Error Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show Error Details (Dev Mode)
                      </>
                    )}
                  </button>

                  {showDetails && (
                    <div className="text-left space-y-4">
                      {/* Error Classification */}
                      {errorClassification && (
                        <div className="crystal-glass rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-slate-900 mb-2">
                            Error Classification
                          </h3>
                          <dl className="space-y-1 text-xs">
                            <div className="flex gap-2">
                              <dt className="font-medium text-slate-600">Type:</dt>
                              <dd className="text-slate-900">{errorClassification.type}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="font-medium text-slate-600">Severity:</dt>
                              <dd className="text-slate-900">{errorClassification.severity}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="font-medium text-slate-600">Recoverable:</dt>
                              <dd className="text-slate-900">
                                {errorClassification.recoverable ? 'Yes' : 'No'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      )}

                      {/* Error Message */}
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <h3 className="text-sm font-semibold text-red-900 mb-2">Error Message</h3>
                        <p className="text-xs text-red-800 font-mono">{error.message}</p>
                      </div>

                      {/* Stack Trace */}
                      {error.stack && (
                        <div className="crystal-glass rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-slate-900 mb-2">Stack Trace</h3>
                          <pre className="text-xs text-slate-700 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                            {error.stack}
                          </pre>
                        </div>
                      )}

                      {/* Component Stack */}
                      {errorInfo?.componentStack && (
                        <div className="crystal-glass rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-slate-900 mb-2">
                            Component Stack
                          </h3>
                          <pre className="text-xs text-slate-700 font-mono overflow-x-auto whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
