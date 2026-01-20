import { api } from './client'
import { API_ENDPOINTS } from './endpoints'

export interface AttendanceRecord {
  id: string
  studentId: string
  classId: string
  status: 'present' | 'absent' | 'late' | 'excused'
  date: string
  notes?: string
}

export interface MarkAttendanceRequest {
  records: {
    studentId: string
    status: 'present' | 'absent' | 'late' | 'excused'
    notes?: string
  }[]
  date?: string
}

export async function getAttendance(
  classId: string,
  params?: {
    startDate?: string
    endDate?: string
    studentId?: string
  }
): Promise<AttendanceRecord[]> {
  return api.get<AttendanceRecord[]>(API_ENDPOINTS.attendance.list(classId), {
    params: params as Record<string, string | undefined>,
  })
}

export async function markAttendance(
  classId: string,
  body: MarkAttendanceRequest
): Promise<void> {
  return api.post(API_ENDPOINTS.attendance.mark(classId), body)
}

export async function getAttendanceSummary(classId: string): Promise<{
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  excusedDays: number
  attendanceRate: number
}> {
  return api.get(API_ENDPOINTS.attendance.summary(classId))
}
