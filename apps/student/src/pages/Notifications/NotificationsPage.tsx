import { Bell, Clock, MessageSquare, Award, TrendingUp, Flame, CheckCircle } from 'lucide-react'
import { useNotifications, useMarkNotificationRead } from '@/hooks/queries/useProfile'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'
import type { StudentNotification } from '@/types/student'

const typeConfig = {
  help_response: { icon: MessageSquare, color: 'text-blue-500', bgColor: 'bg-blue-50', label: 'Help' },
  badge_earned: { icon: Award, color: 'text-amber-500', bgColor: 'bg-amber-50', label: 'Badge' },
  level_up: { icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-50', label: 'Level Up' },
  streak: { icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-50', label: 'Streak' },
  general: { icon: Bell, color: 'text-slate-500', bgColor: 'bg-slate-50', label: 'General' },
}

export default function NotificationsPage() {
  const { data, isLoading, error } = useNotifications()
  const markRead = useMarkNotificationRead()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton variant="rectangular" className="h-24" />
        <Skeleton variant="rectangular" className="h-24" />
        <Skeleton variant="rectangular" className="h-24" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load notifications</p>
      </div>
    )
  }

  const handleMarkRead = (notificationId: string) => {
    markRead.mutate(notificationId)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
        {data?.unreadCount && data.unreadCount > 0 && (
          <span className="text-sm text-slate-500">
            {data.unreadCount} unread
          </span>
        )}
      </div>

      {!data?.notifications.length ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No notifications"
          description="You're all caught up! New notifications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {data.notifications.map((notification: StudentNotification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: StudentNotification
  onMarkRead: (id: string) => void
}) {
  const config = typeConfig[notification.type] || typeConfig.general
  const TypeIcon = config.icon

  return (
    <Card
      padding="md"
      className={cn(
        'transition-all',
        !notification.read && 'border-l-4 border-l-primary-500 bg-primary-50/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-xl', config.bgColor)}>
          <TypeIcon className={cn('w-5 h-5', config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-bold text-slate-800">{notification.title}</h3>
              <Badge size="sm" className={cn(config.bgColor, config.color)}>
                {config.label}
              </Badge>
            </div>

            {!notification.read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-emerald-500"
                title="Mark as read"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-sm text-slate-600 mt-2">{notification.message}</p>

          <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
