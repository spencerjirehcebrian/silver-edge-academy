import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/formatters'
import type { ColumnDef } from '@/components/ui/DataTable'
import type { Parent } from '@/services/api/users'

export const parentColumns: ColumnDef<Parent>[] = [
  {
    key: 'displayName',
    header: 'Name',
    sortable: true,
    render: (p) => (
      <div className="flex items-center gap-3">
        <Avatar name={p.displayName} />
        <span className="font-medium text-slate-800">{p.displayName}</span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    className: 'text-sm text-slate-600',
    render: (p) => p.email,
  },
  {
    key: 'childIds',
    header: 'Children',
    sortable: true,
    render: (p) => {
      const childNames = p.childNames || []
      return (
        <div className="flex flex-wrap gap-1">
          {childNames.slice(0, 2).map((name: string, i: number) => (
            <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
              {name}
            </span>
          ))}
          {childNames.length > 2 && (
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
              +{childNames.length - 2}
            </span>
          )}
          {childNames.length === 0 && (
            <span className="text-slate-400 text-xs">No children</span>
          )}
        </div>
      )
    },
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (p) => <StatusBadge status={p.status} />,
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    className: 'text-sm text-slate-500',
    render: (p) => formatDate(p.createdAt),
  },
]
