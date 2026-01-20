import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormSection } from '@/components/forms/FormSection'
import { FormField, FormRow } from '@/components/forms/FormField'
import { useCreateUser } from '@/hooks/queries/useUsers'
import { FormSubmitError } from '@/hooks/useFormError'
import { validate, validators, userValidationRules, studentValidationRules } from '@/lib/validation'
import { getRolePath, useUserNavigation, type UserRole } from '@/lib/navigation'
import { RoleSelector, getRoleLabel } from './components/RoleSelector'
import { TeacherFields, ParentFields, StudentFields, StatusSelector } from './components/RoleFields'

interface FormData {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
  confirmPassword: string
  status: 'active' | 'inactive'
  classes: string[]
  classId: string
  parentIds: string[]
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  status: 'active',
  classes: [],
  classId: '',
  parentIds: [],
}

export default function UserCreate({ type: initialType }: { type?: UserRole }) {
  const userNav = useUserNavigation()
  const [searchParams] = useSearchParams()
  const typeFromUrl = (searchParams.get('type') as UserRole) || 'student'
  const lockedType = initialType || typeFromUrl

  const [role, setRole] = useState<UserRole>(lockedType)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createUser = useCreateUser()

  const handleChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const baseRules = role === 'student' ? studentValidationRules : userValidationRules
    const validationErrors = validate(formData, {
      ...baseRules,
      confirmPassword: [validators.matches(formData.password, 'Passwords do not match')],
      ...(role === 'student' && {
        parentIds: [validators.minItems(1, 'At least one parent is required')],
      }),
    })
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validateForm()) return

    try {
      await createUser.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        password: formData.password,
        role,
        status: formData.status,
        ...(role === 'teacher' && { classes: formData.classes }),
        ...(role === 'student' && { username: formData.username, classId: formData.classId, parentIds: formData.parentIds }),
      })
      userNav.toList(role)
    } catch {
      setSubmitError('Failed to create user. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="User Type"
          description={lockedType ? `Creating ${getRoleLabel(role).toLowerCase()} account.` : 'Select the type of user account to create.'}
        >
          <RoleSelector value={role} onChange={setRole} locked={!!initialType} />
        </FormSection>

        <FormSection title="Basic Information">
          <FormRow>
            <FormField label="First Name" htmlFor="firstName" required error={errors.firstName}>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={!!errors.firstName}
              />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName" required error={errors.lastName}>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={!!errors.lastName}
              />
            </FormField>
          </FormRow>

          {role === 'student' && (
            <FormField label="Username" htmlFor="username" required error={errors.username} hint="Used for login. Letters, numbers, and underscores only.">
              <Input
                id="username"
                placeholder="student_username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                error={!!errors.username}
              />
            </FormField>
          )}

          <FormField label="Email Address" htmlFor="email" required={role !== 'student'} error={errors.email} hint={role === 'student' ? 'Optional. Students can login with username or email.' : undefined}>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
            />
          </FormField>

          <FormRow>
            <FormField label="Password" htmlFor="password" required error={errors.password}>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={!!errors.password}
              />
            </FormField>
            <FormField label="Confirm Password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={!!errors.confirmPassword}
              />
            </FormField>
          </FormRow>
        </FormSection>

        {role === 'teacher' && (
          <TeacherFields classes={formData.classes} onChange={(c) => handleChange('classes', c)} />
        )}
        {role === 'parent' && <ParentFields />}
        {role === 'student' && (
          <StudentFields
            classId={formData.classId}
            parentIds={formData.parentIds}
            onClassChange={(c) => handleChange('classId', c)}
            onParentChange={(p) => handleChange('parentIds', p)}
            error={errors.parentIds}
          />
        )}

        <StatusSelector value={formData.status} onChange={(s) => handleChange('status', s)} />

        <FormSubmitError error={submitError} />

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to={getRolePath(role)}>
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  )
}
