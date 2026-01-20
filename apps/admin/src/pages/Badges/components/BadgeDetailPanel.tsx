import { useState, useEffect } from 'react'
import {
  Pencil,
  Trash2,
  Users,
  Award,
  Star,
  Flame,
  Zap,
  Trophy,
  Gem,
  Heart,
  Rocket,
  Code,
  Bug,
  Lightbulb,
  Target,
  Footprints,
  Crown,
  Medal,
  Sparkles,
} from 'lucide-react'
import { SlideOverPanel } from '@/components/ui/SlideOverPanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/Badge'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useUpdateBadge, useDeleteBadge } from '@/hooks/queries/useBadges'
import { formatDate } from '@/utils/formatters'
import {
  badgeColorGradients,
  type Badge,
  type BadgeIcon,
  type BadgeColor,
  type TriggerType,
} from '@/services/api/badges'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<BadgeIcon, LucideIcon> = {
  award: Award,
  star: Star,
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
  gem: Gem,
  heart: Heart,
  rocket: Rocket,
  code: Code,
  bug: Bug,
  lightbulb: Lightbulb,
  target: Target,
  footprints: Footprints,
  crown: Crown,
  medal: Medal,
  sparkles: Sparkles,
}

const iconList: BadgeIcon[] = [
  'award', 'star', 'flame', 'zap', 'trophy', 'gem', 'heart', 'rocket',
  'code', 'bug', 'lightbulb', 'target', 'footprints', 'crown', 'medal', 'sparkles',
]

const colorList: BadgeColor[] = [
  'indigo', 'amber', 'emerald', 'blue', 'rose', 'violet', 'cyan', 'pink',
]

const triggerLabels: Record<TriggerType, string> = {
  first_login: 'First Login',
  first_lesson: 'First Lesson Completed',
  first_exercise: 'First Exercise Passed',
  first_quiz: 'First Quiz Completed',
  first_sandbox: 'First Sandbox Project',
  lessons_completed: 'Lessons Completed',
  exercises_passed: 'Exercises Passed',
  courses_finished: 'Courses Finished',
  login_streak: 'Login Streak (Days)',
  xp_earned: 'XP Earned (Total)',
  level_reached: 'Level Reached',
}

const triggerOptions: { value: TriggerType; label: string; hasValue: boolean }[] = [
  { value: 'first_login', label: 'First Login', hasValue: false },
  { value: 'first_lesson', label: 'First Lesson Completed', hasValue: false },
  { value: 'first_exercise', label: 'First Exercise Passed', hasValue: false },
  { value: 'first_quiz', label: 'First Quiz Completed', hasValue: false },
  { value: 'first_sandbox', label: 'First Sandbox Project', hasValue: false },
  { value: 'lessons_completed', label: 'Lessons Completed', hasValue: true },
  { value: 'exercises_passed', label: 'Exercises Passed', hasValue: true },
  { value: 'courses_finished', label: 'Courses Finished', hasValue: true },
  { value: 'login_streak', label: 'Login Streak (Days)', hasValue: true },
  { value: 'xp_earned', label: 'XP Earned (Total)', hasValue: true },
  { value: 'level_reached', label: 'Level Reached', hasValue: true },
]

interface BadgeDetailPanelProps {
  badge: Badge | null
  isOpen: boolean
  onClose: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export function BadgeDetailPanel({
  badge,
  isOpen,
  onClose,
  canEdit = true,
  canDelete = true,
}: BadgeDetailPanelProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'award' as BadgeIcon,
    color: 'indigo' as BadgeColor,
    triggerType: 'first_lesson' as TriggerType,
    triggerValue: 10,
    status: 'active' as 'active' | 'inactive',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateBadge = useUpdateBadge()
  const deleteBadge = useDeleteBadge()
  const { confirm, dialogProps } = useConfirmDialog()

  const selectedTrigger = triggerOptions.find((t) => t.value === formData.triggerType)
  const gradients = badgeColorGradients[formData.color]

  useEffect(() => {
    if (badge) {
      setFormData({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        triggerType: badge.triggerType,
        triggerValue: badge.triggerValue || 10,
        status: badge.status,
      })
      setMode('view')
      setErrors({})
    }
  }, [badge])

  const handleClose = () => {
    setMode('view')
    setErrors({})
    onClose()
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Badge name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!badge || !validate()) return

    try {
      await updateBadge.mutateAsync({
        id: badge.id,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        gradientFrom: gradients.from,
        gradientTo: gradients.to,
        triggerType: formData.triggerType,
        triggerValue: selectedTrigger?.hasValue ? formData.triggerValue : undefined,
        status: formData.status,
      })
      setMode('view')
    } catch {
      setErrors({ submit: 'Failed to update badge' })
    }
  }

