import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Users,
  Calendar,
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
  Loader2,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { DetailActionBar } from '@/components/ui/DetailActionBar'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useBadge, useDeleteBadge } from '@/hooks/queries/useBadges'
import { formatDate } from '@/utils/formatters'
import type { BadgeIcon, TriggerType } from '@/services/api/badges'
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

export default function BadgeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: badge, isLoading } = useBadge(id || '')
  const deleteBadge = useDeleteBadge()
  const { confirm, dialogProps } = useConfirmDialog()

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
        navigate('/admin/badges')
      } catch {
        // Error handled by mutation
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
      </div>
    )
  }

  if (!badge) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Badge not found</p>
        <Link to="/admin/badges" className="text-accent-600 hover:underline mt-2 inline-block">
          Back to Badges
        </Link>
      </div>
    )
  }

  const IconComponent = iconMap[badge.icon] || Award
  const triggerLabel = triggerLabels[badge.triggerType]
  const hasTriggerValue = badge.triggerValue !== undefined && badge.triggerValue !== null

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start gap-6">
              {/* Badge Icon */}
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                }}
              >
                <IconComponent className="w-12 h-12 text-white" />
              </div>

              {/* Badge Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-800">{badge.name}</h2>
                  <StatusBadge status={badge.status} />
                </div>
                <p className="text-slate-600 mb-4">{badge.description}</p>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users className="w-4 h-4" />
                    <span>{badge.earnedCount} students earned</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(badge.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Trigger Configuration */}
          <Card>
            <CardHeader title="Trigger Condition" />
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">This badge is automatically awarded when:</p>
                <p className="font-medium text-slate-800">
                  {triggerLabel}
                  {hasTriggerValue && (
                    <span className="text-accent-600 ml-1">
                      ({badge.triggerValue})
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Trigger Type</p>
                  <p className="font-medium text-slate-700">{triggerLabel}</p>
                </div>
                {hasTriggerValue && (
                  <div>
                    <p className="text-slate-500 mb-1">Required Value</p>
                    <p className="font-medium text-slate-700">{badge.triggerValue}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Recent Earners (placeholder) */}
          <Card>
            <CardHeader title="Recent Earners" />
            {badge.earnedCount > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-accent-600">JD</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">John Doe</p>
                      <p className="text-xs text-slate-400">Class 5A</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Today</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-600">JS</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Jane Smith</p>
                      <p className="text-xs text-slate-400">Class 5B</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Yesterday</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No students have earned this badge yet.</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Badge Preview Card */}
          <Card className="text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
              }}
            >
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold text-slate-800">{badge.name}</h3>
            <p className="text-sm text-slate-500 mt-1 capitalize">{badge.color}</p>
          </Card>

          {/* Badge Info */}
          <Card>
            <CardHeader title="Badge Info" />
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={badge.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Icon</span>
                <span className="text-slate-700 capitalize">{badge.icon}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Color</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                    }}
                  />
                  <span className="text-slate-700 capitalize">{badge.color}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Earned By</span>
                <span className="text-slate-700">{badge.earnedCount} students</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-700">{formatDate(badge.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Last Updated</span>
                <span className="text-slate-700">{formatDate(badge.updatedAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <DetailActionBar
        backTo="/admin/badges"
        backLabel="Badges"
        editTo={`/admin/badges/${id}/edit`}
        onDelete={handleDelete}
        isDeleting={deleteBadge.isPending}
      />
    </>
  )
}
