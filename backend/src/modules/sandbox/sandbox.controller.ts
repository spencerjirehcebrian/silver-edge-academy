import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { sendNoContent } from '../../utils/ApiResponse'
import type { AuthenticatedRequest } from '../../middleware/auth'
import * as sandboxService from './sandbox.service'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectIdParam,
  ListProjectsQuery,
} from './sandbox.schema'
import { MAX_SANDBOX_PROJECTS } from '@silveredge/shared'

export const list = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const query = req.query as unknown as ListProjectsQuery
  const result = await sandboxService.listProjects(authReq.user.userId, query)
  // Return format expected by frontend: { projects, count, maxProjects }
  res.status(200).json({
    projects: result.projects.map((p) => p.toJSON()),
    count: result.meta.total,
    maxProjects: MAX_SANDBOX_PROJECTS,
  })
})

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as ProjectIdParam
  const project = await sandboxService.getProjectById(authReq.user.userId, params.projectId)
  // Return format expected by frontend: { project }
  res.status(200).json({ project: project.toJSON() })
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const input = req.body as CreateProjectInput
  const project = await sandboxService.createProject(authReq.user.userId, input)
  // Return format expected by frontend: { project }
  res.status(201).json({ project: project.toJSON() })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as ProjectIdParam
  const input = req.body as UpdateProjectInput
  const project = await sandboxService.updateProject(authReq.user.userId, params.projectId, input)
  // Return format expected by frontend: { project }
  res.status(200).json({ project: project.toJSON() })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const params = req.params as unknown as ProjectIdParam
  await sandboxService.deleteProject(authReq.user.userId, params.projectId)
  sendNoContent(res)
})
