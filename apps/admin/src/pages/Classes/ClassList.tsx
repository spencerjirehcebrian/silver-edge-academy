import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, LayoutGrid, List } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  SelectAllHead,
  SelectableCell,
} from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Table/Pagination'
import { Avatar } from '@/components/ui/Avatar'
import { useClasses, useDeleteClass } from '@/hooks/queries/useClasses'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlState } from '@/hooks/useUrlState'
import { useSelection } from '@/hooks/useSelection'
import { useSortHelper } from '@/hooks/useSortHelper'
import { useBulkDelete } from '@/hooks/useBulkDelete'
import { CLASS_STATUS_OPTIONS } from '@/constants/filterOptions'
import type { Class } from '@/services/api/classes'

type ViewMode = 'table' | 'grid'

const VIEW_STORAGE_KEY = 'admin:classes:viewMode'

const CLASS_COLORS: Record<string, { bg: string; text: string }> = {
  '#6366f1': { bg: 'bg-accent-100', text: 'text-accent-600' },
  '#10b981': { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  '#f59e0b': { bg: 'bg-amber-100', text: 'text-amber-600' },
  '#ec4899': { bg: 'bg-pink-100', text: 'text-pink-600' },
  '#8b5cf6': { bg: 'bg-violet-100', text: 'text-violet-600' },
  '#0ea5e9': { bg: 'bg-sky-100', text: 'text-sky-600' },
  '#64748b': { bg: 'bg-slate-100', text: 'text-slate-600' },
}


function getColorClasses(color: string) {
  return CLASS_COLORS[color] || { bg: 'bg-slate-100', text: 'text-slate-600' }
}

function getClassInitials(name: string) {
  // Remove common prefixes like "Class", "Grade", "Section"
  const cleanName = name.replace(/^(Class|Grade|Section)\s+/i, '')

  // Split by spaces and get first letter of each word
  const words = cleanName.trim().split(/\s+/)

  // Take first letter of up to 3 words, uppercase
  const initials = words
    .slice(0, 3)
    .map(word => word.charAt(0).toUpperCase())
    .join('')

  // If we got no initials (empty name), return first 2 chars of original name
  return initials || name.slice(0, 2).toUpperCase()
}

export default function ClassList() {
  const navigate = useNavigate()
  const [urlState, setUrlState] = useUrlState({
    search: '',
    page: 1,
    status: '',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc',
  })
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode) || 'table'
    }
    return 'table'
  })
  const pageSize = viewMode === 'grid' ? 12 : 10

  const debouncedSearch = useDebounce(urlState.search, 300)
  const deleteClass = useDeleteClass()
  const { confirm, dialogProps } = useConfirmDialog()

  // Use sorting helper hook
  const { sorted, onSort } = useSortHelper(urlState, setUrlState)

  const { data, isLoading } = useClasses({
    page: urlState.page,
    limit: pageSize,
    search: debouncedSearch,
    status: (urlState.status as 'active' | 'archived' | 'draft') || undefined,
    sortBy: urlState.sortBy || undefined,
    sortOrder: urlState.sortOrder as 'asc' | 'desc',
  })

  const selection = useSelection<Class>(data?.data || [])

  // Clear selection when filters change
  useEffect(() => {
    selection.clearSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, urlState.status])

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, viewMode)
  }, [viewMode])

  // Use bulk delete hook with pre-delete validation for classes with students
  const { handleBulkDelete, isDeleting } = useBulkDelete<Class>({
    selection,
    confirm,
    deleteMutation: deleteClass,
    itemName: 'class',
    itemNamePlural: 'classes',
    getSelectedItems: () => data?.data.filter((c) => selection.isSelected(c.id)) || [],
    preDeleteCheck: (items) => {
      const classesWithStudents = items.filter((c) => c.studentCount > 0)
      if (classesWithStudents.length > 0) {
        return {
          canDelete: false,
          message: `${classesWithStudents.length} class${classesWithStudents.length > 1 ? 'es have' : ' has'} students enrolled and cannot be deleted. Remove all students first.`,
        }
      }
      return { canDelete: true }
    },
  })

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <SearchInput
              value={urlState.search}
              onChange={(e) => setUrlState({ search: e.target.value, page: 1 })}
              placeholder="Search classes..."
              className="w-72"
            />
            <Select
              value={urlState.status}
              onChange={(e) => setUrlState({ status: e.target.value, page: 1 })}
              className="w-36"
            >
              {CLASS_STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-accent-100 text-accent-600'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-accent-100 text-accent-600'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <Link to="/admin/classes/create">
              <Button>
                <Plus className="w-4 h-4" />
                Create Class
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          viewMode === 'table' ? <TableSkeleton /> : <GridSkeleton />
        ) : viewMode === 'table' ? (
          <ClassTable
            data={data?.data || []}
            sorted={sorted}
            onSort={onSort}
            selection={selection}
            onRowClick={(cls) => navigate(`/admin/classes/${cls.id}`)}
          />
        ) : (
          <ClassGrid
            data={data?.data || []}
            selection={selection}
            onCardClick={(cls) => navigate(`/admin/classes/${cls.id}`)}
          />
        )}

        {/* Pagination */}
        {data && data.meta.total > 0 && (
          <Pagination
            currentPage={urlState.page}
            totalPages={data.meta.totalPages}
            totalItems={data.meta.total}
            pageSize={pageSize}
            onPageChange={(p) => setUrlState({ page: p })}
            itemName="classes"
          />
        )}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selection.selectedCount}
        onDelete={handleBulkDelete}
        onClearSelection={selection.clearSelection}
        isDeleting={isDeleting}
        itemName="classes"
      />
    </>
  )
}

