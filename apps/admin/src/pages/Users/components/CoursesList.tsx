import { Link } from 'react-router-dom'
import { FileCode, ChevronRight, BookOpen } from 'lucide-react'
import { formatDate } from '@/utils/formatters'
import { StudentCourse } from '@/types/admin'

interface CoursesListProps {
  courses: StudentCourse[] | undefined
  isLoading?: boolean
  emptyMessage?: string
}

export function CoursesList({ courses, isLoading, emptyMessage }: CoursesListProps) {
  if (isLoading) {
    return <CoursesListSkeleton />
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">No courses available</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          {emptyMessage || 'No courses assigned to this class yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Link
          key={course.id}
          to={`/admin/courses/${course.id}`}
          className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              course.language === 'javascript' ? 'bg-amber-100' : 'bg-sky-100'
            }`}
          >
            <FileCode
              className={`w-5 h-5 ${
                course.language === 'javascript' ? 'text-amber-600' : 'text-sky-600'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-800">{course.title}</h4>
            <p className="text-sm text-slate-500">
              {course.lessonsCompleted} / {course.totalLessons} lessons completed
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    course.progress === 100
                      ? 'bg-emerald-500'
                      : course.progress >= 50
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                  }`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  course.progress === 100 ? 'text-emerald-600' : 'text-slate-700'
                }`}
              >
                {course.progress}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Last: {course.lastAccessed ? formatDate(course.lastAccessed) : 'Never'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
        </Link>
      ))}
    </div>
  )
}

function CoursesListSkeleton() {
  return (
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
  )
}
