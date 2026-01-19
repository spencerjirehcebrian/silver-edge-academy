import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { classifyError } from '@silveredge/shared'
import { logError } from '@/utils/errorLogger'

/**
 * Router-level error boundary for the student app
 * Catches navigation and route loading errors
 */
export function ErrorBoundary() {
  const error = useRouteError()
  const [showDetails, setShowDetails] = useState(false)
  const isDev = import.meta.env.DEV

  // Log the error
  useEffect(() => {
    if (error instanceof Error) {
      logError(error, null, 'RouterErrorBoundary')
    }
  }, [error])

  let title = 'Oops! Something went wrong'
  let message = "Don't worry, we can fix this together!"
  let errorClassification = null

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Page Not Found'
      message = "Hmm, we can't find that page. Let's get you back on track!"
    } else if (error.status === 403) {
      title = 'Access Denied'
      message = "You don't have permission to view this page yet. Keep learning to unlock new areas!"
    } else {
      title = `Error ${error.status}`
      message = error.statusText || message
    }
  } else if (error instanceof Error) {
    errorClassification = classifyError(error)
    message = errorClassification.message
  }

  const handleAskForHelp = () => {
    // TODO: Integrate with help request system
    alert('Help request feature coming soon!')
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md crystal-glass rounded-2xl p-8 crystal-shimmer">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center crystal-refract">
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-display font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-slate-600 mb-6">{message}</p>

        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 text-white font-medium hover:from-coral-600 hover:to-coral-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          <button
            onClick={handleAskForHelp}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl crystal-glass text-slate-700 font-medium hover:bg-white/50 transition-all min-h-[44px]"
          >
            <HelpCircle className="w-4 h-4" />
            Ask for Help
          </button>
        </div>

        <p className="text-xs text-slate-500 italic">
          Remember, every coder runs into errors. You&apos;re learning!
        </p>

        {/* Dev Mode: Error Details */}
        {isDev && error ? (
          <div className="mt-6 border-t border-slate-200/50 pt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
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
                    </dl>
                  </div>
                )}

                {/* Error Details */}
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">Error Details</h3>
                  {isRouteErrorResponse(error) ? (
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="font-medium">Status:</span> {error.status}
                      </p>
                      <p>
                        <span className="font-medium">Status Text:</span> {error.statusText}
                      </p>
                      {error.data && (
                        <p>
                          <span className="font-medium">Data:</span>{' '}
                          {typeof error.data === 'string'
                            ? error.data
                            : String(JSON.stringify(error.data))}
                        </p>
                      )}
                    </div>
                  ) : error instanceof Error ? (
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="font-medium">Message:</span> {error.message}
                      </p>
                      {error.stack && (
                        <pre className="mt-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs">Unknown error type</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
