import { z } from 'zod'

export const createClassSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  teacherId: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
})

export const updateClassSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  teacherId: z.string().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
})

export const listClassesQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
  teacherId: z.string().optional(),
})

export const studentIdParamSchema = z.object({
  studentId: z.string().min(1),
})

export const courseIdParamSchema = z.object({
  courseId: z.string().min(1),
})

export const lessonIdParamSchema = z.object({
  lessonId: z.string().min(1),
})

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const addStudentSchema = z.object({
  studentId: z.string().min(1),
})

export const addCourseSchema = z.object({
  courseId: z.string().min(1),
})

export const listStudentsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
})

export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
export type ListClassesQuery = z.infer<typeof listClassesQuerySchema>
export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>
