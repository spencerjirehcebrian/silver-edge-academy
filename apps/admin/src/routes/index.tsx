import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminOnlyRoute } from '@/components/auth/AdminOnlyRoute'

// Lazy load pages
const Login = lazy(() => import('@/pages/Auth/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'))
const TeacherList = lazy(() => import('@/pages/Teachers/TeacherList'))
const StudentList = lazy(() => import('@/pages/Students/StudentList'))
const ParentList = lazy(() => import('@/pages/Parents/ParentList'))
const UserCreate = lazy(() => import('@/pages/Users/UserCreate'))
const UserEdit = lazy(() => import('@/pages/Users/UserEdit'))
const UserDetail = lazy(() => import('@/pages/Users/UserDetail'))
const ClassList = lazy(() => import('@/pages/Classes/ClassList'))
const ClassCreate = lazy(() => import('@/pages/Classes/ClassCreate'))
const ClassEdit = lazy(() => import('@/pages/Classes/ClassEdit'))
const ClassDetail = lazy(() => import('@/pages/Classes/ClassDetail'))
const CourseList = lazy(() => import('@/pages/Courses/CourseList'))
const CourseCreate = lazy(() => import('@/pages/Courses/CourseCreate'))
const CourseEdit = lazy(() => import('@/pages/Courses/CourseEdit'))
const CourseDetail = lazy(() => import('@/pages/Courses/CourseDetail'))
const LessonEdit = lazy(() => import('@/pages/Courses/LessonEdit'))
const BadgeList = lazy(() => import('@/pages/Badges/BadgeList'))
const BadgeCreate = lazy(() => import('@/pages/Badges/BadgeCreate'))
const BadgeDetail = lazy(() => import('@/pages/Badges/BadgeDetail'))
const BadgeEdit = lazy(() => import('@/pages/Badges/BadgeEdit'))
const ShopList = lazy(() => import('@/pages/Shop/ShopList'))
const ShopItemCreate = lazy(() => import('@/pages/Shop/ShopItemCreate'))
const ShopItemDetail = lazy(() => import('@/pages/Shop/ShopItemDetail'))
const ShopItemEdit = lazy(() => import('@/pages/Shop/ShopItemEdit'))
const Gamification = lazy(() => import('@/pages/Settings/Gamification'))
const Features = lazy(() => import('@/pages/Settings/Features'))
const System = lazy(() => import('@/pages/Settings/System'))

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
    </div>
  )
}

// Wrap lazy components with Suspense
function withSuspense(Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

// Type-aware wrappers for UserCreate
function TeacherCreate() {
  return (
    <Suspense fallback={<PageLoader />}>
      <UserCreate type="teacher" />
    </Suspense>
  )
}

function ParentCreate() {
  return (
    <Suspense fallback={<PageLoader />}>
      <UserCreate type="parent" />
    </Suspense>
  )
}

function StudentCreate() {
  return (
    <Suspense fallback={<PageLoader />}>
      <UserCreate type="student" />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/admin/login',
    element: withSuspense(Login),
  },
  {
    // Protected routes - requires authentication
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <MainLayout />,
        children: [
          { index: true, element: withSuspense(Dashboard) },

          // Admin-only routes (User Management, Settings)
          {
            element: <AdminOnlyRoute />,
            children: [
              // Teachers
              { path: 'teachers', element: withSuspense(TeacherList) },
              { path: 'teachers/create', element: <TeacherCreate /> },
              { path: 'teachers/:id', element: withSuspense(UserDetail) },
              { path: 'teachers/:id/edit', element: withSuspense(UserEdit) },

              // Parents
              { path: 'parents', element: withSuspense(ParentList) },
              { path: 'parents/create', element: <ParentCreate /> },
              { path: 'parents/:id', element: withSuspense(UserDetail) },
              { path: 'parents/:id/edit', element: withSuspense(UserEdit) },

              // Students
              { path: 'students', element: withSuspense(StudentList) },
              { path: 'students/create', element: <StudentCreate /> },
              { path: 'students/:id', element: withSuspense(UserDetail) },
              { path: 'students/:id/edit', element: withSuspense(UserEdit) },

              // Settings - admin only
              { path: 'gamification', element: withSuspense(Gamification) },
              { path: 'features', element: withSuspense(Features) },
              { path: 'system', element: withSuspense(System) },
            ],
          },

          // Shared routes (accessible by both admin and teacher)
          // Classes
          { path: 'classes', element: withSuspense(ClassList) },
          { path: 'classes/create', element: withSuspense(ClassCreate) },
          { path: 'classes/:id', element: withSuspense(ClassDetail) },
          { path: 'classes/:id/edit', element: withSuspense(ClassEdit) },

          // Courses
          { path: 'courses', element: withSuspense(CourseList) },
          { path: 'courses/create', element: withSuspense(CourseCreate) },
          { path: 'courses/:id', element: withSuspense(CourseDetail) },
          { path: 'courses/:id/edit', element: withSuspense(CourseEdit) },
          {
            path: 'courses/:courseId/sections/:sectionId/lessons/:lessonId',
            element: withSuspense(LessonEdit),
          },

          // Badges
          { path: 'badges', element: withSuspense(BadgeList) },
          { path: 'badges/create', element: withSuspense(BadgeCreate) },
          { path: 'badges/:id', element: withSuspense(BadgeDetail) },
          { path: 'badges/:id/edit', element: withSuspense(BadgeEdit) },

          // Shop
          { path: 'shop', element: withSuspense(ShopList) },
          { path: 'shop/create', element: withSuspense(ShopItemCreate) },
          { path: 'shop/:id', element: withSuspense(ShopItemDetail) },
          { path: 'shop/:id/edit', element: withSuspense(ShopItemEdit) },
        ],
      },
    ],
  },
])
