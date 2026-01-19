import { Link } from 'react-router-dom'
import { BookOpen, Play } from 'lucide-react'
import { useCourses } from '@/hooks/queries/useCourses'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SkeletonCourseCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { CourseListItem } from '@/services/api/courses'

export default function CourseList() {
  const { data: courses, isLoading, error } = useCourses()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">My Courses</h1>
        <div className="grid gap-4">
          <SkeletonCourseCard />
          <SkeletonCourseCard />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load courses</p>
      </div>
    )
  }

  if (!courses || courses.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="w-8 h-8" />}
        title="No courses yet"
        description="Your teacher will assign courses to your class soon."
      />
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800">My Courses</h1>

      <div className="grid gap-4">
        {courses.map((course: CourseListItem) => (
          <Link key={course.id} to={`/courses/${course.id}`}>
            <Card interactive padding="lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-800">{course.title}</h2>
                    <Badge variant={course.language === 'javascript' ? 'warning' : 'primary'}>
                      {course.language === 'javascript' ? 'JavaScript' : 'Python'}
                    </Badge>
                  </div>
                  {course.description && (
                    <p className="text-sm text-slate-500">{course.description}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-primary-600 ml-0.5" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ProgressBar
                  value={course.progressPercent}
                  max={100}
                  size="md"
                  color="primary"
                  className="flex-1"
                />
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-800">{course.progressPercent}%</span>
                  <p className="text-sm text-slate-500">
                    {course.completedLessons}/{course.totalLessons} lessons
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
