import type { ClassStatus } from '@silveredge/shared'
import type { AdminClass, ClassCourse, ClassStudent } from '@/types/admin'
import { api } from './client'
import { API_ENDPOINTS } from './endpoints'

// Re-export types for backward compatibility
export type { AdminClass as Class, ClassCourse, ClassStudent }

export interface ClassListParams {
  page?: number
  limit?: number
  search?: string
  status?: ClassStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ClassListResponse {
  data: AdminClass[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateClassPayload {
  name: string
  description?: string
  color: string
  startDate?: string
  endDate?: string
  teacherId?: string
  courseIds?: string[]
  studentIds?: string[]
  status: 'active' | 'draft'
}

export interface UpdateClassPayload {
  id: string
  name?: string
  description?: string
  color?: string
  teacherId?: string | null
  courseIds?: string[]
  status?: ClassStatus
}

export async function getClasses(params: ClassListParams): Promise<ClassListResponse> {
  return api.get<ClassListResponse>(API_ENDPOINTS.classes.list, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
    unwrapData: false,
  })
}

export async function getClass(id: string): Promise<AdminClass> {
  return api.get<AdminClass>(API_ENDPOINTS.classes.detail(id))
}

export async function createClass(payload: CreateClassPayload): Promise<AdminClass> {
  return api.post<AdminClass>(API_ENDPOINTS.classes.create, payload)
}

export async function updateClass(payload: UpdateClassPayload): Promise<AdminClass> {
  const { id, ...data } = payload
  return api.patch<AdminClass>(API_ENDPOINTS.classes.update(id), data)
}

export async function deleteClass(id: string): Promise<void> {
  return api.delete(API_ENDPOINTS.classes.delete(id))
}

export async function archiveClass(id: string): Promise<AdminClass> {
  return api.patch<AdminClass>(API_ENDPOINTS.classes.archive(id))
}

export async function getClassStudents(
  id: string,
  params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
): Promise<{
  data: ClassStudent[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  return api.get(API_ENDPOINTS.classes.students(id), {
    params: {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    },
    unwrapData: false,
  })
}

export async function addStudentToClass(classId: string, studentId: string): Promise<void> {
  return api.post(API_ENDPOINTS.classes.addStudent(classId), { studentId })
}

export async function removeStudentFromClass(classId: string, studentId: string): Promise<void> {
  return api.delete(API_ENDPOINTS.classes.removeStudent(classId, studentId))
}
