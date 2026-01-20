import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Coins,
  Calendar,
  ShoppingBag,
  Loader2,
  Star,
  Palette,
  Code,
  Gift,
  Rocket,
  Moon,
  Cat,
  Dog,
  Bird,
  Crown,
  Shield,
  Sword,
  Bot,
  Cpu,
  Zap,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DetailActionBar } from '@/components/ui/DetailActionBar'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useShopItem, useDeleteShopItem, useToggleShopItemStatus } from '@/hooks/queries/useShop'
import { useSetPageMeta } from '@/contexts/PageMetaContext'
import { formatDate } from '@/utils/formatters'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket, moon: Moon, star: Star, cat: Cat, dog: Dog, bird: Bird,
  crown: Crown, shield: Shield, sword: Sword, bot: Bot, cpu: Cpu, zap: Zap,
}

const categoryLabels: Record<string, string> = {
  avatar_pack: 'Avatar Pack',
  ui_theme: 'UI Theme',
  editor_theme: 'Editor Theme',
  teacher_reward: 'Teacher Reward',
}

const categoryIcons: Record<string, LucideIcon> = {
  avatar_pack: Star,
  ui_theme: Palette,
  editor_theme: Code,
  teacher_reward: Gift,
}

export default function ShopItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading } = useShopItem(id || '')
  const deleteItem = useDeleteShopItem()
  const toggleStatus = useToggleShopItemStatus()
  const { confirm, dialogProps } = useConfirmDialog()

  useSetPageMeta({ entityLabel: item?.name })

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
        navigate('/admin/shop')
      } catch {
        // Error handled by mutation
      }
    }
  }

  const handleToggleStatus = async () => {
    if (!item) return
    await toggleStatus.mutateAsync(item.id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Item not found</p>
        <Link to="/admin/shop" className="text-accent-600 hover:underline mt-2 inline-block">
          Back to Shop
        </Link>
      </div>
    )
  }

  const CategoryIcon = categoryIcons[item.category] || Star

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start gap-6">
              {/* Item Preview */}
              {item.category === 'avatar_pack' && (
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center gap-2 flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${item.gradientFrom}40, ${item.gradientTo}60)` }}
                >
                  {(item.previewIcons || []).slice(0, 2).map((icon) => {
                    const Icon = iconMap[icon] || Star
                    return (
                      <div
                        key={icon}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})` }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    )
                  })}
                </div>
              )}
              {(item.category === 'ui_theme' || item.category === 'editor_theme') && (
                <div
                  className="w-24 h-24 rounded-2xl flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})` }}
                />
              )}
              {item.category === 'teacher_reward' && (
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 bg-accent-100">
                  <Gift className="w-12 h-12 text-accent-600" />
                </div>
              )}

              {/* Item Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-800">{item.name}</h2>
                  <StatusBadge status={item.status === 'enabled' ? 'active' : 'inactive'} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CategoryIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">{categoryLabels[item.category]}</span>
                </div>
                {item.description && <p className="text-slate-600 mb-4">{item.description}</p>}

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{item.purchaseCount || 0} purchases</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Card */}
          <Card>
            <CardHeader title="Pricing" />
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-amber-600">{item.price}</span>
              <span className="text-slate-500">coins</span>
            </div>
          </Card>

          {/* Availability Card */}
          <Card>
            <CardHeader title="Availability" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-700">
                  Item is currently <strong>{item.status}</strong>
                </p>
                <p className="text-sm text-slate-500 mt-1">
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
          </Card>

          {/* Teacher Reward Specific */}
          {item.category === 'teacher_reward' && (
            <Card>
              <CardHeader title="Reward Details" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Created By</p>
                  <p className="font-medium text-slate-700">{item.teacherName || 'Unknown'}</p>
                </div>
                {item.className && (
                  <div>
                    <p className="text-slate-500 mb-1">Class</p>
                    <p className="font-medium text-slate-700">{item.className}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 mb-1">Type</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      item.type === 'consumable'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.type === 'consumable' ? 'Consumable' : 'Permanent'}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview Card */}
          <Card className="text-center">
            {item.category !== 'teacher_reward' && item.gradientFrom && (
              <div
                className="w-20 h-20 rounded-2xl mx-auto mb-4"
                style={{ background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})` }}
              />
            )}
            {item.category === 'teacher_reward' && (
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 bg-accent-100 flex items-center justify-center">
                <Gift className="w-10 h-10 text-accent-600" />
              </div>
            )}
            <h3 className="font-semibold text-slate-800">{item.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{categoryLabels[item.category]}</p>
          </Card>

          {/* Item Info */}
          <Card>
            <CardHeader title="Item Info" />
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={item.status === 'enabled' ? 'active' : 'inactive'} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Category</span>
                <span className="text-slate-700">{categoryLabels[item.category]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Price</span>
                <span className="text-slate-700">{item.price} coins</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Purchases</span>
                <span className="text-slate-700">{item.purchaseCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-700">{formatDate(item.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Updated</span>
                <span className="text-slate-700">{formatDate(item.updatedAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <DetailActionBar
        backTo="/admin/shop"
        backLabel="Shop"
        editTo={`/admin/shop/${id}/edit`}
        onDelete={handleDelete}
        isDeleting={deleteItem.isPending}
      />
    </>
  )
}
