import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FileCode, Check } from 'lucide-react'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCourse, useUpdateCourse, useDeleteCourse } from '@/hooks/queries/useCourses'
import { formatDate } from '@/utils/formatters'

export default function CourseEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: course, isLoading } = useCourse(id || '')
  const updateCourse = useUpdateCourse()
  const deleteCourse = useDeleteCourse()
  const { confirm, dialogProps } = useConfirmDialog()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript' as 'javascript' | 'python',
    status: 'draft' as 'draft' | 'published',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || '',
        language: course.language,
        status: course.status,
      })
    }
  }, [course])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !id) return

    try {
      await updateCourse.mutateAsync({ id, ...formData })
      navigate(`/admin/courses/${id}`)
    } catch {
      setErrors({ submit: 'Failed to update course. Please try again.' })
    }
  }

  const handleDelete = async () => {
    if (!id || !course) return
    if (course.classCount > 0) {
      alert('Cannot delete course that is assigned to classes.')
      return
    }
    const confirmed = await confirm({
      title: 'Delete Course',
      message: `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (confirmed) {
      try {
        await deleteCourse.mutateAsync(id)
        navigate('/admin/courses')
      } catch {
        setErrors({ submit: 'Failed to delete course. Please try again.' })
      }
    }
  }

  if (isLoading) {
    return <CourseEditSkeleton />
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

  const canDelete = course.classCount === 0

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Course Details */}
      <FormSection title="Course Details">
        <FormField label="Course Title" required error={errors.title}>
          <Input
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., JavaScript Basics"
            error={!!errors.title}
          />
        </FormField>

        <FormField label="Description" hint="Optional. Visible to teachers and students.">
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what students will learn in this course..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
          />
        </FormField>
      </FormSection>

      {/* Programming Language */}
      <FormSection
        title="Programming Language"
        description="All lessons and exercises in this course will use this language."
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="language"
              value="javascript"
              checked={formData.language === 'javascript'}
              onChange={(e) => handleChange('language', e.target.value)}
              className="hidden"
            />
            <div
              className={`border-2 rounded-xl p-4 transition-all ${
                formData.language === 'javascript'
                  ? 'border-accent-600 bg-accent-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-amber-600" />
                </div>
                {formData.language === 'javascript' && (
                  <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-slate-800">JavaScript</h4>
              <p className="text-sm text-slate-500">Web development, games, interactive apps</p>
            </div>
          </label>

          <label className="cursor-pointer">
            <input
              type="radio"
              name="language"
              value="python"
              checked={formData.language === 'python'}
              onChange={(e) => handleChange('language', e.target.value)}
              className="hidden"
            />
            <div
              className={`border-2 rounded-xl p-4 transition-all ${
                formData.language === 'python'
                  ? 'border-accent-600 bg-accent-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-sky-600" />
                </div>
                {formData.language === 'python' && (
                  <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-slate-800">Python</h4>
              <p className="text-sm text-slate-500">Data science, automation, general programming</p>
            </div>
          </label>
        </div>
      </FormSection>

      {/* Publication Status */}
      <FormSection
        title="Publication Status"
        description="Draft courses are only visible to admins and teachers."
      >
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={formData.status === 'draft'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-4 h-4 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-slate-700">Draft</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="published"
              checked={formData.status === 'published'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-4 h-4 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-slate-700">Published</span>
          </label>
        </div>
      </FormSection>

      {/* Course Statistics */}
      <FormSection title="Course Statistics">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{course.sectionCount}</p>
            <p className="text-sm text-slate-500">Sections</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{course.lessonCount}</p>
            <p className="text-sm text-slate-500">Lessons</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{course.classCount}</p>
            <p className="text-sm text-slate-500">Classes</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Created by</span>
            <div className="flex items-center gap-2">
              <Avatar name={course.createdByName} size="sm" />
              <span className="text-slate-700">{course.createdByName}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Created</span>
            <span className="text-slate-700">{formatDate(course.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Last updated</span>
            <span className="text-slate-700">{formatDate(course.updatedAt)}</span>
          </div>
        </div>
      </FormSection>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h3 className="font-semibold text-red-700 mb-1">Danger Zone</h3>
        <p className="text-sm text-slate-500 mb-4">Irreversible actions. Be careful.</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-800">Delete this course</p>
            <p className="text-sm text-slate-500">
              Remove this course and all its content permanently.
            </p>
          </div>
          <div className="relative group">
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={!canDelete || deleteCourse.isPending}
              isLoading={deleteCourse.isPending}
            >
              Delete Course
            </Button>
            {!canDelete && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Cannot delete: assigned to {course.classCount} classes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          to={`/admin/courses/${id}`}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
        >
          Cancel
        </Link>
        <Button type="submit" isLoading={updateCourse.isPending}>
          Save Changes
        </Button>
      </div>
      </form>
    </>
  )
}

function CourseEditSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse" />
        <div className="space-y-4">
          <div className="h-10 bg-slate-200 rounded animate-pulse" />
          <div className="h-24 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="h-6 bg-slate-200 rounded w-40 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
