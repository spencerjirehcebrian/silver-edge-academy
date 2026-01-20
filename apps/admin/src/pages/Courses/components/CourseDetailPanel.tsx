import { useState, useEffect } from 'react'
import { Pencil, Trash2, FileCode, Users, BookOpen, Layers } from 'lucide-react'
import { SlideOverPanel } from '@/components/ui/SlideOverPanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useUpdateCourse, useDeleteCourse, usePublishCourse } from '@/hooks/queries/useCourses'
import { formatDate } from '@/utils/formatters'
import type { Course } from '@/services/api/courses'

interface CourseDetailPanelProps {
  course: Course | null
  isOpen: boolean
  onClose: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export function CourseDetailPanel({
  course,
  isOpen,
  onClose,
  canEdit = true,
  canDelete = true,
}: CourseDetailPanelProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript' as 'javascript' | 'python',
    status: 'draft' as 'draft' | 'published',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateCourse = useUpdateCourse()
  const deleteCourse = useDeleteCourse()
  const publishCourse = usePublishCourse()
  const { confirm, dialogProps } = useConfirmDialog()

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || '',
        language: course.language,
        status: course.status,
      })
      setMode('view')
      setErrors({})
    }
  }, [course])

  const handleClose = () => {
    setMode('view')
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Course title is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!course || !validateForm()) return

    try {
      await updateCourse.mutateAsync({
        id: course.id,
        title: formData.title,
        description: formData.description || undefined,
        language: formData.language,
        status: formData.status,
      })
      setMode('view')
    } catch {
      setErrors({ submit: 'Failed to update course' })
    }
  }

  const handleDelete = async () => {
    if (!course) return

    if (course.classCount > 0) {
      await confirm({
        title: 'Cannot Delete Course',
        message: `This course is assigned to ${course.classCount} class${course.classCount > 1 ? 'es' : ''}. Remove the course from all classes before deleting.`,
        confirmLabel: 'Understood',
        variant: 'warning',
      })
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
        await deleteCourse.mutateAsync(course.id)
        handleClose()
      } catch {
        // Handle error
      }
    }
  }

  const handlePublish = async () => {
    if (!course) return

    const confirmed = await confirm({
      title: 'Publish Course',
      message: `Are you sure you want to publish "${course.title}"? It will become visible to assigned classes.`,
      confirmLabel: 'Publish',
      variant: 'info',
    })

    if (confirmed) {
      try {
        await publishCourse.mutateAsync(course.id)
      } catch {
        // Handle error
      }
    }
  }

  if (!course) return null

  const languageColors =
    course.language === 'javascript'
      ? { bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700' }
      : { bg: 'bg-sky-100', text: 'text-sky-600', badge: 'bg-sky-50 text-sky-700' }

  return (
    <>
      <SlideOverPanel
        isOpen={isOpen}
        onClose={handleClose}
        breadcrumb={['Courses', course.title]}
        headerActions={
          mode === 'view' ? (
            <>
              {course.status === 'draft' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  isLoading={publishCourse.isPending}
                >
                  Publish
                </Button>
              )}
              {canEdit && (
                <Button size="sm" onClick={() => setMode('edit')}>
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setMode('view')}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} isLoading={updateCourse.isPending}>
                Save Changes
              </Button>
            </>
          )
        }
        footer={
          mode === 'view' && canDelete ? (
            <div className="flex items-center justify-between">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={deleteCourse.isPending}
                disabled={course.classCount > 0}
              >
                <Trash2 className="w-4 h-4" />
                Delete Course
              </Button>
              {course.classCount > 0 && (
                <span className="text-sm text-slate-500">
                  Cannot delete: assigned to {course.classCount} class
                  {course.classCount > 1 ? 'es' : ''}
                </span>
              )}
            </div>
          ) : undefined
        }
      >
        {mode === 'view' ? (
          <div className="space-y-8">
            {/* Course Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-6">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${languageColors.bg}`}
                >
                  <FileCode className={`w-8 h-8 ${languageColors.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-800">{course.title}</h1>
                    <StatusBadge status={course.status === 'published' ? 'active' : 'inactive'} />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${languageColors.badge}`}>
                    {course.language === 'javascript' ? 'JavaScript' : 'Python'}
                  </span>
                  {course.description && (
                    <p className="text-slate-500 mt-2">{course.description}</p>
                  )}
                  <p className="text-sm text-slate-400 mt-2">
                    Last updated {formatDate(course.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Creator Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Created By</h3>
                <div className="flex items-center gap-3">
                  <Avatar name={course.createdByName} size="lg" />
                  <div>
                    <p className="font-medium text-slate-800">{course.createdByName}</p>
                    <p className="text-sm text-slate-500">Created on {formatDate(course.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Course Content</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Layers className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{course.sectionCount}</p>
                      <p className="text-xs text-slate-500">Sections</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{course.lessonCount}</p>
                      <p className="text-xs text-slate-500">Lessons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Users className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{course.classCount}</p>
                      <p className="text-xs text-slate-500">Classes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Classes Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
                <h3 className="font-semibold text-slate-800 mb-4">Assigned Classes</h3>
                {course.assignedClasses && course.assignedClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {course.assignedClasses.map((cls) => (
                      <span
                        key={cls.id}
                        className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        {cls.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Not assigned to any classes yet</p>
                )}
              </div>

              {/* Sections Preview Card */}
              {course.sections && course.sections.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
                  <h3 className="font-semibold text-slate-800 mb-4">Course Sections</h3>
                  <div className="space-y-2">
                    {course.sections.map((section, index) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <p className="font-medium text-slate-800">{section.title}</p>
                        </div>
                        <span className="text-sm text-slate-500">
                          {section.lessonCount} lesson{section.lessonCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <FormSection title="Course Information">
                <FormField label="Course Title" required error={errors.title}>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={!!errors.title}
                  />
                </FormField>

                <FormField label="Description">
                  <Input
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the course"
                  />
                </FormField>
              </FormSection>

              <FormSection title="Language">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      value="javascript"
                      checked={formData.language === 'javascript'}
                      onChange={() => handleInputChange('language', 'javascript')}
                      className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                    />
                    <span className="text-sm text-slate-700">JavaScript</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      value="python"
                      checked={formData.language === 'python'}
                      onChange={() => handleInputChange('language', 'python')}
                      className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                    />
                    <span className="text-sm text-slate-700">Python</span>
                  </label>
                </div>
              </FormSection>

              <FormSection title="Status" description="Draft courses are not visible to students.">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={() => handleInputChange('status', 'draft')}
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
                      onChange={() => handleInputChange('status', 'published')}
                      className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                    />
                    <span className="text-sm text-slate-700">Published</span>
                  </label>
                </div>
              </FormSection>
            </div>
          </div>
        )}
      </SlideOverPanel>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </>
  )
}
