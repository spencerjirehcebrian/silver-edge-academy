import { HelpCircle, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'
import { useHelpRequests } from '@/hooks/queries/useHelp'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'
import type { StudentHelpRequest } from '@/types/student'

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-50', label: 'Waiting' },
  in_progress: { icon: AlertCircle, color: 'text-blue-500', bgColor: 'bg-blue-50', label: 'In Progress' },
  resolved: { icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-50', label: 'Resolved' },
  closed: { icon: CheckCircle, color: 'text-slate-400', bgColor: 'bg-slate-50', label: 'Closed' },
}

export default function HelpRequestsPage() {
  const { data, isLoading, error } = useHelpRequests()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton variant="rectangular" className="h-32" />
        <Skeleton variant="rectangular" className="h-32" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load help requests</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800">Help Requests</h1>

      {data?.hasPending && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock className="w-5 h-5" />
            <span className="font-medium">You have a pending help request</span>
          </div>
          <p className="text-sm text-amber-600 mt-1">
            Your teacher will respond soon. You can only have one active request at a time.
          </p>
        </div>
      )}

      {!data?.requests.length ? (
        <EmptyState
          icon={<HelpCircle className="w-8 h-8" />}
          title="No help requests"
          description="When you're stuck on an exercise, you can ask for help from your teacher."
        />
      ) : (
        <div className="space-y-3">
          {data.requests.map((request: StudentHelpRequest) => (
            <HelpRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}

function HelpRequestCard({ request }: { request: StudentHelpRequest }) {
  const status = statusConfig[request.status]
  const StatusIcon = status.icon

  return (
    <Card padding="md" className={cn(request.response && 'border-l-4 border-l-emerald-500')}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800">{request.lessonTitle}</h3>
          {request.exerciseTitle && (
            <p className="text-sm text-slate-500">{request.exerciseTitle}</p>
          )}
        </div>
        <Badge className={cn(status.bgColor, status.color)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {status.label}
        </Badge>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl mb-3">
        <p className="text-sm text-slate-700">{request.message}</p>
      </div>

      {request.codeSnapshot && (
        <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-sm font-mono overflow-x-auto mb-3 max-h-32">
          {request.codeSnapshot}
        </pre>
      )}

      {request.response && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Response from {request.teacherName || 'Teacher'}
            </span>
          </div>
          <div
            className="text-sm text-slate-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatResponse(request.response) }}
          />
        </div>
      )}

      <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
        <Clock className="w-3 h-3" />
        <span>
          Asked {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </span>
        {request.respondedAt && (
          <>
            <span className="mx-1">-</span>
            <span>
              Answered {formatDistanceToNow(new Date(request.respondedAt), { addSuffix: true })}
            </span>
          </>
        )}
      </div>
    </Card>
  )
}

function formatResponse(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="bg-emerald-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-2 rounded-lg overflow-x-auto my-2 text-xs"><code>$2</code></pre>')
    .replace(/\n/g, '<br>')
}
