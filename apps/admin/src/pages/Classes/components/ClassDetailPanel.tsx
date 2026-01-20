import { useState, useEffect } from 'react'
import { Pencil, Trash2, Archive, Users, BookOpen } from 'lucide-react'
import { SlideOverPanel } from '@/components/ui/SlideOverPanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useUpdateClass, useDeleteClass, useArchiveClass } from '@/hooks/queries/useClasses'
import type { Class } from '@/services/api/classes'

const CLASS_COLORS = [
  { id: '#6366f1', name: 'Indigo', bg: 'bg-accent-100', text: 'text-accent-600' },
  { id: '#10b981', name: 'Emerald', bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { id: '#f59e0b', name: 'Amber', bg: 'bg-amber-100', text: 'text-amber-600' },
  { id: '#ec4899', name: 'Pink', bg: 'bg-pink-100', text: 'text-pink-600' },
  { id: '#8b5cf6', name: 'Violet', bg: 'bg-violet-100', text: 'text-violet-600' },
  { id: '#0ea5e9', name: 'Sky', bg: 'bg-sky-100', text: 'text-sky-600' },
]

interface ClassDetailPanelProps {
  classItem: Class | null
  isOpen: boolean
  onClose: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ClassDetailPanel({
  classItem,
  isOpen,
  onClose,
  canEdit = true,
  canDelete = true,
}: ClassDetailPanelProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    status: 'active' as 'active' | 'archived' | 'draft',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateClass = useUpdateClass()
  const deleteClass = useDeleteClass()
  const archiveClass = useArchiveClass()
  const { confirm, dialogProps } = useConfirmDialog()

  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name,
        description: classItem.description || '',
        color: classItem.color || '#6366f1',
        status: classItem.status,
      })
      setMode('view')
      setErrors({})
    }
  }, [classItem])

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
    if (!formData.name.trim()) newErrors.name = 'Class name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!classItem || !validateForm()) return

    try {
      await updateClass.mutateAsync({
        id: classItem.id,
        name: formData.name,
        description: formData.description,
        color: formData.color,
        status: formData.status,
      })
      setMode('view')
    } catch {
      setErrors({ submit: 'Failed to update class' })
    }
  }

  const handleDelete = async () => {
    if (!classItem) return

    const confirmed = await confirm({
      title: 'Delete Class',
      message: `Are you sure you want to delete "${classItem.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteClass.mutateAsync(classItem.id)
        handleClose()
      } catch {
        // Handle error
      }
    }
  }

  const handleArchive = async () => {
    if (!classItem) return

    const confirmed = await confirm({
      title: 'Archive Class',
      message: `Are you sure you want to archive "${classItem.name}"? Students will no longer have access to this class.`,
      confirmLabel: 'Archive',
      variant: 'warning',
    })

    if (confirmed) {
      try {
        await archiveClass.mutateAsync(classItem.id)
      } catch {
        // Handle error
      }
    }
  }

  if (!classItem) return null

  const colorInfo = CLASS_COLORS.find((c) => c.id === classItem.color) || CLASS_COLORS[0]

  return (
    <>
      <SlideOverPanel
        isOpen={isOpen}
        onClose={handleClose}
        title={mode === 'view' ? classItem.name : 'Edit Class'}
        footer={
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {canDelete && mode === 'view' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={deleteClass.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
              {mode === 'view' && classItem.status !== 'archived' && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={handleArchive}
                  isLoading={archiveClass.isPending}
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {mode === 'view' ? (
                canEdit && (
                  <Button size="sm" onClick={() => setMode('edit')}>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                )
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setMode('view')}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} isLoading={updateClass.isPending}>
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        {mode === 'view' ? (
          <div className="space-y-6">
            {/* Class Header */}
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center ${colorInfo.bg}`}
              >
                <span className={`font-bold text-xl ${colorInfo.text}`}>
                  {classItem.name.replace('Class ', '')}
                </span>
              </div>
              <div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    classItem.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : classItem.status === 'draft'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                </span>
                {classItem.description && (
                  <p className="text-sm text-slate-500 mt-1">{classItem.description}</p>
                )}
              </div>
            </div>

            {/* Teacher */}
            <FormSection title="Teacher">
              {classItem.teacherName ? (
                <div className="flex items-center gap-3">
                  <Avatar name={classItem.teacherName} />
                  <div>
                    <p className="font-medium text-slate-800">{classItem.teacherName}</p>
                    {classItem.teacherEmail && (
                      <p className="text-sm text-slate-500">{classItem.teacherEmail}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No teacher assigned</p>
              )}
            </FormSection>

            {/* Stats */}
            <FormSection title="Statistics">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{classItem.studentCount}</p>
                    <p className="text-xs text-slate-500">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{classItem.courseCount}</p>
                    <p className="text-xs text-slate-500">Courses</p>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Progress */}
            <FormSection title="Average Progress">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      classItem.avgProgress >= 80
                        ? 'bg-emerald-500'
                        : classItem.avgProgress >= 50
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                    }`}
                    style={{ width: `${classItem.avgProgress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {classItem.avgProgress}%
                </span>
              </div>
            </FormSection>

            {/* Courses */}
            {classItem.courses && classItem.courses.length > 0 && (
              <FormSection title="Assigned Courses">
                <div className="space-y-2">
                  {classItem.courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{course.name}</p>
                        <p className="text-xs text-slate-500">{course.category}</p>
                      </div>
                      <span className="text-sm text-slate-600">{course.progress}%</span>
                    </div>
                  ))}
                </div>
              </FormSection>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <FormField label="Class Name" required error={errors.name}>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
              />
            </FormField>

            <FormField label="Description">
              <Input
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </FormField>

            <FormSection title="Color">
              <div className="flex gap-2">
                {CLASS_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleInputChange('color', color.id)}
                    className={`w-10 h-10 rounded-lg transition-transform hover:scale-110 ${
                      formData.color === color.id ? 'ring-2 ring-offset-2 ring-accent-500' : ''
                    }`}
                    style={{ backgroundColor: color.id }}
                  />
                ))}
              </div>
            </FormSection>

            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(e) =>
                  handleInputChange('status', e.target.value as 'active' | 'archived' | 'draft')
                }
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Select>
            </FormField>
          </div>
        )}
      </SlideOverPanel>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </>
  )
}
