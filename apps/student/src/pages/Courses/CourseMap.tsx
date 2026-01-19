import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react'
import { useCourseMap } from '@/hooks/queries/useCourses'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { WindingPath } from '@/components/course/WindingPath'
import { cn } from '@/utils/cn'
import type { StudentSection } from '@/types/student'

export default function CourseMap() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: course, isLoading, error } = useCourseMap(courseId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton variant="rectangular" className="h-32 w-full rounded-2xl" />
        <Skeleton variant="rectangular" className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load course</p>
        <Link to="/" className="text-violet-600 hover:underline mt-2 inline-block">
          Back to Learn
        </Link>
      </div>
    )
  }

  // Language badge color
  const languageBadgeVariant = course.language === 'javascript' ? 'warning' : 'primary'
  const languageLabel = course.language === 'javascript' ? 'JavaScript' : 'Python'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learn</span>
        </Link>

        <div className="flex items-center gap-3">
          <ProgressBar
            value={course.progressPercent}
            max={100}
            size="md"
            color="violet"
            className="w-32"
          />
          <span className="text-sm font-semibold text-slate-600">{course.progressPercent}%</span>
        </div>
      </div>

      {/* Course Title */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-2xl font-bold text-slate-800">{course.title}</h1>
          <Badge variant={languageBadgeVariant}>{languageLabel}</Badge>
        </div>
        {course.description && (
          <p className="text-slate-500">{course.description}</p>
        )}
      </div>

      {/* Sections with Winding Paths */}
      <div className="space-y-8">
        {course.sections.map((section: StudentSection, sectionIndex: number) => (
          <div key={section.id} className="bg-white rounded-2xl border border-slate-200 p-6">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg',
                    section.status === 'completed'
                      ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white'
                      : section.status === 'in_progress'
                      ? 'bg-gradient-to-br from-coral-500 to-coral-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {sectionIndex + 1}
                </div>
                <div>
                  <h2 className="font-display font-semibold text-slate-800 text-lg">
                    {section.title}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {section.completedCount} of {section.totalCount} lessons completed
                  </p>
                </div>
              </div>

              {/* Section status indicator */}
              {section.status === 'completed' && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              )}
              {section.status === 'in_progress' && (
                <Badge variant="primary">In Progress</Badge>
              )}
              {section.status === 'locked' && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-5 h-5" />
                  <span className="text-sm font-medium">Locked</span>
                </div>
              )}
            </div>

            {/* Winding path for lessons */}
            <WindingPath
              lessons={section.lessons}
              courseId={course.id}
              className="mt-4"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
