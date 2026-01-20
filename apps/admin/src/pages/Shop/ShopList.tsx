import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  SelectAllHead,
  SelectableCell,
} from '@/components/ui/Table'
import { useShopItems, useDeleteShopItem } from '@/hooks/queries/useShop'
import { useSelection } from '@/hooks/useSelection'
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

export default function ShopList() {
  const navigate = useNavigate()
  const { data: allItems, isLoading } = useShopItems()
  const deleteItem = useDeleteShopItem()
  const { confirm, dialogProps } = useConfirmDialog()

  const [activeTab, setActiveTab] = useState('avatar_pack')

  const avatarPacks = useMemo(
    () => allItems?.filter((i) => i.category === 'avatar_pack') || [],
    [allItems]
  )
  const uiThemes = useMemo(
    () => allItems?.filter((i) => i.category === 'ui_theme') || [],
    [allItems]
  )
  const editorThemes = useMemo(
    () => allItems?.filter((i) => i.category === 'editor_theme') || [],
    [allItems]
  )
  const teacherRewards = useMemo(
    () => allItems?.filter((i) => i.category === 'teacher_reward') || [],
    [allItems]
  )

  // Selection for teacher rewards table
  const rewardSelection = useSelection<ShopItem>([])

  // Clear selection when teacher rewards data changes
  useEffect(() => {
    if (teacherRewards) {
      rewardSelection.clearSelection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherRewards])

  const handleItemClick = (item: ShopItem) => {
    navigate(`/admin/shop/${item.id}`)
  }

  const handleBulkDelete = async () => {
    const count = rewardSelection.selectedCount

    const confirmed = await confirm({
      title: `Delete ${count} rewards`,
      message: `Are you sure you want to delete ${count} teacher rewards? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      const ids = Array.from(rewardSelection.selectedIds)
      for (const id of ids) {
        await deleteItem.mutateAsync(id)
      }
      rewardSelection.clearSelection()
    }
  }

  if (isLoading) {
    return <ShopSkeleton />
  }

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Tabs defaultValue="avatar_pack" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-slate-200">
            <TabsList>
              <TabsTrigger value="avatar_pack">Avatar Packs</TabsTrigger>
              <TabsTrigger value="ui_theme">UI Themes</TabsTrigger>
              <TabsTrigger value="editor_theme">Editor Themes</TabsTrigger>
              <TabsTrigger value="teacher_reward">Teacher Rewards</TabsTrigger>
            </TabsList>
          </div>

          {/* Avatar Packs */}
          <TabsContent value="avatar_pack" className="p-6">
            <p className="text-slate-600 mb-6">
              Enable avatar packs for students to purchase. Each pack contains themed avatars.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {avatarPacks.map((pack) => (
                <AvatarPackCard
                  key={pack.id}
                  item={pack}
                  onClick={() => handleItemClick(pack)}
                />
              ))}
            </div>
          </TabsContent>

          {/* UI Themes */}
          <TabsContent value="ui_theme" className="p-6">
            <p className="text-slate-600 mb-6">
              Predefined UI themes for students. Includes dark mode and custom color schemes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {uiThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  item={theme}
                  onClick={() => handleItemClick(theme)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Editor Themes */}
          <TabsContent value="editor_theme" className="p-6">
            <p className="text-slate-600 mb-6">Code editor syntax highlighting themes.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {editorThemes.map((theme) => (
                <EditorThemeCard
                  key={theme.id}
                  item={theme}
                  onClick={() => handleItemClick(theme)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Teacher Rewards */}
          <TabsContent value="teacher_reward" className="p-6">
            <p className="text-slate-600 mb-6">
              Teacher-created custom rewards across all classes. Admin can view and override any
              reward.
            </p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SelectAllHead
                      isAllSelected={rewardSelection.isAllSelected}
                      isIndeterminate={rewardSelection.isIndeterminate}
                      onSelectAll={rewardSelection.toggleAll}
                    />
                    <TableHead>Reward</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purchased</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherRewards.length === 0 ? (
                    <TableEmpty colSpan={7} message="No teacher rewards found" />
                  ) : (
                    teacherRewards.map((reward) => (
                      <TableRow
                        key={reward.id}
                        clickable
                        selected={rewardSelection.isSelected(reward.id)}
                        onClick={() => handleItemClick(reward)}
                      >
                        <SelectableCell
                          isSelected={rewardSelection.isSelected(reward.id)}
                          onSelect={() => rewardSelection.toggle(reward.id)}
                        />
                        <TableCell className="font-medium text-slate-800">{reward.name}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {reward.teacherName}
                        </TableCell>
                        <TableCell>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                            {reward.className}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-sm font-medium">{reward.price}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              reward.type === 'consumable'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {reward.type === 'consumable' ? 'Consumable' : 'Permanent'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {reward.purchaseCount}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bulk Action Bar - only for teacher rewards */}
      {activeTab === 'teacher_reward' && (
        <BulkActionBar
          selectedCount={rewardSelection.selectedCount}
          onDelete={handleBulkDelete}
          onClearSelection={rewardSelection.clearSelection}
          isDeleting={deleteItem.isPending}
          itemName="rewards"
        />
      )}
    </>
  )
}

function AvatarPackCard({
  item,
  onClick,
}: {
  item: ShopItem
  onClick: () => void
}) {
  const icons = item.previewIcons || []

  return (
    <div
      onClick={onClick}
      className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
    >
      <div
        className="h-32 p-4 flex items-center justify-center gap-2"
        style={{
          background: `linear-gradient(135deg, ${item.gradientFrom}20, ${item.gradientTo}30)`,
        }}
      >
        {icons.slice(0, 3).map((icon, idx) => {
          const Icon = iconMap[icon] || Star
          const colors = [
            { from: item.gradientFrom, to: item.gradientTo },
            { from: '#a855f7', to: '#9333ea' },
            { from: '#3b82f6', to: '#2563eb' },
          ]
          const color = colors[idx % colors.length]
          return (
            <div
              key={icon}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          )
        })}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-800">{item.name}</h4>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              item.status === 'enabled'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {item.status === 'enabled' ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-3">{item.description}</p>
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-amber-600">{item.price}</span>
          <span className="text-sm text-slate-400">per avatar</span>
        </div>
      </div>
    </div>
  )
}

function ThemeCard({
  item,
  onClick,
}: {
  item: ShopItem
  onClick: () => void
}) {
  const isDark =
    item.gradientFrom?.startsWith('#1') ||
    item.gradientFrom?.startsWith('#2') ||
    item.gradientFrom?.startsWith('#3')

  return (
    <div
      onClick={onClick}
      className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
    >
      <div
        className="h-24 p-3 flex items-end"
        style={{ background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})` }}
      >
        <div
          className={`w-full h-4 rounded-sm flex items-center px-2 gap-1 ${
            isDark ? 'bg-white/20' : 'bg-black/10'
          }`}
        >
          {isDark && (
            <>
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-800">{item.name}</h4>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              item.status === 'enabled'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {item.status === 'enabled' ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-amber-600">{item.price}</span>
        </div>
      </div>
    </div>
  )
}

function EditorThemeCard({
  item,
  onClick,
}: {
  item: ShopItem
  onClick: () => void
}) {
  const isLight = item.gradientFrom === '#ffffff' || item.gradientFrom === '#f6f8fa'
  const syntaxColors = isLight
    ? ['text-[#d73a49]', 'text-[#6f42c1]', 'text-[#032f62]']
    : ['text-[#f92672]', 'text-[#a6e22e]', 'text-[#e6db74]']

  return (
    <div
      onClick={onClick}
      className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
    >
      <div
        className={`h-24 p-3 font-mono text-xs ${isLight ? 'border-b' : ''}`}
        style={{ background: item.gradientFrom }}
      >
        <div className={syntaxColors[0]}>function</div>
        <div className={syntaxColors[1]}>hello()</div>
        <div className={syntaxColors[2]}>&quot;world&quot;</div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-800">{item.name}</h4>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              item.status === 'enabled'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {item.status === 'enabled' ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-amber-600">{item.price}</span>
        </div>
      </div>
    </div>
  )
}

function ShopSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 p-4 flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="p-6 grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="h-32 bg-slate-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-slate-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
