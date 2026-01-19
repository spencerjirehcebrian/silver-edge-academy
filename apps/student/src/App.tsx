import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { GamificationProvider } from '@/contexts/GamificationContext'
import { logQueryError } from '@/utils/errorLogger'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      // Log query errors for monitoring
      throwOnError: (error, query) => {
        logQueryError(error as Error, { queryKey: [...query.queryKey] })
        return false
      },
    },
    mutations: {
      retry: 0,
      // Log mutation errors for monitoring
      onError: (error) => {
        console.error('[Mutation Error]', error)
      },
    },
  },
})

// Wrapper component to provide auth context inside router
function AppWithAuth() {
  return (
    <AuthProvider>
      <ToastProvider>
        <GamificationProvider>
          <RouterProvider router={router} />
        </GamificationProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithAuth />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
