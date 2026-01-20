import { Types } from 'mongoose'
import { User, type IUser } from './users.model'
import { StudentProfile, type IStudentProfile } from './studentProfile.model'
import { TeacherProfile } from './teacherProfile.model'
import { ParentProfile } from './parentProfile.model'
import { Class } from '../classes/classes.model'
import { ApiError } from '../../utils/ApiError'
import { hashPassword, comparePassword } from '../../utils/password'
import {
  parsePaginationParams,
  buildPaginationMeta,
  buildSortObject,
} from '../../utils/pagination'
import type { CreateUserInput, UpdateUserInput, ChangePasswordInput, ListUsersQuery } from './users.schema'
import type { PaginationMeta } from '@silveredge/shared'

export interface UserListResult {
  users: IUser[]
  meta: PaginationMeta
}

export async function listUsers(query: ListUsersQuery): Promise<UserListResult> {
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {}

  if (query.role) {
    filter.role = query.role
  }
  if (query.status) {
    filter.status = query.status
  }
  if (query.search) {
    filter.$or = [
      { displayName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { username: { $regex: query.search, $options: 'i' } },
    ]
  }

  // Filter by class if specified
  if (query.classId) {
    const classStudents = await StudentProfile.find({
      classId: new Types.ObjectId(query.classId),
    }).select('userId')
    filter._id = { $in: classStudents.map((s) => s.userId) }
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(buildSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ])

  return {
    users,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function getUserById(id: string): Promise<IUser> {
  const user = await User.findById(id)
  if (!user) {
    throw ApiError.notFound('User')
  }

  return user
}

export async function createUser(input: CreateUserInput): Promise<IUser> {
  const { password, role, classId, parentIds, classIds, childIds, ...userData } = input

  // Check for existing email/username
  if (userData.email) {
    const existingEmail = await User.findOne({ email: userData.email.toLowerCase() })
    if (existingEmail) {
      throw ApiError.conflict('Email already exists')
    }
  }
  if (userData.username) {
    const existingUsername = await User.findOne({ username: userData.username.toLowerCase() })
    if (existingUsername) {
      throw ApiError.conflict('Username already exists')
    }
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const user = await User.create({
    ...userData,
    email: userData.email?.toLowerCase(),
    username: userData.username?.toLowerCase(),
    passwordHash,
    role,
  })

  // Create role-specific profile
  if (role === 'student') {
    await StudentProfile.create({
      userId: user._id,
      classId: classId ? new Types.ObjectId(classId) : undefined,
      parentIds: parentIds?.map((id) => new Types.ObjectId(id)) || [],
    })

    // Update class student count
    if (classId) {
      await Class.findByIdAndUpdate(classId, { $addToSet: { studentIds: user._id } })
    }
  } else if (role === 'teacher') {
    await TeacherProfile.create({
      userId: user._id,
      classIds: classIds?.map((id) => new Types.ObjectId(id)) || [],
    })
  } else if (role === 'parent') {
    await ParentProfile.create({
      userId: user._id,
      childIds: childIds?.map((id) => new Types.ObjectId(id)) || [],
    })

    // Update children's parentIds
    if (childIds?.length) {
      await StudentProfile.updateMany(
        { userId: { $in: childIds.map((id) => new Types.ObjectId(id)) } },
        { $addToSet: { parentIds: user._id } }
      )
    }
  }

  return user
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<IUser> {
  const user = await User.findById(id)
  if (!user) {
    throw ApiError.notFound('User')
  }

  const { classId, parentIds, childIds, preferences, ...userData } = input

  // Check for unique constraints
  if (userData.email && userData.email !== user.email) {
    const existing = await User.findOne({ email: userData.email.toLowerCase(), _id: { $ne: id } })
    if (existing) {
      throw ApiError.conflict('Email already exists')
    }
    userData.email = userData.email.toLowerCase()
  }
  if (userData.username && userData.username !== user.username) {
    const existing = await User.findOne({
      username: userData.username.toLowerCase(),
      _id: { $ne: id },
    })
    if (existing) {
      throw ApiError.conflict('Username already exists')
    }
    userData.username = userData.username.toLowerCase()
  }

  // Update user
  Object.assign(user, userData)
  await user.save()

  // Update role-specific profile
  if (user.role === 'student') {
    const updateData: Partial<IStudentProfile> = {}
    if (classId !== undefined) {
      // Remove from old class
      const profile = await StudentProfile.findOne({ userId: user._id })
      if (profile?.classId) {
        await Class.findByIdAndUpdate(profile.classId, { $pull: { studentIds: user._id } })
      }

      updateData.classId = classId ? new Types.ObjectId(classId) : undefined

      // Add to new class
      if (classId) {
        await Class.findByIdAndUpdate(classId, { $addToSet: { studentIds: user._id } })
      }
    }
    if (parentIds !== undefined) {
      updateData.parentIds = parentIds.map((pid) => new Types.ObjectId(pid))
    }
    if (preferences !== undefined) {
      updateData.preferences = preferences as IStudentProfile['preferences']
    }
    if (Object.keys(updateData).length > 0) {
      await StudentProfile.findOneAndUpdate({ userId: user._id }, updateData)
    }
  } else if (user.role === 'parent' && childIds !== undefined) {
    await ParentProfile.findOneAndUpdate(
      { userId: user._id },
      { childIds: childIds.map((cid) => new Types.ObjectId(cid)) }
    )
  }

  return user
}

export async function deleteUser(id: string): Promise<void> {
  const user = await User.findById(id)
  if (!user) {
    throw ApiError.notFound('User')
  }

  // Soft delete - set status to inactive
  user.status = 'inactive'
  await user.save()
}

export async function changePassword(
  id: string,
  input: ChangePasswordInput,
  requesterId: string
): Promise<void> {
  const user = await User.findById(id)
  if (!user) {
    throw ApiError.notFound('User')
  }

  // Only allow self or admin
  if (id !== requesterId) {
    const requester = await User.findById(requesterId)
    if (requester?.role !== 'admin') {
      throw ApiError.forbidden('You can only change your own password')
    }
  }

  // Verify current password (only for self)
  if (id === requesterId) {
    const isValid = await comparePassword(input.currentPassword, user.passwordHash)
    if (!isValid) {
      throw ApiError.badRequest('Current password is incorrect')
    }
  }

  user.passwordHash = await hashPassword(input.newPassword)
  await user.save()
}

export async function getStudentProfile(userId: string): Promise<IStudentProfile> {
  const profile = await StudentProfile.findOne({ userId: new Types.ObjectId(userId) })
  if (!profile) {
    throw ApiError.notFound('Student profile')
  }
  return profile
}

export async function getTeacherClasses(userId: string) {
  const profile = await TeacherProfile.findOne({ userId: new Types.ObjectId(userId) })
  if (!profile) {
    return []
  }
  return Class.find({ _id: { $in: profile.classIds } })
}

export async function getParentChildren(userId: string) {
  const profile = await ParentProfile.findOne({ userId: new Types.ObjectId(userId) })
  if (!profile) {
    return []
  }
  return User.find({ _id: { $in: profile.childIds } })
}

// Get student achievements (badges + XP history)
export async function getStudentAchievements(userId: string) {
  const user = await User.findById(userId)
  if (!user || user.role !== 'student') {
    throw ApiError.badRequest('User is not a student')
  }

  const profile = await StudentProfile.findOne({ userId: new Types.ObjectId(userId) })
  if (!profile) {
    throw ApiError.notFound('Student profile')
  }

  // Import StudentBadge dynamically to avoid circular deps
  const { StudentBadge } = await import('../badges/badges.model')
  const { Badge } = await import('../badges/badges.model')

  // Get badges
  const studentBadges = await StudentBadge.find({ studentId: new Types.ObjectId(userId) })
    .sort({ earnedAt: -1 })
    .lean()

  const badgeIds = studentBadges.map((sb) => sb.badgeId)
  const badges = await Badge.find({ _id: { $in: badgeIds } }).lean()
  const badgeMap = new Map(badges.map((b) => [b._id.toString(), b]))

  const earnedBadges = studentBadges.map((sb) => {
    const badge = badgeMap.get(sb.badgeId.toString())
    return {
      id: sb._id.toString(),
      badgeId: sb.badgeId.toString(),
      badge: badge
        ? {
            id: badge._id.toString(),
            name: badge.name,
            description: badge.description,
            iconName: badge.iconName,
            gradientFrom: badge.gradientFrom,
            gradientTo: badge.gradientTo,
          }
        : null,
      earnedAt: sb.earnedAt.toISOString(),
    }
  })

  const xpHistory = (profile.xpHistory || [])
    .slice(0, 20)
    .map(entry => ({
      date: entry.earnedAt.toISOString(),
      xp: entry.amount,
      source: entry.source,
    }))

  return {
    badges: earnedBadges,
    totalXp: profile.totalXp,
    level: profile.currentLevel,
    currencyBalance: profile.currencyBalance,
    currentStreakDays: profile.currentStreakDays,
    longestStreak: profile.longestStreak,
    xpHistory,
  }
}

// Get student's enrolled courses (via class)
export async function getStudentCourses(userId: string) {
  const user = await User.findById(userId)
  if (!user || user.role !== 'student') {
    throw ApiError.badRequest('User is not a student')
  }

  const profile = await StudentProfile.findOne({ userId: new Types.ObjectId(userId) })
  if (!profile || !profile.classId) return []

  const studentClass = await Class.findById(profile.classId)
  if (!studentClass || !studentClass.courseIds.length) return []

  const { Course } = await import('../courses/courses.model')
  const { Section } = await import('../sections/sections.model')
  const { Lesson } = await import('../lessons/lessons.model')
  const { LessonProgress } = await import('../progress/lessonProgress.model')

  const courses = await Course.find({ _id: { $in: studentClass.courseIds } }).lean()
  const allLessonProgress = await LessonProgress.find({ studentId: new Types.ObjectId(userId) }).lean()
  const progressMap = new Map(allLessonProgress.map(p => [p.lessonId.toString(), p]))

  const studentCourses = await Promise.all(courses.map(async (course) => {
    const sections = await Section.find({ courseId: course._id }).lean()
    const lessons = await Lesson.find({
      sectionId: { $in: sections.map(s => s._id) },
      status: 'published'
    }).lean()

    const totalLessons = lessons.length
    const completedLessons = lessons.filter(l =>
      progressMap.get(l._id.toString())?.status === 'completed'
    ).length

    const lessonIds = lessons.map(l => l._id.toString())
    const relevantProgress = allLessonProgress.filter(p => lessonIds.includes(p.lessonId.toString()))

    let lastAccessed: string | null = null
    if (relevantProgress.length > 0) {
      const mostRecent = relevantProgress.reduce((latest, current) => {
        const currentDate = current.updatedAt || current.createdAt
        const latestDate = latest.updatedAt || latest.createdAt
        return currentDate > latestDate ? current : latest
      })
      lastAccessed = (mostRecent.updatedAt || mostRecent.createdAt).toISOString()
    }

    return {
      id: course._id.toString(),
      title: course.title,
      language: course.language,
      lessonsCompleted: completedLessons,
      totalLessons,
      progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      lastAccessed,
    }
  }))

  return studentCourses
}

// Link parent to student
export async function linkParentToStudent(studentId: string, parentId: string): Promise<void> {
  const student = await User.findById(studentId)
  if (!student || student.role !== 'student') {
    throw ApiError.badRequest('Invalid student')
  }

  const parent = await User.findById(parentId)
  if (!parent || parent.role !== 'parent') {
    throw ApiError.badRequest('Invalid parent')
  }

  // Add parent to student's parentIds
  await StudentProfile.findOneAndUpdate(
    { userId: new Types.ObjectId(studentId) },
    { $addToSet: { parentIds: new Types.ObjectId(parentId) } }
  )

  // Add student to parent's childIds
  await ParentProfile.findOneAndUpdate(
    { userId: new Types.ObjectId(parentId) },
    { $addToSet: { childIds: new Types.ObjectId(studentId) } }
  )
}

// Unlink parent from student
export async function unlinkParentFromStudent(studentId: string, parentId: string): Promise<void> {
  await StudentProfile.findOneAndUpdate(
    { userId: new Types.ObjectId(studentId) },
    { $pull: { parentIds: new Types.ObjectId(parentId) } }
  )

  await ParentProfile.findOneAndUpdate(
    { userId: new Types.ObjectId(parentId) },
    { $pull: { childIds: new Types.ObjectId(studentId) } }
  )
}

// Link student to parent (same as linkParentToStudent but from parent perspective)
export async function linkStudentToParent(parentId: string, studentId: string): Promise<void> {
  return linkParentToStudent(studentId, parentId)
}

// Unlink student from parent
export async function unlinkStudentFromParent(parentId: string, studentId: string): Promise<void> {
  return unlinkParentFromStudent(studentId, parentId)
}

// Update user status
export async function updateUserStatus(
  id: string,
  status: 'active' | 'inactive'
): Promise<IUser> {
  const user = await User.findById(id)
  if (!user) {
    throw ApiError.notFound('User')
  }
  user.status = status
  await user.save()
  return user
}
