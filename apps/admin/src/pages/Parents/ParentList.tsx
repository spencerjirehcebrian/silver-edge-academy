import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useParents, useDeleteUser } from '@/hooks/queries/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlState } from '@/hooks/useUrlState'
import { useSelection } from '@/hooks/useSelection'
import { useSortHelper } from '@/hooks/useSortHelper'
import { useBulkDelete } from '@/hooks/useBulkDelete'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { UserListPage } from '../Users/UserListPage'
import { parentColumns } from '../Users/columns/parentColumns'
import type { Parent } from '@/services/api/users'

export default function ParentList() {
  const navigate = useNavigate()
  const [urlState, setUrlState] = useUrlState({
    search: '',
    page: 1,
    status: '',
    sortBy: 'displayName',
    sortOrder: 'asc' as 'asc' | 'desc',
  })
  const pageSize = 10

  const debouncedSearch = useDebounce(urlState.search, 300)
  const deleteUser = useDeleteUser()
  const { confirm, dialogProps } = useConfirmDialog()

  // Use sorting helper hook
  const { sorted, onSort } = useSortHelper(urlState, setUrlState)

  const query = useParents({
    search: debouncedSearch,
    page: urlState.page,
    limit: pageSize,
    sortBy: urlState.sortBy || undefined,
    sortOrder: urlState.sortOrder as 'asc' | 'desc',
    status: (urlState.status as 'active' | 'inactive') || undefined,
  })

  const selection = useSelection<Parent>(query.data?.data || [])

  // Clear selection when filters change
  useEffect(() => {
    selection.clearSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, urlState.status])

  // Use bulk delete hook
  const { handleBulkDelete, isDeleting } = useBulkDelete<Parent>({
    selection,
    confirm,
    deleteMutation: deleteUser,
    itemName: 'parent',
  })

  return (
    <UserListPage
      data={query.data?.data || []}
      isLoading={query.isLoading}
      totalPages={query.data?.meta?.totalPages || 1}
      totalItems={query.data?.meta?.total || 0}
      columns={parentColumns}
      search={urlState.search}
      onSearchChange={(v) => setUrlState({ search: v, page: 1 })}
      status={urlState.status}
      onStatusChange={(v) => setUrlState({ status: v, page: 1 })}
      page={urlState.page}
      onPageChange={(p) => setUrlState({ page: p })}
      pageSize={pageSize}
      sorted={sorted}
      onSort={onSort}
      selection={selection}
      onBulkDelete={handleBulkDelete}
      isDeleting={isDeleting}
      onRowClick={(p) => navigate(`/admin/parents/${p.id}`)}
      createPath="/admin/parents/create"
      searchPlaceholder="Search parents..."
      addButtonLabel="Add Parent"
      itemName="parents"
      emptyMessage="No parents found"
      emptyIcon={Heart}
      emptyDescription="Add parents to connect them with their children and monitor their learning progress."
      dialogProps={dialogProps}
    />
  )
}
