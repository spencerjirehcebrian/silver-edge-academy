import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy } from 'react'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AsyncBoundary } from '@/components/error-boundaries/AsyncBoundary'

// Lazy load pages
const Login = lazy(() => import('@/pages/Auth/Login'))
const LearnPage = lazy(() => import('@/pages/Learn/LearnPage'))
const CourseList = lazy(() => import('@/pages/Courses/CourseList'))
const CourseMap = lazy(() => import('@/pages/Courses/CourseMap'))
const LessonView = lazy(() => import('@/pages/Lessons/LessonView'))
const ExerciseView = lazy(() => import('@/pages/Exercises/ExerciseView'))
const QuizView = lazy(() => import('@/pages/Quizzes/QuizView'))
const SandboxList = lazy(() => import('@/pages/Sandbox/SandboxList'))
const SandboxEditor = lazy(() => import('@/pages/Sandbox/SandboxEditor'))
const ShopPage = lazy(() => import('@/pages/Shop/ShopPage'))
const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage'))
const AvatarSelection = lazy(() => import('@/pages/Profile/AvatarSelection'))
const HelpRequestsPage = lazy(() => import('@/pages/Help/HelpRequestsPage'))
const NotificationsPage = lazy(() => import('@/pages/Notifications/NotificationsPage'))

// Loading fallback with violet spinner
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )
}

// Wrap lazy components with AsyncBoundary (includes Suspense + error handling)
function withSuspense(Component: React.LazyExoticComponent<React.ComponentType<object>>) {
  return (
    <AsyncBoundary fallback={<PageLoader />}>
      <Component />
    </AsyncBoundary>
  )
}

export const router = createBrowserRouter([
  {
    path: '/app/login',
    element: withSuspense(Login),
  },
  {
    // Protected routes - requires authentication
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/app',
        element: <StudentLayout />,
        errorElement: <ErrorBoundary />,
        children: [
          // Learn (Home)
          { index: true, element: withSuspense(LearnPage) },

          // Courses
          { path: 'courses', element: withSuspense(CourseList) },
          { path: 'courses/:courseId', element: withSuspense(CourseMap) },
          { path: 'courses/:courseId/lessons/:lessonId', element: withSuspense(LessonView) },
          { path: 'courses/:courseId/lessons/:lessonId/exercises/:exerciseId', element: withSuspense(ExerciseView) },
          { path: 'courses/:courseId/lessons/:lessonId/quizzes/:quizId', element: withSuspense(QuizView) },

          // Sandbox (Code)
          { path: 'sandbox', element: withSuspense(SandboxList) },
          { path: 'sandbox/:projectId', element: withSuspense(SandboxEditor) },

          // Shop (will be moved to Profile tab later, keeping for backwards compat)
          { path: 'shop', element: withSuspense(ShopPage) },

          // Profile (Me)
          { path: 'profile', element: withSuspense(ProfilePage) },
          { path: 'profile/avatar', element: withSuspense(AvatarSelection) },

          // Help
          { path: 'help', element: withSuspense(HelpRequestsPage) },

          // Notifications
          { path: 'notifications', element: withSuspense(NotificationsPage) },
        ],
      },
    ],
  },
  {
    // Catch-all redirect to home
    path: '*',
    element: <Navigate to="/app" replace />,
  },
])
