import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { SlideOverPanel } from '@/components/ui/SlideOverPanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge, RoleBadge } from '@/components/ui/Badge'
import { FormSection } from '@/components/forms/FormSection'
import { FormField, FormRow } from '@/components/forms/FormField'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDate, formatNumber } from '@/utils/formatters'
import {
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/queries/useUsers'
import type { User, Student, Teacher, Parent } from '@/services/api/users'

interface UserDetailPanelProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export function UserDetailPanel({
  user,
  isOpen,
  onClose,
  canEdit = true,
  canDelete = true,
}: UserDetailPanelProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const { confirm, dialogProps } = useConfirmDialog()

  useEffect(() => {
    if (user) {
      const nameParts = user.displayName.split(' ')
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        status: user.status,
      })
      setErrors({})
      setHasChanges(false)
    }
  }, [user])

  const handleClose = () => {
    setErrors({})
    setHasChanges(false)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    // Email is optional for students
    const emailRequired = user?.role !== 'student'
    if (emailRequired && !formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!user || !validateForm()) return

    try {
      await updateUser.mutateAsync({
        id: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        status: formData.status,
      })
      setHasChanges(false)
    } catch {
      setErrors({ submit: 'Failed to update user' })
    }
  }

  const handleCancel = () => {
    if (user) {
      const nameParts = user.displayName.split(' ')
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        status: user.status,
      })
      setErrors({})
      setHasChanges(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return

    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.displayName}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteUser.mutateAsync(user.id)
        handleClose()
      } catch {
        // Handle error
      }
    }
  }

  const handleToggleStatus = () => {
    const newStatus = formData.status === 'active' ? 'inactive' : 'active'
    setFormData((prev) => ({ ...prev, status: newStatus }))
    setHasChanges(true)
  }

  if (!user) return null

  const isStudent = user.role === 'student'
  const isTeacher = user.role === 'teacher'
  const isParent = user.role === 'parent'

  return (
    <>
      <SlideOverPanel
        isOpen={isOpen}
        onClose={handleClose}
        title={user.displayName}
        subtitle={user.email || (user.role === 'student' ? (user as Student).username : '')}
        footer={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={deleteUser.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} isLoading={updateUser.isPending}>
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* User Header */}
          <div className="flex items-center gap-4">
            <Avatar name={user.displayName} size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <RoleBadge role={user.role} />
                <StatusBadge status={formData.status} />
              </div>
              <p className="text-sm text-slate-500">
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Editable Fields */}
          <FormSection title="Basic Information">
            <FormRow>
              <FormField label="First Name" required error={errors.firstName}>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  disabled={!canEdit}
                />
              </FormField>
              <FormField label="Last Name" required error={errors.lastName}>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  disabled={!canEdit}
                />
              </FormField>
            </FormRow>

            <FormField label="Email Address" required={!isStudent} error={errors.email} hint={isStudent ? 'Optional for students' : undefined}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                disabled={!canEdit}
              />
            </FormField>
          </FormSection>

          {/* Student-specific info (read-only) */}
          {isStudent && (
            <FormSection title="Student Details">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Username</p>
                  <p className="font-mono text-sm">{(user as Student).username}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Student ID</p>
                  <p className="font-mono text-sm">{(user as Student).studentNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Class</p>
                  <p className="text-sm">{(user as Student).className}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Level</p>
                  <p className="text-sm font-medium">Lv. {(user as Student).currentLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total XP</p>
                  <p className="text-sm">{formatNumber((user as Student).totalXp)} XP</p>
                </div>
              </div>
            </FormSection>
          )}

          {/* Teacher-specific info (read-only) */}
          {isTeacher && (
            <FormSection title="Teacher Details">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Classes</p>
                  <p className="text-sm font-medium">{(user as Teacher).classCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Students</p>
                  <p className="text-sm">{(user as Teacher).studentCount}</p>
                </div>
              </div>
            </FormSection>
          )}

          {/* Parent-specific info (read-only) */}
          {isParent && (
            <FormSection title="Parent Details">
              <div>
                <p className="text-xs text-slate-500 mb-1">Children</p>
                {(user as Parent).childNames.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {(user as Parent).childNames.map((name: string, i: number) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">No children linked</p>
                )}
              </div>
            </FormSection>
          )}

          {/* Account Status - inline toggle */}
          <FormSection title="Account Status" description="Inactive accounts cannot log in.">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Account is currently <strong>{formData.status}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formData.status === 'active'
                    ? 'User can log in and access the platform'
                    : 'User cannot log in'}
                </p>
              </div>
              {canEdit && (
                <Button
                  variant={formData.status === 'active' ? 'warning' : 'primary'}
                  size="sm"
                  onClick={handleToggleStatus}
                >
                  {formData.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              )}
            </div>
          </FormSection>
        </div>
      </SlideOverPanel>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </>
  )
}
