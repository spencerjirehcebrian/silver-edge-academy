import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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
    <Card className="border-2 border-orange-300 bg-orange-50">
      <CardHeader
        title="Error Simulator (Dev Only)"
        description="Test error boundaries by triggering different error types"
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="danger" size="sm" onClick={() => throwError('render')}>
            Throw Render Error
          </Button>
          <Button variant="danger" size="sm" onClick={() => throwError('chunk')}>
            Throw Chunk Error
          </Button>
          <Button variant="danger" size="sm" onClick={() => throwError('auth')}>
            Throw Auth Error
          </Button>
          <Button variant="danger" size="sm" onClick={() => throwError('network')}>
            Throw Network Error
          </Button>
          <Button variant="danger" size="sm" onClick={() => throwError('async')}>
            Throw Async Error
          </Button>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <p>Each button tests a different error boundary scenario:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Render Error: Tests component render failures</li>
            <li>Chunk Error: Tests lazy loading failures (simulates code splitting errors)</li>
            <li>Auth Error: Tests authentication/authorization errors (shows logout option)</li>
            <li>Network Error: Tests network connectivity issues</li>
            <li>Async Error: Tests dynamic import failures</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