  const handleDelete = async () => {
    if (!badge) return

    const confirmed = await confirm({
      title: 'Delete Badge',
      message: `Are you sure you want to delete "${badge.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteBadge.mutateAsync(badge.id)
        handleClose()
      } catch {
        // Handle error
      }
    }
  }

  if (!badge) return null

  const BadgeIcon = iconMap[badge.icon] || Award
  const PreviewIcon = iconMap[formData.icon] || Award

  return (
    <>
      <SlideOverPanel
        isOpen={isOpen}
        onClose={handleClose}
        breadcrumb={['Badges', badge.name]}
        headerActions={
          mode === 'view' ? (
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
              <Button size="sm" onClick={handleSave} isLoading={updateBadge.isPending}>
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
                isLoading={deleteBadge.isPending}
              >
                <Trash2 className="w-4 h-4" />
                Delete Badge
              </Button>
              <div />
            </div>
          ) : undefined
        }
      >
        {mode === 'view' ? (
          <div className="space-y-8">
            {/* Badge Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                  }}
                >
                  <BadgeIcon className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-800">{badge.name}</h1>
                    <StatusBadge status={badge.status} />
                  </div>
                  <p className="text-slate-500">{badge.description}</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Last updated {formatDate(badge.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trigger Condition Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Trigger Condition</h3>
                <p className="text-slate-700 mb-2">{triggerLabels[badge.triggerType]}</p>
                {badge.triggerValue && (
                  <span className="inline-block bg-accent-100 text-accent-700 px-3 py-1 rounded text-sm font-medium">
                    Value: {badge.triggerValue}
                  </span>
                )}
              </div>

              {/* Statistics Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Statistics</h3>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Users className="w-6 h-6 text-slate-400" />
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{badge.earnedCount}</p>
                    <p className="text-sm text-slate-500">Students Earned</p>
                  </div>
                </div>
              </div>

              {/* Badge Style Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
                <h3 className="font-semibold text-slate-800 mb-4">Badge Style</h3>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Icon</p>
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <BadgeIcon className="w-6 h-6 text-slate-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Color</p>
                    <div
                      className="w-12 h-12 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-2">Preview</p>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                        }}
                      >
                        <BadgeIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-800">{badge.name}</span>
                    </div>
                  </div>
                </div>
              </div>
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

              {/* Preview */}
              <div className="flex justify-center pb-4 border-b border-slate-200">
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${gradients.from}, ${gradients.to})`,
                    }}
                  >
                    <PreviewIcon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-sm text-slate-500">Badge Preview</p>
                </div>
              </div>

              <FormSection title="Basic Information">
                <FormField label="Badge Name" required error={errors.name}>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., First Steps"
                    error={!!errors.name}
                  />
                </FormField>

                <FormField label="Description" required error={errors.description}>
                  <Input
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="e.g., Complete your first lesson"
                    error={!!errors.description}
                  />
                </FormField>
              </FormSection>

              <FormSection title="Appearance">
                <p className="text-xs text-slate-500 mb-3">Icon</p>
                <div className="grid grid-cols-8 gap-2 mb-4">
                  {iconList.map((icon) => {
                    const Icon = iconMap[icon] || Award
                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleChange('icon', icon)}
                        className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center transition-all ${
                          formData.icon === icon
                            ? 'border-accent-600 bg-accent-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-slate-600" />
                      </button>
                    )
                  })}
                </div>

                <p className="text-xs text-slate-500 mb-3">Color</p>
                <div className="flex gap-2">
                  {colorList.map((color) => {
                    const colorGradient = badgeColorGradients[color]
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleChange('color', color)}
                        className={`w-10 h-10 rounded-lg transition-transform hover:scale-110 ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-accent-500' : ''
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${colorGradient.from}, ${colorGradient.to})`,
                        }}
                      />
                    )
                  })}
                </div>
              </FormSection>

              <FormSection
                title="Trigger Condition"
                description="Define when students automatically earn this badge."
              >
                <Select
                  value={formData.triggerType}
                  onChange={(e) => handleChange('triggerType', e.target.value)}
                >
                  <optgroup label="First-Time Events">
                    {triggerOptions
                      .filter((t) => t.value.startsWith('first'))
                      .map((trigger) => (
                        <option key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Completion Counts">
                    {triggerOptions
                      .filter((t) =>
                        ['lessons_completed', 'exercises_passed', 'courses_finished'].includes(t.value)
                      )
                      .map((trigger) => (
                        <option key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Progress Milestones">
                    {triggerOptions
                      .filter((t) =>
                        ['login_streak', 'xp_earned', 'level_reached'].includes(t.value)
                      )
                      .map((trigger) => (
                        <option key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </option>
                      ))}
                  </optgroup>
                </Select>

                {selectedTrigger?.hasValue && (
                  <FormField label="Value" className="mt-4">
                    <Input
                      type="number"
                      value={formData.triggerValue}
                      onChange={(e) => handleChange('triggerValue', parseInt(e.target.value) || 0)}
                      min={1}
                    />
                  </FormField>
                )}
              </FormSection>

              <FormSection title="Status" description="Inactive badges cannot be earned by students.">
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
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                    />
                    <span className="text-sm text-slate-700">Inactive</span>
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
