import { useDashboardActivity } from '@/hooks/queries/useDashboard'
import { cn } from '@/utils/cn'

export function ActivityChart() {
  const { data: activity, isLoading } = useDashboardActivity()

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 animate-fade-in">
        <div className="p-5 border-b border-slate-100">
          <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
        </div>
        <div className="p-5">
          <div className="h-48 flex items-end justify-between gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-slate-200 rounded-t animate-pulse"
                  style={{ height: `${30 + Math.random() * 50}%` }}
                />
                <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(
    ...(activity?.map((d) => d.lessonsCompleted + d.exercisesCompleted + d.quizzesCompleted) || [100])
  )

  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 animate-fade-in delay-5">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Daily Activity</h3>
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>
      <div className="p-5">
        <div className="h-48 flex items-end justify-between gap-2">
          {activity?.map((item, index) => {
            const value = item.lessonsCompleted + item.exercisesCompleted + item.quizzesCompleted
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0
            const dayLabel = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
            const isToday = new Date(item.date).toDateString() === new Date().toDateString()

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-full rounded-t transition-all hover:opacity-80',
                    isToday ? 'bg-accent-500 hover:bg-accent-600' : 'bg-accent-100 hover:bg-accent-200'
                  )}
                  style={{ height: `${height}%` }}
                  title={`${value} activities\nLessons: ${item.lessonsCompleted}\nExercises: ${item.exercisesCompleted}\nQuizzes: ${item.quizzesCompleted}`}
                />
                <span
                  className={cn(
                    'text-xs',
                    isToday ? 'text-slate-500 font-medium' : 'text-slate-400'
                  )}
                >
                  {dayLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
