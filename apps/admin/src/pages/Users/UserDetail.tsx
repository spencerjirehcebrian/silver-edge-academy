import { Link, useParams, useNavigate } from 'react-router-dom'
import { Pencil, Mail, LogIn, FilePlus, UserPlus, ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge, RoleBadge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { DetailActionBar } from '@/components/ui/DetailActionBar'
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useUser, useDeleteUser } from '@/hooks/queries/useUsers'
import { formatDate } from '@/utils/formatters'
import { useSetPageMeta } from '@/contexts/PageMetaContext'
import { useToast } from '@/contexts/ToastContext'
import type { Teacher, Student, User } from '@/services/api/users'

// Type guards for role-based narrowing
function isTeacherUser(user: User): user is Teacher {
  return user.role === 'teacher'
}

function isStudentUser(user: User): user is Student {
  return user.role === 'student'
}
import { ParentCards, StudentCards } from './components/ParentStudentCards'
import { StudentClassTab } from './components/StudentClassTab'
import { StudentAchievementsTab } from './components/StudentAchievementsTab'

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser(id || '')
  const deleteUser = useDeleteUser()
  const { confirm, dialogProps } = useConfirmDialog()
  const { addToast } = useToast()

  // Set page meta for breadcrumbs
  useSetPageMeta({ entityLabel: user?.displayName })

  const handleDelete = async () => {
    if (!user) return

    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.displayName}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteUser.mutateAsync(user.id)
        navigate('/admin/users')
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: error instanceof Error ? error.message : 'Failed to delete user. Please try again.',
        })
      }
    }
  }

  if (isLoading) {
    return <UserDetailSkeleton />
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">User not found</p>
        <Link to="/admin/teachers" className="text-accent-600 hover:underline mt-2 inline-block">
          Back to Teachers
        </Link>
      </div>
    )
  }

  const isTeacher = user.role === 'teacher'
  const isStudent = user.role === 'student'
  const isParent = user.role === 'parent'

  const getBackPath = () => {
    switch (user.role) {
      case 'teacher':
        return '/admin/teachers'
      case 'parent':
        return '/admin/parents'
      case 'student':
        return '/admin/students'
      default:
        return '/admin'
    }
  }

  const getBackLabel = () => {
    switch (user.role) {
      case 'teacher':
        return 'Teachers'
      case 'parent':
        return 'Parents'
      case 'student':
        return 'Students'
      default:
        return 'Dashboard'
    }
  }

  const getEditPath = () => {
    switch (user.role) {
      case 'teacher':
        return `/admin/teachers/${id}/edit`
      case 'parent':
        return `/admin/parents/${id}/edit`
      case 'student':
        return `/admin/students/${id}/edit`
      default:
        return `/admin/users/${id}/edit`
    }
  }

  return (
    <>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card padding="none" className="overflow-hidden">
          <Tabs defaultValue="overview">
            <div className="border-b border-slate-200">
              <TabsList className="border-b-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                {isTeacher && <TabsTrigger value="classes">Classes</TabsTrigger>}
                {isStudent && <TabsTrigger value="courses">Class</TabsTrigger>}
                {isStudent && <TabsTrigger value="achievements">Achievements</TabsTrigger>}
                {isParent && <TabsTrigger value="children">Children</TabsTrigger>}
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6">
              {/* Stats Cards */}
              {isTeacherUser(user) && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-800">
                      {user.classCount}
                    </p>
                    <p className="text-sm text-slate-500">Classes</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-800">
                      {user.studentCount}
                    </p>
                    <p className="text-sm text-slate-500">Students</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-800">3</p>
                    <p className="text-sm text-slate-500">Courses</p>
                  </div>
                </div>
              )}

              {isStudentUser(user) && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-800">
                      Lv. {user.currentLevel}
                    </p>
                    <p className="text-sm text-slate-500">Level</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-800">
                      {user.totalXp.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">Total XP</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-800">
                      {user.className}
                    </p>
                    <p className="text-sm text-slate-500">Class</p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  {user.email ? (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{user.email}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No email address</p>
                  )}
                </div>
              </div>

              {/* Linked Parents (Student only) */}
              {isStudent && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-3">Linked Parents</h4>
                  <ParentCards studentId={user.id} />
                </div>
              )}

              {/* Linked Children (Parent only) */}
              {isParent && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-3">Linked Children</h4>
                  <StudentCards parentId={user.id} />
                </div>
              )}

              {/* Recent Activity */}
              <div>
              <h4 className="font-semibold text-slate-800 mb-3">Recent Activity</h4>
                <div className="space-y-3">
                  <ActivityItem
                    icon={<LogIn className="w-4 h-4 text-emerald-600" />}
                    iconBg="bg-emerald-100"
                    title="Logged in"
                    time="Today at 9:32 AM"
                  />
                  <ActivityItem
                    icon={<FilePlus className="w-4 h-4 text-accent-600" />}
                    iconBg="bg-accent-100"
                    title='Created lesson "Variables in Python"'
                    time="Yesterday at 3:45 PM"
                  />
                  <ActivityItem
                    icon={<UserPlus className="w-4 h-4 text-amber-600" />}
                    iconBg="bg-amber-100"
                    title="Added 3 students to Class 5A"
                    time="Jan 12, 2026"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800">Activity Log</h4>
                <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-500">
                  <option>All Activity</option>
                  <option>Logins</option>
                  <option>Content Changes</option>
                  <option>Student Actions</option>
                </select>
              </div>

              <div className="space-y-3">
                <ActivityLogItem
                  icon={<LogIn className="w-4 h-4 text-emerald-600" />}
                  iconBg="bg-emerald-100"
                  title="Logged in from Chrome on Windows"
                  time="Today at 9:32 AM"
                />
                <ActivityLogItem
                  icon={<FilePlus className="w-4 h-4 text-accent-600" />}
                  iconBg="bg-accent-100"
                  title='Created lesson "Variables in Python" in Python Basics course'
                  time="Yesterday at 3:45 PM"
                />
                <ActivityLogItem
                  icon={<Pencil className="w-4 h-4 text-sky-600" />}
                  iconBg="bg-sky-100"
                  title='Updated lesson "Introduction to Functions"'
                  time="Yesterday at 2:15 PM"
                />
                <ActivityLogItem
                  icon={<UserPlus className="w-4 h-4 text-amber-600" />}
                  iconBg="bg-amber-100"
                  title="Added 3 students to Class 5A"
                  time="Jan 12, 2026"
                />
              </div>
            </TabsContent>

            {/* Classes Tab (Teachers only) */}
            {isTeacher && (
              <TabsContent value="classes" className="p-6">
                <div className="space-y-4">
                  <ClassCard
                    classId="1"
                    name="Class 5A"
                    studentCount={24}
                    progress={92}
                    color="bg-accent-100 text-accent-600"
                  />
                  <ClassCard
                    classId="2"
                    name="Class 5B"
                    studentCount={24}
                    progress={85}
                    color="bg-emerald-100 text-emerald-600"
                  />
                </div>
              </TabsContent>
            )}

            {/* Class Tab (Students only) */}
            {isStudent && (
              <TabsContent value="courses" className="p-6">
                <StudentClassTab user={user} />
              </TabsContent>
            )}

            {/* Achievements Tab (Students only) */}
            {isStudent && (
              <TabsContent value="achievements" className="p-6">
                <StudentAchievementsTab userId={user.id} />
              </TabsContent>
            )}

            {/* Children Tab (Parents only) */}
            {isParent && (
              <TabsContent value="children" className="p-6">
                <h4 className="font-semibold text-slate-800 mb-4">Linked Children</h4>
                <StudentCards parentId={user.id} />
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar name={user.displayName} size="xl" />
          </div>
          <h3 className="font-semibold text-slate-800">{user.displayName}</h3>
          <p className="text-sm text-slate-500 mb-3 capitalize">{user.role}</p>
          <StatusBadge status={user.status} />
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader title="Account Info" />
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Role</span>
              <RoleBadge role={user.role} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <StatusBadge status={user.status} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Joined</span>
              <span className="text-slate-700">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Last Login</span>
              <span className="text-slate-700">Today, 9:32 AM</span>
            </div>
          </div>
        </Card>
      </div>
      </div>

      {/* Action Bar */}
      <DetailActionBar
        backTo={getBackPath()}
        backLabel={getBackLabel()}
        editTo={getEditPath()}
        onDelete={handleDelete}
        isDeleting={deleteUser.isPending}
      />
    </>
  )
}

function ActivityItem({
  icon,
  iconBg,
  title,
  time,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-700">{title}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  )
}

function ActivityLogItem({
  icon,
  iconBg,
  title,
  time,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-700">{title}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  )
}

function ClassCard({
  classId,
  name,
  studentCount,
  progress,
  color,
}: {
  classId: string
  name: string
  studentCount: number
  progress: number
  color: string
}) {
  return (
    <Link
      to={`/admin/classes/${classId}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <span className="font-bold">{name.replace('Class ', '')}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-slate-800">{name}</h4>
        <p className="text-sm text-slate-500">{studentCount} students</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${progress >= 90 ? 'text-emerald-600' : 'text-slate-700'}`}>
          {progress}%
        </p>
        <p className="text-xs text-slate-400">avg progress</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-400" />
    </Link>
  )
}

function UserDetailSkeleton() {
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
          <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded w-32 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-20 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}
