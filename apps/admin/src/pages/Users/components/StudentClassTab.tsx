import { AlertCircle } from 'lucide-react'
import { useClass } from '@/hooks/queries/useClasses'
import { useUserCourses } from '@/hooks/queries/useUsers'
import { User, Student } from '@silveredge/shared'
import { ClassInfoCard } from './ClassInfoCard'
import { CoursesList } from './CoursesList'

interface StudentClassTabProps {
  user: User
}

function isStudent(user: User): user is Student {
  return user.role === 'student'
}

export function StudentClassTab({ user }: StudentClassTabProps) {
  const studentUser = isStudent(user) ? user : null
  const classId = studentUser?.classId || ''

  const { data: classData, isLoading: classLoading, error: classError } = useClass(classId)
  const { data: courses, isLoading: coursesLoading } = useUserCourses(user.id)

  // Type guard to ensure we have a student
  if (!studentUser) {
    return null
  }

  // Edge case: Student without a class
  if (!studentUser.classId) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
        <h3 className="font-semibold text-amber-900 mb-2">Not Enrolled in a Class</h3>
        <p className="text-sm text-amber-700">
          This student hasn&apos;t been assigned to a class yet.
        </p>
      </div>
    )
  }

  // Edge case: Class deleted/archived or error loading
  if (classError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="font-semibold text-red-900 mb-2">Unable to Load Class</h3>
        <p className="text-sm text-red-700">
          Unable to load class information. The class may have been deleted or archived.
        </p>
      </div>
    )
  }

  // Loading state
  if (classLoading) {
    return <StudentClassTabSkeleton />
  }

  if (!classData) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Class Info Card */}
      <ClassInfoCard classData={classData} />

      {/* Courses Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Courses in {classData.name}
        </h3>
        <CoursesList
          courses={courses}
          isLoading={coursesLoading}
          emptyMessage="No courses assigned to this class yet."
        />
      </div>
    </div>
  )
}

function StudentClassTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Class card skeleton */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-slate-200 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-slate-200 rounded w-12 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses section skeleton */}
      <div>
        <div className="h-6 bg-slate-200 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200">
              <div className="w-12 h-12 bg-slate-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-24 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
