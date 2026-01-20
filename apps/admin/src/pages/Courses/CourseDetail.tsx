import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  FileCode,
  ChevronRight,
  Upload,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { DetailActionBar } from '@/components/ui/DetailActionBar'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCourse, usePublishCourse, useDeleteCourse } from '@/hooks/queries/useCourses'
import { formatDate } from '@/utils/formatters'
import { SectionList } from './components'

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: course, isLoading } = useCourse(id || '')
  const publishCourse = usePublishCourse()
  const deleteCourse = useDeleteCourse()
  const { confirm, dialogProps } = useConfirmDialog()

  const handlePublish = async () => {
    if (!course) return

    const confirmed = await confirm({
      title: 'Publish Course',
      message: `Are you sure you want to publish "${course.title}"? It will be visible to students.`,
      confirmLabel: 'Publish',
      variant: 'info',
    })

    if (confirmed) {
      publishCourse.mutate(id!)
    }
  }

  const handleDelete = async () => {
    if (!course) return

    const confirmed = await confirm({
      title: 'Delete Course',
      message: `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteCourse.mutateAsync(course.id)
        navigate('/admin/courses')
      } catch {
        // Error handled by mutation
      }
    }
  }

  if (isLoading) {
    return <CourseDetailSkeleton />
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Course not found</p>
        <Link to="/admin/courses" className="text-accent-600 hover:underline mt-2 inline-block">
          Back to Course List
        </Link>
      </div>
    )
  }

  const isJavaScript = course.language === 'javascript'

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Course Structure */}
        <Card>
          <CardHeader title="Course Structure" className="mb-4" />
          <SectionList courseId={id!} sections={course.sections || []} />
        </Card>

        {/* Assigned Classes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardHeader title="Assigned Classes" />
            <Button size="sm" variant="secondary">
              Assign to Class
            </Button>
          </div>

          {course.assignedClasses && course.assignedClasses.length > 0 ? (
            <div className="space-y-2">
              {course.assignedClasses.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/admin/classes/${cls.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-sm text-accent-600">{cls.name}</span>
                    </div>
                    <span className="font-medium text-slate-700">Class {cls.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-6">
              This course is not assigned to any classes yet.
            </p>
          )}
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Course Info Card */}
        <Card className="text-center">
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
              isJavaScript ? 'bg-amber-100' : 'bg-sky-100'
            }`}
          >
            <FileCode
              className={`w-8 h-8 ${isJavaScript ? 'text-amber-600' : 'text-sky-600'}`}
            />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">{course.title}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              isJavaScript ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
            }`}
          >
            {isJavaScript ? 'JavaScript' : 'Python'}
          </span>
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                course.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  course.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {course.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader title="Statistics" />
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-slate-800">{course.sectionCount}</p>
              <p className="text-xs text-slate-500">Sections</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-slate-800">{course.lessonCount}</p>
              <p className="text-xs text-slate-500">Lessons</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg col-span-2">
              <p className="text-xl font-bold text-slate-800">{course.classCount}</p>
              <p className="text-xs text-slate-500">Classes Assigned</p>
            </div>
          </div>
        </Card>

        {/* Created By */}
        <Card>
          <CardHeader title="Created By" />
          <div className="flex items-center gap-3">
            <Avatar name={course.createdByName} />
            <div>
              <p className="font-medium text-slate-800 text-sm">{course.createdByName}</p>
              <p className="text-xs text-slate-500">Teacher</p>
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader title="Details" />
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Created</span>
              <span className="text-slate-700">{formatDate(course.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Last Updated</span>
              <span className="text-slate-700">{formatDate(course.updatedAt)}</span>
            </div>
          </div>
        </Card>
      </div>
      </div>

      {/* Action Bar */}
      <DetailActionBar
        backTo="/admin/courses"
        backLabel="Courses"
        editTo={`/admin/courses/${id}/edit`}
        onDelete={handleDelete}
        isDeleting={deleteCourse.isPending}
      >
        {course.status === 'draft' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePublish}
            disabled={publishCourse.isPending}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <Upload className="w-4 h-4" />
            Publish
          </Button>
        )}
      </DetailActionBar>
    </>
  )
}

function CourseDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="h-8 bg-slate-200 rounded w-48 mb-4 animate-pulse" />
          <div className="space-y-4">
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded w-32 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-20 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}
