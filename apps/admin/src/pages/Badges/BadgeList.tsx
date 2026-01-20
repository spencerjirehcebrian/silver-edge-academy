import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Users,
  X,
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
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { useBadges, useCreateBadge, useDeleteBadge, useBadgeEarnedStudents } from '@/hooks/queries/useBadges'
import { useSelection } from '@/hooks/useSelection'
import { useBulkDelete } from '@/hooks/useBulkDelete'
import { badgeColorGradients, type Badge, type BadgeIcon, type BadgeColor, type TriggerType } from '@/services/api/badges'
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

export default function BadgeList() {
  const navigate = useNavigate()
  const { data: badges, isLoading } = useBadges()
  const createBadge = useCreateBadge()
  const deleteBadge = useDeleteBadge()
  const { confirm, dialogProps } = useConfirmDialog()

  const selection = useSelection<Badge>([])

  // Clear selection when badges data changes
  useEffect(() => {
    if (badges) {
      selection.clearSelection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges])

  // Use bulk delete hook
  const { handleBulkDelete, isDeleting } = useBulkDelete<Badge>({
    selection,
    confirm,
    deleteMutation: deleteBadge,
    itemName: 'badge',
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [earnedModalBadgeId, setEarnedModalBadgeId] = useState<string | null>(null)

  const selectedBadgeForModal = badges?.find((b) => b.id === earnedModalBadgeId) || null
  const { data: earnedStudents, isLoading: isLoadingEarned } = useBadgeEarnedStudents(earnedModalBadgeId || '')
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

  const selectedTrigger = triggerOptions.find((t) => t.value === formData.triggerType)
  const gradients = badgeColorGradients[formData.color]
  const IconComponent = iconMap[formData.icon] || Award

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Badge name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      await createBadge.mutateAsync({
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
      setIsModalOpen(false)
      setFormData({
        name: '',
        description: '',
        icon: 'award',
        color: 'indigo',
        triggerType: 'first_lesson',
        triggerValue: 10,
        status: 'active',
      })
    } catch {
      setErrors({ submit: 'Failed to create badge. Please try again.' })
    }
  }

  return (
    <div>
      {dialogProps && <ConfirmDialog {...dialogProps} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-600">Create and manage achievement badges for students</p>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Badge
        </Button>
      </div>

      {/* Badge Grid */}
      {isLoading ? (
        <BadgeGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badges?.map((badge) => {
            const BadgeIcon = iconMap[badge.icon] || Award
            const isSelected = selection.isSelected(badge.id)

            return (
              <div
                key={badge.id}
                onClick={() => navigate(`/admin/badges/${badge.id}`)}
                className={`relative bg-white rounded-xl border p-5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-accent-500 bg-accent-50/50 shadow-md'
                    : 'border-slate-200 hover:shadow-md hover:border-slate-300'
                }`}
              >
                {/* Checkbox overlay in top-left corner */}
                <div
                  className="absolute top-3 left-3 z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    selection.toggle(badge.id)
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => selection.toggle(badge.id)}
                  />
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center ml-6"
                    style={{
                      background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                    }}
                  >
                    <BadgeIcon className="w-7 h-7 text-white" />
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      badge.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {badge.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{badge.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{badge.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (badge.earnedCount > 0) {
                      setEarnedModalBadgeId(badge.id)
                    }
                  }}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    badge.earnedCount > 0
                      ? 'text-slate-400 hover:text-accent-600 cursor-pointer'
                      : 'text-slate-300 cursor-default'
                  }`}
                  disabled={badge.earnedCount === 0}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{badge.earnedCount} earned</span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selection.selectedCount}
        onDelete={handleBulkDelete}
        onClearSelection={selection.clearSelection}
        isDeleting={isDeleting}
        itemName="badges"
      />

      {/* Earned Students Modal */}
      <Modal
        isOpen={!!earnedModalBadgeId}
        onClose={() => setEarnedModalBadgeId(null)}
        title={`Students who earned "${selectedBadgeForModal?.name || ''}"`}
        size="lg"
      >
        {isLoadingEarned ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : earnedStudents && earnedStudents.length > 0 ? (
          <div className="max-h-96 overflow-y-auto -mx-6 px-6">
            {earnedStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
              >
                <Avatar name={student.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {student.displayName}
                  </p>
                  <p className="text-sm text-slate-500">{student.className}</p>
                </div>
                <span className="text-sm text-slate-400 flex-shrink-0">
                  {new Date(student.earnedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">
            No students have earned this badge yet.
          </p>
        )}
      </Modal>

      {/* Create Badge Modal/Panel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-800">Create Badge</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Preview */}
              <div className="flex justify-center">
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${gradients.from}, ${gradients.to})`,
                    }}
                  >
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-sm text-slate-500">Badge Preview</p>
                </div>
              </div>

              {/* Name */}
              <FormField label="Badge Name" required error={errors.name}>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., First Steps"
                  error={!!errors.name}
                />
              </FormField>

              {/* Description */}
              <FormField label="Description" required error={errors.description}>
                <Input
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="e.g., Complete your first lesson"
                  error={!!errors.description}
                />
              </FormField>

              {/* Icon Selection */}
              <FormSection title="Icon">
                <div className="grid grid-cols-8 gap-2">
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
              </FormSection>

              {/* Color Selection */}
              <FormSection title="Color">
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

              {/* Trigger Configuration */}
              <FormSection
                title="Trigger Condition"
                description="Define when students automatically earn this badge."
              >
                <div className="space-y-4">
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
                          ['lessons_completed', 'exercises_passed', 'courses_finished'].includes(
                            t.value
                          )
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
                    <FormField label="Value">
                      <Input
                        type="number"
                        value={formData.triggerValue}
                        onChange={(e) =>
                          handleChange('triggerValue', parseInt(e.target.value) || 0)
                        }
                        min={1}
                      />
                    </FormField>
                  )}
                </div>
              </FormSection>

              {/* Status */}
              <FormSection title="Status">
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

            {/* Modal Footer */}
            {errors.submit && (
              <p className="text-sm text-red-600 px-6">{errors.submit}</p>
            )}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <Button onClick={handleSubmit} isLoading={createBadge.isPending}>
                Create Badge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BadgeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="w-14 h-14 bg-slate-200 rounded-xl mb-4 animate-pulse" />
          <div className="h-5 bg-slate-200 rounded w-24 mb-2 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-32 mb-3 animate-pulse" />
          <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
