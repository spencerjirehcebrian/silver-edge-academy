import { User, BookOpen, Calendar, Users as UsersIcon, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AdminClass } from '@/types/admin'
import { formatDateRange } from '@/utils/formatters'

interface ClassInfoCardProps {
  classData: AdminClass
}

export function ClassInfoCard({ classData }: ClassInfoCardProps) {
  const navigate = useNavigate()

  const statusColor =
    classData.status === 'active'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-600'

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header with class name and color badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: classData.color }}
          >
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{classData.name}</h2>
            {classData.description && (
              <p className="text-sm text-slate-600 mt-0.5">{classData.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusColor}`}>
            {classData.status}
          </span>
          <button
            onClick={() => navigate(`/admin/classes/${classData.id}`)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="View class details"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Class Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoItem
          icon={<User className="w-4 h-4" />}
          label="Teacher"
          value={classData.teacherName || 'Not assigned'}
        />
        <InfoItem
          icon={<UsersIcon className="w-4 h-4" />}
          label="Students"
          value={classData.studentCount.toString()}
        />
        <InfoItem
          icon={<BookOpen className="w-4 h-4" />}
          label="Courses"
          value={classData.courseCount.toString()}
        />
        <InfoItem
          icon={<Calendar className="w-4 h-4" />}
          label="Period"
          value={
            classData.startDate
              ? formatDateRange(classData.startDate, classData.endDate)
              : 'Not set'
          }
        />
      </div>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
      </div>
    </div>
  )
}
