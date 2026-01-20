import {
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
import { useUserAchievements } from '@/hooks/queries/useUsers'
import { formatDate } from '@/utils/formatters'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
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

interface StudentAchievementsTabProps {
  userId: string
}

export function StudentAchievementsTab({ userId }: StudentAchievementsTabProps) {
  const { data: achievements, isLoading } = useUserAchievements(userId)

  if (isLoading) {
    return <StudentAchievementsTabSkeleton />
  }

  if (!achievements) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">No achievements yet</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          This student has not earned any achievements yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-bold text-slate-800">{achievements.badges.length}</p>
          <p className="text-sm text-slate-500">Badges Earned</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-bold text-slate-800">
            {achievements.totalXp.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">Total XP</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-bold text-slate-800">Lv. {achievements.level}</p>
          <p className="text-sm text-slate-500">Current Level</p>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h4 className="font-semibold text-slate-800 mb-3">Earned Badges</h4>
        {achievements.badges.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {achievements.badges.map((badge) => {
              const Icon = iconMap[badge.icon] || Award
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 text-sm truncate">{badge.name}</p>
                    <p className="text-xs text-slate-500">{formatDate(badge.earnedAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No badges earned yet</p>
        )}
      </div>

      {/* XP History */}
      <div>
        <h4 className="font-semibold text-slate-800 mb-3">Recent XP History</h4>
        {achievements.xpHistory && achievements.xpHistory.length > 0 ? (
          <div className="space-y-2">
            {achievements.xpHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-sm text-slate-700">{item.source}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                </div>
                <span className="text-sm font-medium text-emerald-600">+{item.xp} XP</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No XP history available</p>
        )}
      </div>
    </div>
  )
}

function StudentAchievementsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="h-8 bg-slate-200 rounded w-16 mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-20 mx-auto animate-pulse" />
          </div>
        ))}
      </div>

      {/* Badges skeleton */}
      <div>
        <div className="h-5 bg-slate-200 rounded w-32 mb-3 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
              <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
