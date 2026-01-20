import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams, Link, useBlocker } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, FileCode, X } from 'lucide-react'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useClass, useUpdateClass, useArchiveClass, useDeleteClass } from '@/hooks/queries/useClasses'
import { useToast } from '@/contexts/ToastContext'
import { formatDate } from '@/utils/formatters'

const COLOR_OPTIONS = [
  { value: '#6366f1', label: 'Indigo', bg: 'bg-accent-500' },
  { value: '#10b981', label: 'Emerald', bg: 'bg-emerald-500' },
  { value: '#f59e0b', label: 'Amber', bg: 'bg-amber-500' },
  { value: '#ec4899', label: 'Pink', bg: 'bg-pink-500' },
  { value: '#8b5cf6', label: 'Violet', bg: 'bg-violet-500' },
  { value: '#0ea5e9', label: 'Sky', bg: 'bg-sky-500' },
]

export default function ClassEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: cls, isLoading } = useClass(id || '')
  const updateClass = useUpdateClass()
  const archiveClass = useArchiveClass()
  const deleteClass = useDeleteClass()
  const { addToast } = useToast()
  const { confirm, dialogProps } = useConfirmDialog()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    teacherId: '',
    courseIds: [] as string[],
    status: 'active' as 'active' | 'draft',
  })
  const [originalData, setOriginalData] = useState<typeof formData | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Track unsaved changes
  const isDirty = useMemo(() => {
    if (!originalData) return false
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }, [formData, originalData])

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await fetch('/api/teachers')
      return res.json()
    },
  })

  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'available'],
    queryFn: async () => {
      const res = await fetch('/api/courses/available')
      return res.json()
    },
  })

  const teachers = teachersData?.data || []
  const courses = coursesData?.data || []

  useEffect(() => {
    if (cls) {
      const data = {
        name: cls.name,
        description: cls.description || '',
        color: cls.color || '#6366f1',
        teacherId: cls.teacherId || '',
        courseIds: cls.courses?.map((c) => c.id) || [],
        status: cls.status === 'archived' ? 'active' : cls.status,
      }
      setFormData(data)
      setOriginalData(data)
    }
  }, [cls])

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: { pathname: string }; nextLocation: { pathname: string } }) =>
        isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty]
    )
  )

  // Handle blocker confirmation
  useEffect(() => {
    if (blocker.state === 'blocked') {
      confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to leave this page?',
        confirmLabel: 'Leave',
        cancelLabel: 'Stay',
        variant: 'warning',
      }).then((confirmed) => {
        if (confirmed) {
          blocker.proceed()
        } else {
          blocker.reset()
        }
      })
    }
  }, [blocker, confirm])

  // Warn on browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const toggleCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((cid) => cid !== courseId)
        : [...prev.courseIds, courseId],
    }))
  }

  const removeCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      courseIds: prev.courseIds.filter((cid) => cid !== courseId),
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !id) return

    try {
      await updateClass.mutateAsync({
        id,
        ...formData,
        teacherId: formData.teacherId || null,
      })
      // Reset dirty state before navigating to prevent blocker from triggering
      setOriginalData(formData)
      addToast({ type: 'success', message: 'Class has been updated.' })
      navigate(`/admin/classes/${id}`)
    } catch {
      addToast({ type: 'error', message: 'Failed to update class. Please try again.' })
    }
  }

  const handleArchive = async () => {
    if (!id) return

    const confirmed = await confirm({
      title: 'Archive Class',
      message: 'Are you sure you want to archive this class? This will hide it from active views. Data is preserved.',
      confirmLabel: 'Archive',
      variant: 'warning',
    })

    if (confirmed) {
      try {
        await archiveClass.mutateAsync(id)
        addToast({ type: 'success', message: 'Class has been archived.' })
        navigate('/admin/classes')
      } catch {
        addToast({ type: 'error', message: 'Failed to archive class. Please try again.' })
      }
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (cls?.studentCount && cls.studentCount > 0) {
      await confirm({
        title: 'Cannot Delete Class',
        message: `This class has ${cls.studentCount} students enrolled. Please remove all students before deleting.`,
        confirmLabel: 'Understood',
        variant: 'warning',
      })
      return
    }

    const confirmed = await confirm({
      title: 'Delete Class',
      message: 'Are you sure you want to permanently delete this class? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteClass.mutateAsync(id)
        addToast({ type: 'success', message: 'Class has been deleted.' })
        navigate('/admin/classes')
      } catch {
        addToast({ type: 'error', message: 'Failed to delete class. Please try again.' })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="h-8 bg-slate-200 rounded w-48 mb-4 animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 bg-slate-200 rounded animate-pulse" />
            <div className="h-20 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Class not found</p>
        <Link to="/admin/classes" className="text-accent-600 hover:underline mt-2 inline-block">
          Back to Class List
        </Link>
      </div>
    )
  }

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Class Details */}
        <FormSection title="Class Details">
        <FormField label="Class Name" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
          />
        </FormField>

        <FormField label="Class Color">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData.color }}
            >
              <span className="text-white font-bold text-sm">
                {formData.name.replace('Class ', '').slice(0, 3)}
              </span>
            </div>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange('color', color.value)}
                  className={`w-8 h-8 rounded-lg ${color.bg} transition-all ${
                    formData.color === color.value
                      ? 'ring-2 ring-offset-2 ring-slate-400'
                      : 'hover:ring-2 hover:ring-offset-2 hover:ring-slate-200'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </FormField>
      </FormSection>

      {/* Schedule (Read-only) */}
      {cls.startDate && cls.endDate && (
        <FormSection
          title="Schedule"
          description="Class schedule dates."
        >
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">
                {formatDate(cls.startDate)} - {formatDate(cls.endDate)}
              </p>
            </div>
          </div>
        </FormSection>
      )}

      {/* Teacher Assignment */}
      <FormSection title="Teacher Assignment">
        <FormField label="Assigned Teacher">
          <Select
            value={formData.teacherId}
            onChange={(e) => handleChange('teacherId', e.target.value)}
          >
            <option value="">No teacher assigned</option>
            {teachers.map((teacher: { id: string; name: string }) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </Select>
        </FormField>
      </FormSection>

        {/* Course Assignment */}
        <FormSection title="Course Assignment">
          <FormField label="Assigned Courses">
            {/* Selected courses as badges */}
            {formData.courseIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.courseIds.map((courseId) => {
                  const course = courses.find((c: { id: string }) => c.id === courseId)
                  if (!course) return null
                  return (
                    <span
                      key={courseId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-50 text-accent-700 rounded-lg text-sm"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      {course.name}
                      <button
                        type="button"
                        onClick={() => removeCourse(courseId)}
                        className="hover:bg-accent-100 rounded p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
            {/* Course checkbox list */}
            <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
              {courses.length === 0 ? (
                <p className="p-4 text-sm text-slate-500 text-center">No courses available</p>
              ) : (
                courses.map((course: { id: string; name: string; category?: string }) => (
                  <label
                    key={course.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                  >
                    <Checkbox
                      checked={formData.courseIds.includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          course.category === 'JavaScript'
                            ? 'bg-amber-100'
                            : course.category === 'Python'
                              ? 'bg-sky-100'
                              : 'bg-slate-100'
                        }`}
                      >
                        <FileCode
                          className={`w-4 h-4 ${
                            course.category === 'JavaScript'
                              ? 'text-amber-600'
                              : course.category === 'Python'
                                ? 'text-sky-600'
                                : 'text-slate-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{course.name}</p>
                        {course.category && (
                          <p className="text-xs text-slate-500">{course.category}</p>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </FormField>
        </FormSection>

      {/* Status */}
      <FormSection title="Class Status">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === 'active'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-4 h-4 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-slate-700">Active</span>
          </label>
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
        </div>
      </FormSection>

      {/* Class Statistics (Read-only) */}
      <FormSection title="Class Statistics">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{cls.studentCount}</p>
            <p className="text-sm text-slate-500">Students</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{cls.courseCount}</p>
            <p className="text-sm text-slate-500">Courses</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className={`text-2xl font-bold ${cls.avgProgress >= 80 ? 'text-emerald-600' : 'text-slate-800'}`}>
              {cls.avgProgress}%
            </p>
            <p className="text-sm text-slate-500">Avg Progress</p>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Created</span>
            <span className="text-slate-700">{formatDate(cls.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Last Activity</span>
            <span className="text-slate-700">{cls.lastActivity}</span>
          </div>
        </div>
      </FormSection>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <h3 className="font-semibold text-red-700 mb-1">Danger Zone</h3>
        <p className="text-sm text-slate-500 mb-4">Irreversible actions. Be careful.</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Archive Class</p>
              <p className="text-sm text-slate-500">Hide this class from active views. Data is preserved.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleArchive}
              isLoading={archiveClass.isPending}
              className="bg-amber-100 text-amber-700 hover:bg-amber-200"
            >
              Archive Class
            </Button>
          </div>

          <div className="border-t border-slate-100 pt-4" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Delete Class</p>
              <p className="text-sm text-slate-500">Permanently delete this class and all associated data.</p>
            </div>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteClass.isPending}
              disabled={cls.studentCount > 0}
              title={cls.studentCount > 0 ? `Cannot delete: ${cls.studentCount} students enrolled` : undefined}
            >
              Delete Class
            </Button>
          </div>
        </div>
      </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to={`/admin/classes/${id}`}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
          >
            Cancel
          </Link>
          <Button type="submit" isLoading={updateClass.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </>
  )
}
