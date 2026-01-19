import { Attendance } from '../modules/attendance/attendance.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'
import type { SeededClasses } from './classes.seed'

export async function seedAttendance(
  users: SeededUsers,
  classes: SeededClasses
): Promise<void> {
  logger.info('Seeding attendance records...')

  const attendanceRecords = []
  const now = Date.now()
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  // Generate attendance for the last 21 days (3 weeks)
  const daysToGenerate = 21

  // Class 1: JavaScript Beginners (students 0-4, teacher 0)
  const class1Students = users.students.slice(0, 5)
  for (let day = 0; day < daysToGenerate; day++) {
    const date = new Date(now - day * millisecondsPerDay)

    // Skip weekends
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    for (const studentId of class1Students) {
      // Generate random attendance status
      // 70% present, 15% late, 10% absent, 5% excused
      const rand = Math.random()
      let status: 'present' | 'absent' | 'late' | 'excused'
      let notes: string | undefined

      if (rand < 0.7) {
        status = 'present'
      } else if (rand < 0.85) {
        status = 'late'
        notes = Math.random() > 0.5 ? 'Arrived 5 minutes late' : undefined
      } else if (rand < 0.95) {
        status = 'absent'
        notes = Math.random() > 0.5 ? 'No notification' : undefined
      } else {
        status = 'excused'
        notes = Math.random() > 0.5 ? 'Doctor appointment' : 'Family emergency'
      }

      attendanceRecords.push({
        classId: classes.class1,
        studentId,
        date,
        status,
        notes,
        recordedBy: users.teachers[0],
      })
    }
  }

  // Class 2: Python Adventures (students 5-9, teacher 1)
  const class2Students = users.students.slice(5, 10)
  for (let day = 0; day < daysToGenerate; day++) {
    const date = new Date(now - day * millisecondsPerDay)

    // Skip weekends
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    for (const studentId of class2Students) {
      // Generate random attendance status
      const rand = Math.random()
      let status: 'present' | 'absent' | 'late' | 'excused'
      let notes: string | undefined

      if (rand < 0.7) {
        status = 'present'
      } else if (rand < 0.85) {
        status = 'late'
        notes = Math.random() > 0.5 ? 'Arrived 10 minutes late' : undefined
      } else if (rand < 0.95) {
        status = 'absent'
        notes = Math.random() > 0.5 ? 'No notification' : undefined
      } else {
        status = 'excused'
        notes = Math.random() > 0.5 ? 'School event' : 'Sick leave'
      }

      attendanceRecords.push({
        classId: classes.class2,
        studentId,
        date,
        status,
        notes,
        recordedBy: users.teachers[1],
      })
    }
  }

  await Attendance.insertMany(attendanceRecords)
  logger.info(`Created ${attendanceRecords.length} attendance records`)
}