interface ClassTableProps {
  data: Class[]
  sorted: (column: string) => 'asc' | 'desc' | false
  onSort: (column: string) => () => void
  selection: ReturnType<typeof useSelection<Class>>
  onRowClick: (cls: Class) => void
}

function ClassTable({ data, sorted, onSort, selection, onRowClick }: ClassTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SelectAllHead
              isAllSelected={selection.isAllSelected}
              isIndeterminate={selection.isIndeterminate}
              onSelectAll={selection.toggleAll}
            />
            <TableHead sortable sorted={sorted('name')} onSort={onSort('name')}>
              Class Name
            </TableHead>
            <TableHead sortable sorted={sorted('teacherName')} onSort={onSort('teacherName')}>
              Teacher
            </TableHead>
            <TableHead sortable sorted={sorted('studentCount')} onSort={onSort('studentCount')}>
              Students
            </TableHead>
            <TableHead>Courses</TableHead>
            <TableHead sortable sorted={sorted('avgProgress')} onSort={onSort('avgProgress')}>
              Completion
            </TableHead>
            <TableHead sortable sorted={sorted('lastActivity')} onSort={onSort('lastActivity')}>
              Last Activity
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data.length ? (
            <TableEmpty
              colSpan={7}
              icon={Users}
              message="No classes found"
              description="Create a class to organize students and assign teachers and courses."
              actionLabel="Create Class"
              actionPath="/admin/classes/create"
            />
          ) : (
            data.map((cls) => {
              const colorClasses = getColorClasses(cls.color || '#6366f1')
              return (
                <TableRow
                  key={cls.id}
                  clickable
                  selected={selection.isSelected(cls.id)}
                  onClick={() => onRowClick(cls)}
                >
                  <SelectableCell
                    isSelected={selection.isSelected(cls.id)}
                    onSelect={() => selection.toggle(cls.id)}
                  />
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses.bg}`}
                      >
                        <span className={`font-bold text-sm ${colorClasses.text}`}>
                          {getClassInitials(cls.name)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-800 block">{cls.name}</span>
                        {cls.status !== 'active' && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              cls.status === 'draft'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {cls.status === 'draft' ? 'Draft' : 'Archived'}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {cls.teacherName ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={cls.teacherName} size="sm" />
                        <span className="text-sm text-slate-700">{cls.teacherName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No teacher assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700 font-medium">
                      {cls.studentCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cls.courses && cls.courses.length > 0 ? (
                        cls.courses.slice(0, 2).map((course) => (
                          <span
                            key={course.id}
                            className={`px-2 py-0.5 rounded text-xs ${
                              course.category === 'JavaScript'
                                ? 'bg-amber-50 text-amber-700'
                                : course.category === 'Python'
                                  ? 'bg-sky-50 text-sky-700'
                                  : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            {course.name.length > 12
                              ? course.name.slice(0, 12) + '...'
                              : course.name}
                          </span>
                        ))
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                          No courses
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (cls.avgProgress || 0) >= 80
                              ? 'bg-emerald-500'
                              : (cls.avgProgress || 0) >= 50
                                ? 'bg-amber-500'
                                : 'bg-slate-300'
                          }`}
                          style={{ width: `${cls.avgProgress || 0}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          (cls.avgProgress || 0) >= 80
                            ? 'text-emerald-600'
                            : (cls.avgProgress || 0) > 0
                              ? 'text-slate-700'
                              : 'text-slate-400'
                        }`}
                      >
                        {cls.avgProgress !== undefined && cls.avgProgress !== null ? `${cls.avgProgress}%` : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {cls.lastActivity}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

interface ClassGridProps {
  data: Class[]
  selection: ReturnType<typeof useSelection<Class>>
  onCardClick: (cls: Class) => void
}

function ClassGrid({ data, selection, onCardClick }: ClassGridProps) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">No classes found</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm mb-4">
          Create a class to organize students and assign teachers and courses.
        </p>
        <Link to="/admin/classes/create">
          <Button>Create Class</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((cls) => {
        const colorClasses = getColorClasses(cls.color || '#6366f1')
        return (
          <div
            key={cls.id}
            className={`relative border rounded-xl p-4 transition-colors cursor-pointer ${
              selection.isSelected(cls.id)
                ? 'border-accent-500 bg-accent-50/50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => onCardClick(cls)}
          >
            {/* Checkbox overlay in top-left corner */}
            <div
              className="absolute top-3 left-3 z-10"
              onClick={(e) => {
                e.stopPropagation()
                selection.toggle(cls.id)
              }}
            >
              <Checkbox
                checked={selection.isSelected(cls.id)}
                onChange={() => selection.toggle(cls.id)}
              />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ml-6 ${colorClasses.bg}`}
              >
                <span className={`font-bold text-sm ${colorClasses.text}`}>
                  {getClassInitials(cls.name)}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  cls.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : cls.status === 'draft'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-amber-50 text-amber-600'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    cls.status === 'active'
                      ? 'bg-emerald-500'
                      : cls.status === 'draft'
                        ? 'bg-slate-400'
                        : 'bg-amber-500'
                  }`}
                />
                {cls.status === 'active' ? 'Active' : cls.status === 'draft' ? 'Draft' : 'Archived'}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-slate-800 mb-1">{cls.name}</h3>
            <p className="text-sm text-slate-500 mb-3">{cls.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
              <span>{cls.studentCount} students</span>
              <span>{cls.courseCount} courses</span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    (cls.avgProgress || 0) >= 80
                      ? 'bg-emerald-500'
                      : (cls.avgProgress || 0) >= 50
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                  }`}
                  style={{ width: `${cls.avgProgress || 0}%` }}
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  (cls.avgProgress || 0) >= 80
                    ? 'text-emerald-600'
                    : (cls.avgProgress || 0) > 0
                      ? 'text-slate-700'
                      : 'text-slate-400'
                }`}
              >
                {cls.avgProgress !== undefined && cls.avgProgress !== null ? `${cls.avgProgress}%` : 'N/A'}
              </span>
            </div>

            {/* Teacher */}
            {cls.teacherName && (
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Avatar name={cls.teacherName} size="sm" />
                <span className="text-xs text-slate-600">{cls.teacherName}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-100">
          <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-48 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4">
          <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse mb-3" />
          <div className="h-5 bg-slate-200 rounded w-3/4 animate-pulse mb-2" />
          <div className="h-4 bg-slate-200 rounded w-full animate-pulse mb-3" />
          <div className="flex gap-4">
            <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
