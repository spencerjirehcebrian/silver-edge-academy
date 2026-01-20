import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { useCreateBadge } from '@/hooks/queries/useBadges'
import { badgeColorGradients, type BadgeIcon, type BadgeColor, type TriggerType } from '@/services/api/badges'
import { iconMap, iconList, colorList, triggerOptions } from './constants'

export default function BadgeCreate() {
  const navigate = useNavigate()
  const createBadge = useCreateBadge()

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

  const gradients = badgeColorGradients[formData.color]
  const IconComponent = iconMap[formData.icon] || Award
  const selectedTrigger = triggerOptions.find((t) => t.value === formData.triggerType)

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Badge name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    try {
      await createBadge.mutateAsync({
        ...formData,
        gradientFrom: gradients.from,
        gradientTo: gradients.to,
        triggerValue: selectedTrigger?.hasValue ? formData.triggerValue : undefined,
      })
      navigate('/admin/badges')
    } catch {
      setErrors({ submit: 'Failed to create badge' })
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview */}
        <FormSection title="Badge Preview">
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${gradients.from}, ${gradients.to})` }}
            >
              <IconComponent className="w-10 h-10 text-white" />
            </div>
          </div>
        </FormSection>

        {/* Basic Info */}
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

        {/* Appearance */}
        <FormSection title="Appearance">
          <FormField label="Icon">
            <div className="grid grid-cols-8 gap-2">
              {iconList.map((icon) => {
                const Icon = iconMap[icon] || Award
                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleChange('icon', icon)}
                    className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center transition-all ${
                      formData.icon === icon ? 'border-accent-600 bg-accent-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-slate-600" />
                  </button>
                )
              })}
            </div>
          </FormField>
          <FormField label="Color">
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
                    style={{ background: `linear-gradient(135deg, ${colorGradient.from}, ${colorGradient.to})` }}
                  />
                )
              })}
            </div>
          </FormField>
        </FormSection>

        {/* Trigger */}
        <FormSection title="Trigger Condition" description="Define when students automatically earn this badge.">
          <FormField label="Trigger Type">
            <Select value={formData.triggerType} onChange={(e) => handleChange('triggerType', e.target.value)}>
              <optgroup label="First-Time Events">
                {triggerOptions.filter((t) => t.value.startsWith('first')).map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
              <optgroup label="Completion Counts">
                {triggerOptions.filter((t) => ['lessons_completed', 'exercises_passed', 'courses_finished'].includes(t.value)).map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
              <optgroup label="Progress Milestones">
                {triggerOptions.filter((t) => ['login_streak', 'xp_earned', 'level_reached'].includes(t.value)).map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
            </Select>
          </FormField>
          {selectedTrigger?.hasValue && (
            <FormField label="Required Value">
              <Input
                type="number"
                value={formData.triggerValue}
                onChange={(e) => handleChange('triggerValue', parseInt(e.target.value) || 0)}
                min={1}
              />
            </FormField>
          )}
        </FormSection>

        {/* Status */}
        <FormSection title="Status">
          <div className="flex items-center gap-4">
            {(['active', 'inactive'] as const).map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-700 capitalize">{status}</span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* Actions */}
        {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/admin/badges">
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" isLoading={createBadge.isPending}>Create Badge</Button>
        </div>
      </form>
    </div>
  )
}
