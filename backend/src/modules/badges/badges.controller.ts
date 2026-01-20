import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendSuccess, sendPaginated, sendCreated, sendNoContent } from '../../utils/ApiResponse'
import * as badgesService from './badges.service'
import type { CreateBadgeInput, UpdateBadgeInput, ListBadgesQuery } from './badges.schema'
import type { IBadge } from './badges.model'

// Transform badge from backend format to admin format
function transformBadge(badge: IBadge) {
  const json = badge.toJSON()
  return {
    ...json,
    icon: json.iconName,
    color: 'indigo', // Default color, could be enhanced to store this
    status: json.isActive ? 'active' : 'inactive',
  }
}

// Transform incoming request data from admin format to backend format
function transformRequest(data: Record<string, unknown>) {
  const transformed: Record<string, unknown> = { ...data }

  // Transform icon to iconName
  if ('icon' in data) {
    transformed.iconName = data.icon
    delete transformed.icon
  }

  // Transform status to isActive
  if ('status' in data) {
    transformed.isActive = data.status === 'active'
    delete transformed.status
  }

  // Remove color field (not stored in backend)
  delete transformed.color

  return transformed
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListBadgesQuery
  const result = await badgesService.listBadges(query)
  sendPaginated(res, result.badges.map(transformBadge), result.meta)
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const badge = await badgesService.getBadgeById(req.params.id)
  sendSuccess(res, transformBadge(badge))
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const transformedInput = transformRequest(req.body) as CreateBadgeInput
  const badge = await badgesService.createBadge(transformedInput)
  sendCreated(res, transformBadge(badge))
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const transformedInput = transformRequest(req.body) as UpdateBadgeInput
  const badge = await badgesService.updateBadge(req.params.id, transformedInput)
  sendSuccess(res, transformBadge(badge))
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await badgesService.deleteBadge(req.params.id)
  sendNoContent(res)
})

export const getEarnedStudents = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const result = await badgesService.getEarnedStudents(req.params.id, page, limit)
  sendPaginated(res, result.students, result.meta)
})

export const awardBadge = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.body
  await badgesService.awardBadgeToStudent(req.params.id, studentId)
  sendSuccess(res, { message: 'Badge awarded successfully' })
})
