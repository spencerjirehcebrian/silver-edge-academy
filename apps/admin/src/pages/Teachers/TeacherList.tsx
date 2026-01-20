import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useTeachers, useDeleteUser } from '@/hooks/queries/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlState } from '@/hooks/useUrlState'
import { useSelection } from '@/hooks/useSelection'
import { useSortHelper } from '@/hooks/useSortHelper'
import { useBulkDelete } from '@/hooks/useBulkDelete'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { UserListPage } from '../Users/UserListPage'
import { teacherColumns } from '../Users/columns/teacherColumns'
import type { Teacher } from '@/services/api/users'

export default function TeacherList() {
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

  const query = useTeachers({
    search: debouncedSearch,
    page: urlState.page,
    limit: pageSize,
    sortBy: urlState.sortBy || undefined,
    sortOrder: urlState.sortOrder as 'asc' | 'desc',
    status: (urlState.status as 'active' | 'inactive') || undefined,
  })

  const selection = useSelection<Teacher>(query.data?.data || [])

  // Clear selection when filters change
  useEffect(() => {
    selection.clearSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, urlState.status])

  // Use bulk delete hook
  const { handleBulkDelete, isDeleting } = useBulkDelete<Teacher>({
    selection,
    confirm,
    deleteMutation: deleteUser,
    itemName: 'teacher',
  })

  return (
    <UserListPage
      data={query.data?.data || []}
      isLoading={query.isLoading}
      totalPages={query.data?.meta?.totalPages || 1}
      totalItems={query.data?.meta?.total || 0}
      columns={teacherColumns}
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
      onRowClick={(t) => navigate(`/admin/teachers/${t.id}`)}
      createPath="/admin/teachers/create"
      searchPlaceholder="Search teachers..."
      addButtonLabel="Add Teacher"
      itemName="teachers"
      emptyMessage="No teachers found"
      emptyIcon={Users}
      emptyDescription="Add teachers to manage classes and create courses for students."
      dialogProps={dialogProps}
    />
  )
}
