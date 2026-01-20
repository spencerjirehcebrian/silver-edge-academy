import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { ConfirmDialog, type ConfirmDialogProps } from '@/components/ui/ConfirmDialog'
import type { UseSelectionReturn } from '@/hooks/useSelection'
import type { BaseUser } from '@/services/api/users'

const STATUS_OPTIONS = [
  { id: '', name: 'All Status' },
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
]

export interface FilterDef {
  key: string
  value: string
  onChange: (value: string) => void
  options: { id: string; name: string }[]
  className?: string
}

interface UserListPageProps<T extends BaseUser> {
  // Data
  data: T[]
  isLoading: boolean
  totalPages: number
  totalItems: number
  // Columns
  columns: ColumnDef<T>[]
  // State
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  page: number
  onPageChange: (page: number) => void
  pageSize: number
  // Sorting
  sorted: (column: string) => 'asc' | 'desc' | false
  onSort: (column: string) => () => void
  // Selection & bulk actions
  selection: UseSelectionReturn
  onBulkDelete: () => Promise<void>
  isDeleting: boolean
  // Navigation
  onRowClick: (item: T) => void
  createPath: string
  // Labels
  searchPlaceholder: string
  addButtonLabel: string
  itemName: string
  emptyMessage: string
  // Enhanced empty state (optional)
  emptyIcon?: LucideIcon
  emptyDescription?: string
  // Extra filters
  extraFilters?: FilterDef[]
  // Dialog
  dialogProps: ConfirmDialogProps | null
}

export function UserListPage<T extends BaseUser>({
  data,
  isLoading,
  totalPages,
  totalItems,
  columns,
  search,
  onSearchChange,
  status,
  onStatusChange,
  page,
  onPageChange,
  pageSize,
  sorted,
  onSort,
  selection,
  onBulkDelete,
  isDeleting,
  onRowClick,
  createPath,
  searchPlaceholder,
  addButtonLabel,
  itemName,
  emptyMessage,
  emptyIcon,
  emptyDescription,
  extraFilters = [],
  dialogProps,
}: UserListPageProps<T>) {
  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value)
                onPageChange(1)
              }}
              placeholder={searchPlaceholder}
              className="w-72"
            />
            <Select
              value={status}
              onChange={(e) => {
                onStatusChange(e.target.value)
                onPageChange(1)
              }}
              className="w-36"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </Select>
            {extraFilters.map((filter) => (
              <Select
                key={filter.key}
                value={filter.value}
                onChange={(e) => {
                  filter.onChange(e.target.value)
                  onPageChange(1)
                }}
                className={filter.className || 'w-40'}
              >
                {filter.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </Select>
            ))}
          </div>
          <Link to={createPath}>
            <Button>
              <Plus className="w-4 h-4" />
              {addButtonLabel}
            </Button>
          </Link>
        </div>

        <DataTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          emptyState={emptyIcon ? {
            message: emptyMessage,
            icon: emptyIcon,
            description: emptyDescription,
            actionLabel: addButtonLabel,
            actionPath: createPath,
          } : undefined}
          pagination={{
            currentPage: page,
            totalPages,
            totalItems,
            pageSize,
            onPageChange,
            itemName,
          }}
          sorting={{ sorted, onSort }}
          selection={selection}
          onRowClick={onRowClick}
        />
      </div>

      <BulkActionBar
        selectedCount={selection.selectedCount}
        onDelete={onBulkDelete}
        onClearSelection={selection.clearSelection}
        isDeleting={isDeleting}
        itemName={itemName}
      />
    </>
  )
}
