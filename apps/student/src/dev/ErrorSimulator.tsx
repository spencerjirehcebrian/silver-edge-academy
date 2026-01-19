import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

type ErrorType = 'render' | 'chunk' | 'auth' | 'network' | 'async'

/**
 * Development-only component for testing error boundaries
 * Only shown in development mode
 */
export function ErrorSimulator() {
  const [shouldError, setShouldError] = useState(false)
  const [errorType, setErrorType] = useState<ErrorType>('render')

  if (!import.meta.env.DEV) {
    return null
  }

  const throwError = (type: ErrorType) => {
    setErrorType(type)
    setShouldError(true)
  }

  if (shouldError) {
    switch (errorType) {
      case 'render':
        throw new Error('Test render error: Something went wrong rendering this component')
      case 'chunk':
        throw new Error('Loading chunk 123 failed. (missing: http://localhost:5173/assets/chunk-ABC123.js)')
      case 'auth':
        throw Object.assign(new Error('Unauthorized: Your session has expired'), { name: 'AuthError' })
      case 'network':
        throw new Error('Network error: Failed to fetch data from server')
      case 'async':
        throw new Error('Failed to fetch dynamically imported module')
      default:
        throw new Error('Unknown error type')
    }
  }

  return (
    <Card className="border-4 border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50">
      <CardHeader>
        <CardTitle>Error Simulator (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Test error boundaries by triggering different error types
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => throwError('render')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg text-sm"
            >
              Throw Render Error
            </button>

            <button
              onClick={() => throwError('chunk')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg text-sm"
            >
              Throw Chunk Error
            </button>

            <button
              onClick={() => throwError('auth')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg text-sm"
            >
              Throw Auth Error
            </button>

            <button
              onClick={() => throwError('network')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg text-sm"
            >
              Throw Network Error
            </button>

            <button
              onClick={() => throwError('async')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg text-sm col-span-full"
            >
              Throw Async Error
            </button>
          </div>

          <div className="crystal-glass rounded-xl p-3 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700 mb-1">Each button tests a different scenario:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Render Error: Tests component render failures</li>
              <li>Chunk Error: Tests lazy loading failures (code splitting)</li>
              <li>Auth Error: Tests authentication errors (shows logout option)</li>
              <li>Network Error: Tests network connectivity issues</li>
              <li>Async Error: Tests dynamic import failures</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
