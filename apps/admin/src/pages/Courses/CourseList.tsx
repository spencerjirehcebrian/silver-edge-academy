import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FileCode, LayoutGrid, List, BookOpen } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
import { Checkbox } from '@/components/ui/Checkbox'
import { useCourses, useDeleteCourse } from '@/hooks/queries/useCourses'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlState } from '@/hooks/useUrlState'
import { useSelection } from '@/hooks/useSelection'
import { useSortHelper } from '@/hooks/useSortHelper'
import { useBulkDelete } from '@/hooks/useBulkDelete'
import { formatDate } from '@/utils/formatters'
import { LANGUAGE_OPTIONS, COURSE_STATUS_OPTIONS } from '@/constants/filterOptions'
import type { Course } from '@/services/api/courses'

type ViewMode = 'table' | 'grid'

const VIEW_STORAGE_KEY = 'admin:courses:viewMode'

export default function CourseList() {
  const navigate = useNavigate()
  const [urlState, setUrlState] = useUrlState({
    search: '',
    language: '',
    status: '',
    page: 1,
    sortBy: 'title',
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
  const deleteCourse = useDeleteCourse()
  const { confirm, dialogProps } = useConfirmDialog()

  // Use the shared sorting helper hook
  const { sorted, onSort } = useSortHelper(urlState, setUrlState)

  const { data, isLoading } = useCourses({
    page: urlState.page,
    limit: pageSize,
    search: debouncedSearch,
    language: (urlState.language as 'javascript' | 'python') || undefined,
    status: (urlState.status as 'draft' | 'published') || undefined,
    sortBy: urlState.sortBy || undefined,
    sortOrder: urlState.sortOrder as 'asc' | 'desc',
  })

  const selection = useSelection<Course>([])

  // Clear selection when filters change
  useEffect(() => {
    selection.clearSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, urlState.language, urlState.status])

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, viewMode)
  }, [viewMode])

  // Use the shared bulk delete hook with pre-delete validation for assigned courses
  const { handleBulkDelete, isDeleting } = useBulkDelete<Course>({
    selection,
    confirm,
    deleteMutation: deleteCourse,
    itemName: 'course',
    getSelectedItems: () => data?.data.filter((c) => selection.isSelected(c.id)) || [],
    preDeleteCheck: (items) => {
      const assignedCourses = items.filter((c) => c.classCount > 0)
      if (assignedCourses.length > 0) {
        return {
          canDelete: false,
          message: `${assignedCourses.length} course${assignedCourses.length > 1 ? 's are' : ' is'} assigned to classes and cannot be deleted. Remove them from all classes first.`,
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
              placeholder="Search courses..."
              className="w-72"
            />
            <Select
              value={urlState.language}
              onChange={(e) => setUrlState({ language: e.target.value, page: 1 })}
              className="w-40"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </Select>
            <Select
              value={urlState.status}
              onChange={(e) => setUrlState({ status: e.target.value, page: 1 })}
              className="w-36"
            >
              {COURSE_STATUS_OPTIONS.map((opt) => (
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
            <Link to="/admin/courses/create">
              <Button>
                <Plus className="w-4 h-4" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          viewMode === 'table' ? <TableSkeleton /> : <GridSkeleton />
        ) : viewMode === 'table' ? (
          <CourseTable
            data={data?.data || []}
            sorted={sorted}
            onSort={onSort}
            selection={selection}
            onRowClick={(course) => navigate(`/admin/courses/${course.id}`)}
          />
        ) : (
          <CourseGrid
            data={data?.data || []}
            selection={selection}
            onCardClick={(course) => navigate(`/admin/courses/${course.id}`)}
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
            itemName="courses"
          />
        )}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selection.selectedCount}
        onDelete={handleBulkDelete}
        onClearSelection={selection.clearSelection}
        isDeleting={isDeleting}
        itemName="courses"
      />
    </>
  )
}

interface CourseTableProps {
  data: Course[]
  sorted: (column: string) => 'asc' | 'desc' | false
  onSort: (column: string) => () => void
  selection: ReturnType<typeof useSelection<Course>>
  onRowClick: (course: Course) => void
}

function CourseTable({ data, sorted, onSort, selection, onRowClick }: CourseTableProps) {
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
            <TableHead sortable sorted={sorted('title')} onSort={onSort('title')}>
              Course Name
            </TableHead>
            <TableHead sortable sorted={sorted('createdByName')} onSort={onSort('createdByName')}>
              Created By
            </TableHead>
            <TableHead sortable sorted={sorted('sectionCount')} onSort={onSort('sectionCount')}>
              Sections
            </TableHead>
            <TableHead sortable sorted={sorted('lessonCount')} onSort={onSort('lessonCount')}>
              Lessons
            </TableHead>
            <TableHead sortable sorted={sorted('status')} onSort={onSort('status')}>
              Status
            </TableHead>
            <TableHead sortable sorted={sorted('classCount')} onSort={onSort('classCount')}>
              Assigned Classes
            </TableHead>
            <TableHead sortable sorted={sorted('updatedAt')} onSort={onSort('updatedAt')}>
              Last Updated
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data.length ? (
            <TableEmpty
              colSpan={8}
              icon={BookOpen}
              message="No courses found"
              description="Get started by creating your first course with lessons and exercises."
              actionLabel="Create Course"
              actionPath="/admin/courses/create"
            />
          ) : (
            data.map((course) => (
              <TableRow
                key={course.id}
                clickable
                selected={selection.isSelected(course.id)}
                onClick={() => onRowClick(course)}
              >
                <SelectableCell
                  isSelected={selection.isSelected(course.id)}
                  onSelect={() => selection.toggle(course.id)}
                />
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        course.language === 'javascript'
                          ? 'bg-amber-100'
                          : 'bg-sky-100'
                      }`}
                    >
                      <FileCode
                        className={`w-4 h-4 ${
                          course.language === 'javascript'
                            ? 'text-amber-600'
                            : 'text-sky-600'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="font-medium text-slate-800 block">
                        {course.title}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          course.language === 'javascript'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-sky-50 text-sky-700'
                        }`}
                      >
                        {course.language === 'javascript' ? 'JavaScript' : 'Python'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar name={course.createdByName} size="sm" />
                    <span className="text-sm text-slate-700">{course.createdByName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-700 font-medium">
                    {course.sectionCount}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-700 font-medium">
                    {course.lessonCount}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      course.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        course.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell>
                  {course.assignedClasses && course.assignedClasses.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {course.assignedClasses.slice(0, 3).map((cls) => (
                        <span
                          key={cls.id}
                          className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs"
                        >
                          {cls.name}
                        </span>
                      ))}
                      {course.assignedClasses.length > 3 && (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                          +{course.assignedClasses.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Not assigned</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDate(course.updatedAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

interface CourseGridProps {
  data: Course[]
  selection: ReturnType<typeof useSelection<Course>>
  onCardClick: (course: Course) => void
}

function CourseGrid({ data, selection, onCardClick }: CourseGridProps) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">No courses found</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm mb-4">
          Get started by creating your first course with lessons and exercises.
        </p>
        <Link to="/admin/courses/create">
          <Button>Create Course</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((course) => (
        <div
          key={course.id}
          className={`relative border rounded-xl p-4 transition-colors cursor-pointer ${
            selection.isSelected(course.id)
              ? 'border-accent-500 bg-accent-50/50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => onCardClick(course)}
        >
          {/* Checkbox overlay in top-left corner */}
          <div
            className="absolute top-3 left-3 z-10"
            onClick={(e) => {
              e.stopPropagation()
              selection.toggle(course.id)
            }}
          >
            <Checkbox
              checked={selection.isSelected(course.id)}
              onChange={() => selection.toggle(course.id)}
            />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ml-6 ${
                course.language === 'javascript' ? 'bg-amber-100' : 'bg-sky-100'
              }`}
            >
              <FileCode
                className={`w-5 h-5 ${
                  course.language === 'javascript' ? 'text-amber-600' : 'text-sky-600'
                }`}
              />
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                course.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  course.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {course.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-800 mb-1">{course.title}</h3>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              course.language === 'javascript'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-sky-50 text-sky-700'
            }`}
          >
            {course.language === 'javascript' ? 'JavaScript' : 'Python'}
          </span>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
            <span>{course.sectionCount} sections</span>
            <span>{course.lessonCount} lessons</span>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <Avatar name={course.createdByName} size="sm" />
            <span className="text-xs text-slate-600">{course.createdByName}</span>
          </div>

          {/* Classes */}
          {course.assignedClasses && course.assignedClasses.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {course.assignedClasses.slice(0, 2).map((cls) => (
                <span
                  key={cls.id}
                  className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs"
                >
                  {cls.name}
                </span>
              ))}
              {course.assignedClasses.length > 2 && (
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                  +{course.assignedClasses.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
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
            <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
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
          <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse mb-3" />
          <div className="flex gap-4">
            <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
