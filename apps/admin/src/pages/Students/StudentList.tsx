import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useStudents, useDeleteUser } from '@/hooks/queries/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlState } from '@/hooks/useUrlState'
import { useSelection } from '@/hooks/useSelection'
import { useSortHelper } from '@/hooks/useSortHelper'
import { useBulkDelete } from '@/hooks/useBulkDelete'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { UserListPage } from '../Users/UserListPage'
import { studentColumns } from '../Users/columns/studentColumns'
import { CLASS_OPTIONS } from '@/constants/filterOptions'
import type { Student } from '@/services/api/users'

export default function StudentList() {
  const navigate = useNavigate()
  const [urlState, setUrlState] = useUrlState({
    search: '',
    page: 1,
    status: '',
    className: '',
    sortBy: 'displayName',
    sortOrder: 'asc' as 'asc' | 'desc',
  })
  const pageSize = 10

  const debouncedSearch = useDebounce(urlState.search, 300)
  const deleteUser = useDeleteUser()
  const { confirm, dialogProps } = useConfirmDialog()

  // Use sorting helper hook
  const { sorted, onSort } = useSortHelper(urlState, setUrlState)

  const query = useStudents({
    search: debouncedSearch,
    page: urlState.page,
    limit: pageSize,
    sortBy: urlState.sortBy || undefined,
    sortOrder: urlState.sortOrder as 'asc' | 'desc',
    status: (urlState.status as 'active' | 'inactive') || undefined,
  })

  const filteredData = urlState.className
    ? (query.data?.data || []).filter((s) => s.className === urlState.className)
    : query.data?.data || []

  const selection = useSelection<Student>(filteredData)

  // Clear selection when filters change
  useEffect(() => {
    selection.clearSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, urlState.status, urlState.className])

  // Use bulk delete hook
  const { handleBulkDelete, isDeleting } = useBulkDelete<Student>({
    selection,
    confirm,
    deleteMutation: deleteUser,
    itemName: 'student',
  })

  return (
    <UserListPage
      data={filteredData}
      isLoading={query.isLoading}
      totalPages={query.data?.meta?.totalPages || 1}
      totalItems={query.data?.meta?.total || 0}
      columns={studentColumns}
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
      onRowClick={(s) => navigate(`/admin/students/${s.id}`)}
      createPath="/admin/students/create"
      searchPlaceholder="Search students..."
      addButtonLabel="Add Student"
      itemName="students"
      emptyMessage="No students found"
      emptyIcon={GraduationCap}
      emptyDescription="Start by adding students to your school. They can be assigned to classes and track their learning progress."
      extraFilters={[
        {
          key: 'className',
          value: urlState.className,
          onChange: (v) => setUrlState({ className: v, page: 1 }),
          options: [...CLASS_OPTIONS],
          className: 'w-40',
        },
      ]}
      dialogProps={dialogProps}
    />
  )
}
