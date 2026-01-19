import { Star, Flame, Trophy, Lock } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import type { StudentBadge } from '@/services/api/gamification'

interface BadgesTabProps {
  earned: StudentBadge[]
  locked: StudentBadge[]
  isLoading: boolean
  totalEarned: number
  totalAvailable: number
}

// Map icon names to components
const iconMap: Record<string, typeof Star> = {
  footprints: Star,
  bug: Star,
  flame: Flame,
  repeat: Star,
  trophy: Trophy,
  compass: Star,
  'hand-helping': Star,
  star: Star,
}

export function BadgesTab({ earned, locked, isLoading, totalEarned, totalAvailable: _totalAvailable }: BadgesTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} variant="rectangular" className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <div>
        <h3 className="font-display font-semibold text-slate-800 text-lg mb-4">
          Badges Earned ({totalEarned})
        </h3>

        {earned.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Complete lessons and exercises to earn badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {earned.map((badge) => {
              const Icon = iconMap[badge.iconName] || Star
              return (
                <div key={badge.id} className="text-center">
                  <div
                    className="w-full aspect-square rounded-xl flex items-center justify-center crystal-gem mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                    }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate">{badge.name}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-slate-500 text-lg mb-4">
            Locked Badges ({locked.length})
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {locked.map((badge) => (
              <div key={badge.id} className="text-center opacity-50">
                <div className="w-full aspect-square rounded-xl bg-slate-200 flex items-center justify-center mb-2">
                  <Lock className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500 truncate">???</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
