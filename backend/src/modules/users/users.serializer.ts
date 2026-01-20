import { Types } from 'mongoose'
import { User, type IUser } from './users.model'
import { StudentProfile } from './studentProfile.model'
import { ParentProfile } from './parentProfile.model'
import { Class } from '../classes/classes.model'

export interface SerializedUser {
  id: string
  [key: string]: unknown
}

/**
 * Enrich parent users with child data
 */
async function enrichParents(userIds: Types.ObjectId[]): Promise<Map<string, Record<string, unknown>>> {
  const profiles = await ParentProfile.find({ userId: { $in: userIds } }).lean()
  const allChildIds = profiles.flatMap((p) => p.childIds)
  const children = await User.find({ _id: { $in: allChildIds } }).select('_id displayName').lean()

  const childMap = new Map(children.map((c) => [c._id.toString(), c.displayName]))
  const enrichmentMap = new Map<string, Record<string, unknown>>()

  profiles.forEach((profile) => {
    const childIdStrings = profile.childIds.map((id) => id.toString())
    enrichmentMap.set(profile.userId.toString(), {
      childIds: childIdStrings,
      studentIds: childIdStrings, // Alias for frontend compatibility
      childNames: profile.childIds.map((id) => childMap.get(id.toString()) || 'Unknown'),
    })
  })

  return enrichmentMap
}

/**
 * Enrich student users with profile data
 */
async function enrichStudents(userIds: Types.ObjectId[]): Promise<Map<string, Record<string, unknown>>> {
  const profiles = await StudentProfile.find({ userId: { $in: userIds } }).lean()
  const enrichmentMap = new Map<string, Record<string, unknown>>()

  profiles.forEach((profile) => {
    enrichmentMap.set(profile.userId.toString(), {
      totalXp: profile.totalXp,
      currentLevel: profile.currentLevel,
      currencyBalance: profile.currencyBalance,
      currentStreakDays: profile.currentStreakDays,
      lastActivityDate: profile.lastActivityDate?.toISOString(),
      classId: profile.classId?.toString(),
      parentIds: profile.parentIds?.map((id) => id.toString()) || [],
      preferences: profile.preferences,
    })
  })

  return enrichmentMap
}

/**
 * Enrich teacher users with class data
 */
async function enrichTeachers(userIds: Types.ObjectId[]): Promise<Map<string, Record<string, unknown>>> {
  const classes = await Class.find({ teacherIds: { $in: userIds } }).lean()
  const enrichmentMap = new Map<string, Record<string, unknown>>()

  // Group classes by teacher
  const teacherClasses = new Map<string, typeof classes>()
  classes.forEach((cls) => {
    cls.teacherIds?.forEach((teacherId) => {
      const key = teacherId.toString()
      if (!teacherClasses.has(key)) teacherClasses.set(key, [])
      teacherClasses.get(key)!.push(cls)
    })
  })

  teacherClasses.forEach((classList, teacherId) => {
    enrichmentMap.set(teacherId, {
      classIds: classList.map((c) => c._id.toString()),
      classCount: classList.length,
      studentCount: classList.reduce((sum, c) => sum + (c.studentIds?.length || 0), 0),
    })
  })

  return enrichmentMap
}

/**
 * Serialize and enrich users based on their roles
 */
export async function serializeUsers(users: IUser[]): Promise<SerializedUser[]> {
  if (users.length === 0) return []

  // Group users by role
  const usersByRole = {
    parent: users.filter((u) => u.role === 'parent'),
    student: users.filter((u) => u.role === 'student'),
    teacher: users.filter((u) => u.role === 'teacher'),
  }

  // Fetch enrichment data in parallel
  const [parentEnrichment, studentEnrichment, teacherEnrichment] = await Promise.all([
    usersByRole.parent.length > 0 ? enrichParents(usersByRole.parent.map((u) => u._id)) : Promise.resolve(new Map()),
    usersByRole.student.length > 0 ? enrichStudents(usersByRole.student.map((u) => u._id)) : Promise.resolve(new Map()),
    usersByRole.teacher.length > 0 ? enrichTeachers(usersByRole.teacher.map((u) => u._id)) : Promise.resolve(new Map()),
  ])

  // Combine all enrichment maps
  const enrichmentMap = new Map([
    ...parentEnrichment,
    ...studentEnrichment,
    ...teacherEnrichment,
  ])

  // Serialize users with enrichment
  return users.map((user) => {
    const { passwordHash, __v, _id, ...userData } = user.toObject ? user.toObject() : user
    return {
      ...userData,
      id: _id.toString(),
      ...enrichmentMap.get(_id.toString()),
    }
  })
}

/**
 * Serialize a single user with role-specific enrichment
 */
export async function serializeUser(user: IUser): Promise<Record<string, unknown>> {
  const { passwordHash, __v, _id, ...userData } = user.toObject()
  const baseData = { ...userData, id: _id.toString() }

  switch (user.role) {
    case 'parent': {
      const profile = await ParentProfile.findOne({ userId: _id }).lean()
      if (!profile) return baseData

      const children = await User.find({ _id: { $in: profile.childIds } }).select('displayName').lean()
      const childIdStrings = profile.childIds.map((id) => id.toString())
      return {
        ...baseData,
        childIds: childIdStrings,
        studentIds: childIdStrings, // Alias for frontend compatibility
        childNames: children.map((c) => c.displayName),
      }
    }

    case 'student': {
      const profile = await StudentProfile.findOne({ userId: _id }).lean()
      if (!profile) return baseData

      const classDoc = profile.classId ? await Class.findById(profile.classId).select('name').lean() : null
      return {
        ...baseData,
        totalXp: profile.totalXp,
        currentLevel: profile.currentLevel,
        currencyBalance: profile.currencyBalance,
        currentStreakDays: profile.currentStreakDays,
        lastActivityDate: profile.lastActivityDate?.toISOString(),
        classId: profile.classId?.toString(),
        className: classDoc?.name,
        parentIds: profile.parentIds?.map((id) => id.toString()) || [],
        preferences: profile.preferences,
      }
    }

    case 'teacher': {
      const classes = await Class.find({ teacherIds: _id }).lean()
      return {
        ...baseData,
        classIds: classes.map((c) => c._id.toString()),
        classCount: classes.length,
        studentCount: classes.reduce((sum, c) => sum + (c.studentIds?.length || 0), 0),
      }
    }

    default:
      return baseData
  }
}
