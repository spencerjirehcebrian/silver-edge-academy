import { Component, ReactNode } from 'react'
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react'
import { classifyError } from '@silveredge/shared'
import { logError } from '@/utils/errorLogger'
import { saveCodeForRecovery, retrieveSavedCode } from '@/utils/errorRecovery'

interface Props {
  children: ReactNode
  code?: string
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
  codeSaved: boolean
}

/**
 * Specialized error boundary for code editor/sandbox components
 * Preserves code in localStorage and provides recovery options
 * Shows encouraging message that code is safe
 */
export class CodeEditorErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    codeSaved: false,
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { code, context = 'editor' } = this.props

    logError(error, errorInfo, `CodeEditorErrorBoundary:${context}`)

    // Save code to localStorage for recovery
    if (code) {
      saveCodeForRecovery(code, context)
      this.setState({ codeSaved: true })
    }
  }

  handleRestoreAndReload = () => {
    // Reload the page - code will be restored from localStorage by the editor
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const { error, codeSaved } = this.state
      const errorClassification = error ? classifyError(error) : null

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="crystal-glass rounded-2xl p-8 max-w-lg text-center space-y-6 crystal-shimmer">
            {/* Reassuring Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 crystal-refract">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Reassuring Title */}
            <div>
              <h3 className="text-xl font-display font-bold text-slate-800 mb-2">
                Your Code is Safe!
              </h3>
              <p className="text-sm text-slate-600">
                {codeSaved
                  ? "We've saved your code! The editor had a small hiccup, but your hard work is protected."
                  : "The editor encountered an issue, but don't worry!"}
              </p>
            </div>

            {/* Error Message */}
            {errorClassification && (
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-orange-900 mb-1">What happened?</p>
                    <p className="text-xs text-orange-700">{errorClassification.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recovery Actions */}
            <div className="space-y-3">
              {codeSaved && (
                <button
                  onClick={this.handleRestoreAndReload}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[44px]"
                >
                  <Shield className="h-5 w-5" />
                  Restore and Reload
                </button>
              )}

              <button
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[44px]"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl crystal-glass text-slate-700 font-medium hover:bg-white/50 transition-all min-h-[44px]"
              >
                Reload Page
              </button>
            </div>

            {/* Encouraging Message */}
            <div className="pt-4 border-t border-slate-200/50">
              <p className="text-xs text-slate-600 italic">
                Every great coder faces bugs. You&apos;re doing amazing! Keep coding!
              </p>
              {codeSaved && (
                <p className="text-xs text-green-600 font-medium mt-2">
                  Your code has been auto-saved and will be restored when you reload.
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook to retrieve saved code after error recovery
 */
export function useSavedCode(): string | null {
  return retrieveSavedCode()
}
