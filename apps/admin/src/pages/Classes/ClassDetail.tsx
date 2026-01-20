import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Trophy,
  ChevronRight,
  FileCode,
  Search,
  X,
  GraduationCap,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DetailActionBar } from '@/components/ui/DetailActionBar'
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
} from '@/components/ui/Table/Table'
import { Pagination } from '@/components/ui/Table/Pagination'
import {
  useClass,
  useClassStudents,
  useDeleteClass,
  useRemoveStudentFromClass,
} from '@/hooks/queries/useClasses'
import { useStudents } from '@/hooks/queries/useUsers'
import { useToast } from '@/contexts/ToastContext'
import { useDebounce } from '@/hooks/useDebounce'
import { useSelection } from '@/hooks/useSelection'
import { formatDate } from '@/utils/formatters'
import type { ClassStudent } from '@/services/api/classes'
import { getAttendance, markAttendance, type AttendanceRecord } from '@/services/api/attendance'

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

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: cls, isLoading } = useClass(id || '')
  const deleteClass = useDeleteClass()
  const removeStudentFromClass = useRemoveStudentFromClass()
  const { confirm, dialogProps } = useConfirmDialog()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)

  // Attendance tab state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, string>>(new Map())
  const [isSavingAttendance, setIsSavingAttendance] = useState(false)

  // Roster tab state
  const [rosterState, setRosterState] = useState({
    search: '',
    page: 1,
    sortBy: 'displayName',
    sortOrder: 'asc' as 'asc' | 'desc',
  })
  const pageSize = 10
  const debouncedSearch = useDebounce(rosterState.search, 300)

  // Fetch students with pagination and sorting
  const { data: studentsData, isLoading: studentsLoading } = useClassStudents(id || '', {
    page: rosterState.page,
    limit: pageSize,
    search: debouncedSearch,
    sortBy: rosterState.sortBy,
    sortOrder: rosterState.sortOrder,
  })

  const students = studentsData?.data || []
  const selection = useSelection<ClassStudent>(students)

  // Fetch attendance for selected date
  const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', id, selectedDate],
    queryFn: async () => {
      if (!id) return []
      return getAttendance(id, {
        startDate: selectedDate,
        endDate: selectedDate,
      })
    },
    enabled: !!id,
  })

  // Initialize attendance records from fetched data
  useEffect(() => {
    if (attendanceData) {
      const records = new Map(
        attendanceData.map((r: AttendanceRecord) => [r.studentId, r.status])
      )
      setAttendanceRecords(records)
    } else {
      // If no data, initialize with 'present' as default
      setAttendanceRecords(new Map())
    }
  }, [attendanceData])

  // Sort helper functions
  const sorted = useCallback(
    (column: string): false | 'asc' | 'desc' => {
      if (rosterState.sortBy !== column) return false
      return rosterState.sortOrder
    },
    [rosterState.sortBy, rosterState.sortOrder]
  )

  const onSort = useCallback(
    (column: string) => () => {
      if (rosterState.sortBy === column) {
        setRosterState((prev) => ({
          ...prev,
          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
        }))
      } else {
        setRosterState((prev) => ({ ...prev, sortBy: column, sortOrder: 'asc' }))
      }
    },
    [rosterState.sortBy]
  )

  // Clear selection when filters change
  useEffect(() => {
    selection.clearSelection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, rosterState.sortBy, rosterState.sortOrder])

  // Bulk remove handler
  const handleBulkRemove = async () => {
    const count = selection.selectedCount
    const label = count === 1 ? 'student' : 'students'

    const confirmed = await confirm({
      title: `Remove ${count} ${label}`,
      message: `Are you sure you want to remove ${count} ${label} from this class?`,
      confirmLabel: 'Remove',
      variant: 'danger',
    })

    if (confirmed && id) {
      for (const studentId of selection.selectedIds) {
        await removeStudentFromClass.mutateAsync({ classId: id, studentId })
      }
      selection.clearSelection()
      addToast({ type: 'success', message: `${count} ${label} removed from class.` })
    }
  }

  const handleSaveAttendance = async () => {
    if (!id) return

    setIsSavingAttendance(true)
    try {
      const records = Array.from(attendanceRecords.entries()).map(([studentId, status]) => ({
        studentId,
        status: status as 'present' | 'absent' | 'late' | 'excused',
      }))

      await markAttendance(id, {
        records,
        date: selectedDate,
      })

      queryClient.invalidateQueries({ queryKey: ['class', id] })
      queryClient.invalidateQueries({ queryKey: ['attendance', id] })
      addToast({ type: 'success', message: 'Attendance has been saved.' })
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to save attendance. Please try again.' })
    } finally {
      setIsSavingAttendance(false)
    }
  }

  const handleAddCourse = () => {
    navigate(`/admin/classes/${id}/edit`)
  }

  const handleDelete = async () => {
    if (!cls) return

    const confirmed = await confirm({
      title: 'Delete Class',
      message: `Are you sure you want to delete ${cls.name}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteClass.mutateAsync(cls.id)
        navigate('/admin/classes')
      } catch {
        // Error handled by mutation
      }
    }
  }

  if (isLoading) {
    return <ClassDetailSkeleton />
  }

  if (!cls) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Class not found</p>
        <Link to="/admin/classes" className="text-accent-600 hover:underline mt-2 inline-block">
          Back to Class List
        </Link>
      </div>
    )
  }

  const colorClasses = getColorClasses(cls.color || '#6366f1')
  const courses = cls.courses || []
  // Students for progress/attendance tabs (not paginated)
  const allStudents = cls.students || []

  // Defensive fallbacks for missing backend fields
  const attendanceRate = cls.attendanceRate ?? 0
  const avgProgress = cls.avgProgress ?? 0
  const lastActivity = cls.lastActivity ?? 'No activity'

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card padding="none" className="overflow-hidden">
          <Tabs defaultValue="roster">
            <div className="border-b border-slate-200">
              <TabsList className="border-b-0">
                <TabsTrigger value="roster">Roster</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
              </TabsList>
            </div>

            {/* Roster Tab */}
            <TabsContent value="roster">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rosterState.search}
                    onChange={(e) => setRosterState((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                    placeholder="Search students..."
                    className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 w-64"
                  />
                </div>
                <Button size="sm" onClick={() => setShowAddStudentModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Student
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <tr>
                    <SelectAllHead
                      isAllSelected={selection.isAllSelected}
                      isIndeterminate={selection.isIndeterminate}
                      onSelectAll={selection.toggleAll}
                    />
                    <TableHead sortable sorted={sorted('displayName')} onSort={onSort('displayName')}>
                      Student
                    </TableHead>
                    <TableHead sortable sorted={sorted('level')} onSort={onSort('level')}>
                      Level
                    </TableHead>
                    <TableHead sortable sorted={sorted('progress')} onSort={onSort('progress')}>
                      Progress
                    </TableHead>
                    <TableHead sortable sorted={sorted('lastActive')} onSort={onSort('lastActive')}>
                      Last Active
                    </TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {studentsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell />
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                            <div className="space-y-1">
                              <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                              <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><div className="h-4 bg-slate-200 rounded w-16 animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 bg-slate-200 rounded w-24 animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 bg-slate-200 rounded w-20 animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : students.length === 0 ? (
                    <TableEmpty
                      colSpan={5}
                      message="No students found"
                      icon={GraduationCap}
                      description={rosterState.search ? 'Try a different search term.' : 'Add students to this class to get started.'}
                    />
                  ) : (
                    students.map((student) => (
                      <TableRow
                        key={student.id}
                        selected={selection.isSelected(student.id)}
                        clickable
                        onClick={() => navigate(`/admin/students/${student.id}`)}
                      >
                        <SelectableCell
                          isSelected={selection.isSelected(student.id)}
                          onSelect={() => selection.toggle(student.id)}
                          itemLabel={student.displayName}
                        />
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={student.displayName} size="sm" />
                            <div>
                              <p className="font-medium text-slate-800 text-sm">
                                {student.displayName}
                              </p>
                              <p className="text-xs text-slate-400">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Level {student.level}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  student.progress >= 80
                                    ? 'bg-emerald-500'
                                    : student.progress >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-slate-400'
                                }`}
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-600">{student.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{student.lastActive}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {studentsData && studentsData.meta.totalPages > 1 && (
                <Pagination
                  currentPage={rosterState.page}
                  totalPages={studentsData.meta.totalPages}
                  totalItems={studentsData.meta.total}
                  pageSize={pageSize}
                  onPageChange={(p) => setRosterState((prev) => ({ ...prev, page: p }))}
                  itemName="students"
                />
              )}
              {studentsData && studentsData.meta.totalPages <= 1 && students.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Showing {students.length} of {studentsData.meta.total} students
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Course Progress Overview</h4>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-medium ${
                                course.category === 'JavaScript'
                                  ? 'bg-amber-50 text-amber-700'
                                  : course.category === 'Python'
                                    ? 'bg-sky-50 text-sky-700'
                                    : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {course.category.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="font-medium text-slate-800">{course.name}</span>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              course.progress >= 80 ? 'text-emerald-600' : 'text-slate-700'
                            }`}
                          >
                            {course.progress}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              course.progress >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {Math.round((cls.studentCount * course.progress) / 100)} of{' '}
                          {cls.studentCount} students completed
                        </p>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <p className="text-sm text-slate-500">No courses assigned to this class.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Students Needing Attention</h4>
                  <div className="space-y-2">
                    {allStudents
                      .filter((s) => s.progress < 50 || s.lastActive.includes('days'))
                      .slice(0, 3)
                      .map((student) => (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            student.progress < 50 ? 'bg-amber-50' : 'bg-red-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar name={student.displayName} size="sm" />
                            <div>
                              <p className="font-medium text-slate-800 text-sm">
                                {student.displayName}
                              </p>
                              <p
                                className={`text-xs ${
                                  student.progress < 50 ? 'text-amber-600' : 'text-red-600'
                                }`}
                              >
                                {student.progress < 50
                                  ? `Below average progress (${student.progress}%)`
                                  : `No activity in ${student.lastActive}`}
                              </p>
                            </div>
                          </div>
                          <button className="text-sm text-accent-600 hover:underline">View</button>
                        </div>
                      ))}
                    {allStudents.filter((s) => s.progress < 50 || s.lastActive.includes('days'))
                      .length === 0 && (
                      <p className="text-sm text-slate-500">All students are on track!</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-slate-800">Attendance Records</h4>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    {Array.from(attendanceRecords.values()).filter(s => s === 'present').length}
                  </p>
                  <p className="text-sm text-slate-600">Present</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {Array.from(attendanceRecords.values()).filter(s => s === 'absent').length}
                  </p>
                  <p className="text-sm text-slate-600">Absent</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {Array.from(attendanceRecords.values()).filter(s => s === 'late').length}
                  </p>
                  <p className="text-sm text-slate-600">Late</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-600">{attendanceRate}%</p>
                  <p className="text-sm text-slate-600">Rate</p>
                </div>
              </div>

              {isLoadingAttendance ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
                </div>
              ) : allStudents.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No students enrolled in this class
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                          Student
                        </th>
                        <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allStudents.map((student) => {
                        const currentStatus = attendanceRecords.get(student.id) || 'present'
                        return (
                          <tr key={student.id}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-800 text-sm">{student.displayName}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${student.id}`}
                                    value="present"
                                    className="w-4 h-4 text-emerald-600"
                                    checked={currentStatus === 'present'}
                                    onChange={() => {
                                      const newRecords = new Map(attendanceRecords)
                                      newRecords.set(student.id, 'present')
                                      setAttendanceRecords(newRecords)
                                    }}
                                  />
                                  <span className="text-xs text-slate-600">Present</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${student.id}`}
                                    value="absent"
                                    className="w-4 h-4 text-red-600"
                                    checked={currentStatus === 'absent'}
                                    onChange={() => {
                                      const newRecords = new Map(attendanceRecords)
                                      newRecords.set(student.id, 'absent')
                                      setAttendanceRecords(newRecords)
                                    }}
                                  />
                                  <span className="text-xs text-slate-600">Absent</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${student.id}`}
                                    value="late"
                                    className="w-4 h-4 text-amber-600"
                                    checked={currentStatus === 'late'}
                                    onChange={() => {
                                      const newRecords = new Map(attendanceRecords)
                                      newRecords.set(student.id, 'late')
                                      setAttendanceRecords(newRecords)
                                    }}
                                  />
                                  <span className="text-xs text-slate-600">Late</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSaveAttendance} disabled={isSavingAttendance || allStudents.length === 0}>
                  {isSavingAttendance ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800">Assigned Courses</h4>
                <Button size="sm" onClick={handleAddCourse}>
                  <Plus className="w-4 h-4" />
                  Add Course
                </Button>
              </div>
              <div className="space-y-3">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/admin/courses/${course.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        course.category === 'JavaScript'
                          ? 'bg-amber-100'
                          : course.category === 'Python'
                            ? 'bg-sky-100'
                            : 'bg-slate-100'
                      }`}
                    >
                      <FileCode
                        className={`w-6 h-6 ${
                          course.category === 'JavaScript'
                            ? 'text-amber-600'
                            : course.category === 'Python'
                              ? 'text-sky-600'
                              : 'text-slate-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-800">{course.name}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            course.category === 'JavaScript'
                              ? 'bg-amber-50 text-amber-700'
                              : course.category === 'Python'
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {course.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">Course content</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          course.progress >= 80 ? 'text-emerald-600' : 'text-slate-700'
                        }`}
                      >
                        {course.progress}%
                      </p>
                      <p className="text-xs text-slate-400">class avg</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </Link>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No courses assigned to this class.</p>
                    <Button variant="secondary" className="mt-4" onClick={handleAddCourse}>
                      <Plus className="w-4 h-4" />
                      Assign Course
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Class Info Card */}
        <Card className="text-center">
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${colorClasses.bg}`}
          >
            <span className={`font-bold text-xl ${colorClasses.text}`}>
              {cls.name.replace('Class ', '')}
            </span>
          </div>
          <h3 className="font-semibold text-slate-800">{cls.name}</h3>
          <p className="text-sm text-slate-500 mb-3">{cls.description}</p>
          <StatusBadge status={cls.status === 'active' ? 'active' : 'inactive'} />
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader title="Statistics" />
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-slate-800">{cls.studentCount}</p>
              <p className="text-xs text-slate-500">Students</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-slate-800">{cls.courseCount}</p>
              <p className="text-xs text-slate-500">Courses</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p
                className={`text-xl font-bold ${
                  avgProgress >= 80 ? 'text-emerald-600' : 'text-slate-800'
                }`}
              >
                {avgProgress}%
              </p>
              <p className="text-xs text-slate-500">Avg Progress</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-slate-800">{attendanceRate}%</p>
              <p className="text-xs text-slate-500">Attendance</p>
            </div>
          </div>
        </Card>

        {/* Teacher Info */}
        <Card>
          <CardHeader title="Teacher" />
          {cls.teacherName ? (
            <Link
              to={`/admin/teachers/${cls.teacherId}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Avatar name={cls.teacherName} />
              <div className="flex-1">
                <p className="font-medium text-slate-800 text-sm">{cls.teacherName}</p>
                <p className="text-xs text-slate-500">{cls.teacherEmail}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          ) : (
            <p className="text-sm text-slate-500">No teacher assigned</p>
          )}
        </Card>

        {/* Details */}
        <Card>
          <CardHeader title="Details" />
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Created</span>
              <span className="text-slate-700">{formatDate(cls.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Last Activity</span>
              <span className="text-slate-700">{lastActivity}</span>
            </div>
          </div>
        </Card>
      </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && id && (
        <AddStudentModal
          classId={id}
          currentStudentIds={students.map((s) => s.id)}
          onClose={() => setShowAddStudentModal(false)}
        />
      )}

      {/* Action Bar */}
      <DetailActionBar
        backTo="/admin/classes"
        backLabel="Classes"
        editTo={`/admin/classes/${id}/edit`}
        onDelete={handleDelete}
        isDeleting={deleteClass.isPending}
      />

      {/* Bulk Action Bar for student selection */}
      <BulkActionBar
        selectedCount={selection.selectedCount}
        onDelete={handleBulkRemove}
        onClearSelection={selection.clearSelection}
        isDeleting={removeStudentFromClass.isPending}
        itemName={selection.selectedCount === 1 ? 'student' : 'students'}
      />
    </>
  )
}

function ClassDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="h-10 bg-slate-200 rounded w-64 mb-6 animate-pulse" />
          <div className="space-y-4">
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded w-32 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-20 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}

interface AddStudentModalProps {
  classId: string
  currentStudentIds: string[]
  onClose: () => void
}

function AddStudentModal({ classId, currentStudentIds, onClose }: AddStudentModalProps) {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const { data: studentsData, isLoading } = useStudents({
    page: 1,
    limit: 50,
    search,
  })

  const addStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { addStudentToClass } = await import('@/services/api/classes')
      return addStudentToClass(classId, studentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', 'detail', classId] })
      queryClient.invalidateQueries({ queryKey: ['classes', 'detail', classId, 'students'] })
    },
  })

  const availableStudents = (studentsData?.data || []).filter(
    (s) => !currentStudentIds.includes(s.id)
  )

  const handleAddStudent = async (studentId: string, studentName: string) => {
    try {
      await addStudentMutation.mutateAsync(studentId)
      addToast({ type: 'success', message: `${studentName} has been added to the class.` })
      onClose()
    } catch {
      addToast({ type: 'error', message: 'Failed to add student to class.' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Add Student to Class</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              autoFocus
            />
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                    <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : availableStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {search ? 'No students found matching your search.' : 'All students are already in this class.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {availableStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleAddStudent(student.id, student.displayName)}
                  disabled={addStudentMutation.isPending}
                  className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                >
                  <Avatar name={student.displayName} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{student.displayName}</p>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
