import type { Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendPaginated, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as usersService from './users.service'
import { serializeUsers, serializeUser } from './users.serializer'
import type {
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
  ListUsersQuery,
} from './users.schema'
import type { ValidatedRequest, AuthenticatedValidatedRequest } from '../../types/express'

export const list = asyncHandler(async (
  req: ValidatedRequest<unknown, ListUsersQuery>,
  res: Response
) => {
  const result = await usersService.listUsers(req.query)
  const serializedUsers = await serializeUsers(result.users)
  sendPaginated(res, serializedUsers, result.meta)
})

export const getById = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { id: string }>,
  res: Response
) => {
  const user = await usersService.getUserById(req.params.id)
  const serializedUser = await serializeUser(user)
  sendSuccess(res, serializedUser)
})

export const create = asyncHandler(async (
  req: ValidatedRequest<CreateUserInput>,
  res: Response
) => {
  const user = await usersService.createUser(req.body)
  const serializedUser = await serializeUser(user)
  sendCreated(res, serializedUser)
})

export const update = asyncHandler(async (
  req: ValidatedRequest<UpdateUserInput, unknown, { id: string }>,
  res: Response
) => {
  const user = await usersService.updateUser(req.params.id, req.body)
  const serializedUser = await serializeUser(user)
  sendSuccess(res, serializedUser)
})

export const remove = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { id: string }>,
  res: Response
) => {
  await usersService.deleteUser(req.params.id)
  sendNoContent(res)
})

export const changePassword = asyncHandler(async (
  req: AuthenticatedValidatedRequest<ChangePasswordInput, unknown, { id: string }>,
  res: Response
) => {
  await usersService.changePassword(req.params.id, req.body, req.user.userId)
  sendSuccess(res, { message: 'Password changed successfully' })
})

export const getProfile = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { id: string }>,
  res: Response
) => {
  const profile = await usersService.getStudentProfile(req.params.id)
  sendSuccess(res, profile.toJSON())
})

export const getTeacherClasses = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { id: string }>,
  res: Response
) => {
  const classes = await usersService.getTeacherClasses(req.params.id)
  sendSuccess(res, classes.map((c) => c.toJSON()))
})

export const getParentChildren = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { id: string }>,
  res: Response
) => {
  const children = await usersService.getParentChildren(req.params.id)
  sendSuccess(res, children.map((c) => c.toJSON()))
})

export const getAchievements = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { id: string }>,
  res: Response
) => {
  const achievements = await usersService.getStudentAchievements(req.params.id)
  sendSuccess(res, achievements)
})

export const getCourses = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { id: string }>,
  res: Response
) => {
  const courses = await usersService.getStudentCourses(req.params.id)
  sendSuccess(res, courses)
})

export const linkParent = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { studentId: string; parentId: string }>,
  res: Response
) => {
  await usersService.linkParentToStudent(req.params.studentId, req.params.parentId)
  sendSuccess(res, { message: 'Parent linked successfully' })
})

export const unlinkParent = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { studentId: string; parentId: string }>,
  res: Response
) => {
  await usersService.unlinkParentFromStudent(req.params.studentId, req.params.parentId)
  sendSuccess(res, { message: 'Parent unlinked successfully' })
})

export const linkStudent = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { parentId: string; studentId: string }>,
  res: Response
) => {
  await usersService.linkStudentToParent(req.params.parentId, req.params.studentId)
  sendSuccess(res, { message: 'Student linked successfully' })
})

export const unlinkStudent = asyncHandler(async (
  req: ValidatedRequest<unknown, unknown, { parentId: string; studentId: string }>,
  res: Response
) => {
  await usersService.unlinkStudentFromParent(req.params.parentId, req.params.studentId)
  sendSuccess(res, { message: 'Student unlinked successfully' })
})

export const updateStatus = asyncHandler(async (
  req: ValidatedRequest<{ status: 'active' | 'inactive' }, unknown, { id: string }>,
  res: Response
) => {
  const user = await usersService.updateUserStatus(req.params.id, req.body.status)
  sendSuccess(res, user.toJSON())
})
