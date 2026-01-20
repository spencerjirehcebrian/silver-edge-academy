import { Types } from 'mongoose'
import { User } from '../modules/users/users.model'
import { StudentProfile } from '../modules/users/studentProfile.model'
import { TeacherProfile } from '../modules/users/teacherProfile.model'
import { ParentProfile } from '../modules/users/parentProfile.model'
import { hashPassword } from '../utils/password'
import { logger } from '../utils/logger'

export interface SeededUsers {
  admin: Types.ObjectId
  teachers: Types.ObjectId[]
  students: Types.ObjectId[]
  parents: Types.ObjectId[]
}

export async function seedUsers(): Promise<SeededUsers> {
  logger.info('Seeding users...')

  const defaultPassword = await hashPassword('password123')

  // Create admin
  const admin = await User.create({
    email: 'admin@silveredge.com',
    passwordHash: defaultPassword,
    displayName: 'Admin User',
    role: 'admin',
    status: 'active',
    emailVerified: true,
  })
  logger.info('Created admin user')

  // Create teachers
  const teachers: Types.ObjectId[] = []
  const teacherData = [
    { email: 'teacher1@silveredge.com', displayName: 'Sarah Johnson' },
    { email: 'teacher2@silveredge.com', displayName: 'Michael Chen' },
  ]

  for (const data of teacherData) {
    const teacher = await User.create({
      email: data.email,
      passwordHash: defaultPassword,
      displayName: data.displayName,
      role: 'teacher',
      status: 'active',
    })
    await TeacherProfile.create({
      userId: teacher._id,
      classIds: [],
    })
    teachers.push(teacher._id)
  }
  logger.info(`Created ${teachers.length} teachers`)

  // Create students
  const students: Types.ObjectId[] = []
  const studentData = [
    { username: 'alex_coder', displayName: 'Alex Thompson', level: 5, xp: 450, theme: 'system' as const, fontSize: 14 },
    { username: 'emma_dev', displayName: 'Emma Wilson', level: 3, xp: 220, theme: 'light' as const, fontSize: 16 },
    { username: 'liam_js', displayName: 'Liam Brown', level: 7, xp: 680, theme: 'light' as const, fontSize: 14 },
    { username: 'olivia_py', displayName: 'Olivia Davis', level: 2, xp: 120, theme: 'light' as const, fontSize: 16 },
    { username: 'noah_code', displayName: 'Noah Martinez', level: 4, xp: 350, theme: 'dark' as const, fontSize: 14 },
    { username: 'ava_tech', displayName: 'Ava Garcia', level: 6, xp: 580, theme: 'light' as const, fontSize: 12 },
    { username: 'william_dev', displayName: 'William Rodriguez', level: 1, xp: 50, theme: 'system' as const, fontSize: 16 },
    { username: 'sophia_js', displayName: 'Sophia Anderson', level: 8, xp: 820, theme: 'dark' as const, fontSize: 14 },
    { username: 'james_py', displayName: 'James Taylor', level: 3, xp: 280, theme: 'dark' as const, fontSize: 14 },
    { username: 'isabella_code', displayName: 'Isabella Thomas', level: 5, xp: 490, theme: 'light' as const, fontSize: 14 },
  ]

  for (const data of studentData) {
    const student = await User.create({
      username: data.username,
      passwordHash: defaultPassword,
      displayName: data.displayName,
      role: 'student',
      status: 'active',
    })
    await StudentProfile.create({
      userId: student._id,
      parentIds: [],
      currentLevel: data.level,
      totalXp: data.xp,
      currencyBalance: data.xp * 10,
      currentStreakDays: Math.floor(Math.random() * 7),
      preferences: {
        theme: data.theme,
        fontSize: data.fontSize,
      },
    })
    students.push(student._id)
  }
  logger.info(`Created ${students.length} students with preferences`)

  // Create 5 parents with different students
  const parents: Types.ObjectId[] = []
  const parentData = [
    { email: 'parent1@silveredge.com', displayName: 'Jennifer Thompson', childIndices: [0, 1] },
    { email: 'parent2@silveredge.com', displayName: 'Michael Chen', childIndices: [2, 3, 4] },
    { email: 'parent3@silveredge.com', displayName: 'Maria Garcia', childIndices: [5, 6] },
    { email: 'parent4@silveredge.com', displayName: 'David Wilson', childIndices: [7, 8] },
    { email: 'parent5@silveredge.com', displayName: 'Aisha Patel', childIndices: [9] },
  ]

  for (const data of parentData) {
    const parent = await User.create({
      email: data.email,
      passwordHash: defaultPassword,
      displayName: data.displayName,
      role: 'parent',
      status: 'active',
    })

    const childIds = data.childIndices.map(i => students[i])
    await ParentProfile.create({
      userId: parent._id,
      childIds,
    })

    await StudentProfile.updateMany(
      { userId: { $in: childIds } },
      { $push: { parentIds: parent._id } }
    )

    parents.push(parent._id)
  }
  logger.info(`Created ${parents.length} parents with children linked`)

  return {
    admin: admin._id,
    teachers,
    students,
    parents,
  }
}
