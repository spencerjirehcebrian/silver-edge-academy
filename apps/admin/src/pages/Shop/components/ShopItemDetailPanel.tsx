import { useState, useEffect } from 'react'
import {
  Pencil,
  Trash2,
  Coins,
  Rocket,
  Moon,
  Star,
  Cat,
  Dog,
  Bird,
  Crown,
  Shield,
  Sword,
  Bot,
  Cpu,
  Zap,
  Palette,
  Code,
  Gift,
} from 'lucide-react'
import { SlideOverPanel } from '@/components/ui/SlideOverPanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useUpdateShopItem, useDeleteShopItem, useToggleShopItemStatus } from '@/hooks/queries/useShop'
import { formatDate } from '@/utils/formatters'
import type { ShopItem } from '@/services/api/shop'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket,
  moon: Moon,
  star: Star,
  cat: Cat,
  dog: Dog,
  bird: Bird,
  crown: Crown,
  shield: Shield,
  sword: Sword,
  bot: Bot,
  cpu: Cpu,
  zap: Zap,
}

const categoryLabels: Record<string, string> = {
  avatar_pack: 'Avatar Packs',
  ui_theme: 'UI Themes',
  editor_theme: 'Editor Themes',
  teacher_reward: 'Teacher Rewards',
}

const categoryIcons: Record<string, LucideIcon> = {
  avatar_pack: Star,
  ui_theme: Palette,
  editor_theme: Code,
  teacher_reward: Gift,
}

interface ShopItemDetailPanelProps {
  item: ShopItem | null
  isOpen: boolean
  onClose: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ShopItemDetailPanel({
  item,
  isOpen,
  onClose,
  canEdit = true,
  canDelete = true,
}: ShopItemDetailPanelProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    status: 'enabled' as 'enabled' | 'disabled',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateItem = useUpdateShopItem()
  const deleteItem = useDeleteShopItem()
  const toggleStatus = useToggleShopItemStatus()
  const { confirm, dialogProps } = useConfirmDialog()

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        status: item.status,
      })
      setMode('view')
      setErrors({})
    }
  }, [item])

  const handleClose = () => {
    setMode('view')
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (formData.price < 0) newErrors.price = 'Price must be positive'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!item || !validateForm()) return

    try {
      await updateItem.mutateAsync({
        id: item.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        status: formData.status,
      })
      setMode('view')
    } catch {
      setErrors({ submit: 'Failed to update item' })
    }
  }

  const handleDelete = async () => {
    if (!item) return

    const confirmed = await confirm({
      title: 'Delete Shop Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteItem.mutateAsync(item.id)
        handleClose()
      } catch {
        // Handle error
      }
    }
  }

  const handleToggleStatus = async () => {
    if (!item) return
    try {
      await toggleStatus.mutateAsync(item.id)
    } catch {
      // Handle error
    }
  }

  if (!item) return null

  const CategoryIcon = categoryIcons[item.category] || Star

  return (
    <>
      <SlideOverPanel
        isOpen={isOpen}
        onClose={handleClose}
        breadcrumb={['Shop', categoryLabels[item.category], item.name]}
        headerActions={
          mode === 'view' ? (
            <>
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
              <Button size="sm" onClick={handleSave} isLoading={updateItem.isPending}>
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
                isLoading={deleteItem.isPending}
              >
                <Trash2 className="w-4 h-4" />
                Delete Item
              </Button>
              <div />
            </div>
          ) : undefined
        }
      >
        {mode === 'view' ? (
          <div className="space-y-8">
            {/* Item Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-6">
                {/* Preview */}
                {item.category === 'avatar_pack' && (
                  <div
                    className="w-24 h-24 rounded-xl flex items-center justify-center gap-2 flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradientFrom}40, ${item.gradientTo}60)`,
                    }}
                  >
                    {(item.previewIcons || []).slice(0, 2).map((icon) => {
                      const Icon = iconMap[icon] || Star
                      return (
                        <div
                          key={icon}
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                          }}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      )
                    })}
                  </div>
                )}
                {(item.category === 'ui_theme' || item.category === 'editor_theme') && (
                  <div
                    className="w-24 h-24 rounded-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                    }}
                  />
                )}
                {item.category === 'teacher_reward' && (
                  <div className="w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent-100">
                    <Gift className="w-10 h-10 text-accent-600" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-800">{item.name}</h1>
                    <StatusBadge status={item.status === 'enabled' ? 'active' : 'inactive'} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">{categoryLabels[item.category]}</span>
                  </div>
                  {item.description && <p className="text-slate-500">{item.description}</p>}
                  <p className="text-sm text-slate-400 mt-2">
                    Last updated {formatDate(item.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Pricing</h3>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-amber-500" />
                  <span className="text-3xl font-bold text-amber-600">{item.price}</span>
                  <span className="text-slate-500">coins</span>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Availability</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Item is currently <strong>{item.status}</strong>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.status === 'enabled'
                        ? 'Available for purchase in the shop'
                        : 'Hidden from the shop'}
                    </p>
                  </div>
                  <Button
                    variant={item.status === 'enabled' ? 'warning' : 'primary'}
                    size="sm"
                    onClick={handleToggleStatus}
                    isLoading={toggleStatus.isPending}
                  >
                    {item.status === 'enabled' ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              {/* Teacher Reward Specific */}
              {item.category === 'teacher_reward' && (
                <>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Created By</h3>
                    <p className="text-slate-700">{item.teacherName || 'Unknown Teacher'}</p>
                    {item.className && (
                      <span className="inline-block mt-2 bg-slate-100 text-slate-600 px-2 py-1 rounded text-sm">
                        {item.className}
                      </span>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Reward Type</h3>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        item.type === 'consumable'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.type === 'consumable' ? 'Consumable' : 'Permanent'}
                    </span>
                    <p className="text-xs text-slate-500 mt-2">
                      {item.type === 'consumable'
                        ? 'Can be purchased multiple times'
                        : 'Can only be purchased once per student'}
                    </p>
                  </div>
                </>
              )}

              {/* Purchase Stats */}
              {item.purchaseCount !== undefined && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Statistics</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-800">{item.purchaseCount}</p>
                    <p className="text-sm text-slate-500">Total Purchases</p>
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

              <FormSection title="Item Information">
                <FormField label="Name" required error={errors.name}>
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
                    placeholder="Brief description of the item"
                  />
                </FormField>
              </FormSection>

              <FormSection title="Pricing">
                <FormField label="Price (coins)" required error={errors.price}>
                  <Input
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    error={!!errors.price}
                  />
                </FormField>
              </FormSection>

              <FormSection title="Availability" description="Disabled items are hidden from the shop.">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="enabled"
                      checked={formData.status === 'enabled'}
                      onChange={() => handleInputChange('status', 'enabled')}
                      className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                    />
                    <span className="text-sm text-slate-700">Enabled</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="disabled"
                      checked={formData.status === 'disabled'}
                      onChange={() => handleInputChange('status', 'disabled')}
                      className="w-4 h-4 text-accent-600 focus:ring-accent-500"
                    />
                    <span className="text-sm text-slate-700">Disabled</span>
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
