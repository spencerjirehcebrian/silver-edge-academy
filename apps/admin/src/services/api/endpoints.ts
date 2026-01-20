// ============================================================================
// Centralized API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },

  // Users
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    status: (id: string) => `/users/${id}/status`,
    courses: (id: string) => `/users/${id}/courses`,
    achievements: (id: string) => `/users/${id}/achievements`,
    profile: (id: string) => `/users/${id}/profile`,
    teacherClasses: (id: string) => `/users/${id}/classes`,
    parentChildren: (id: string) => `/users/${id}/children`,
    linkParent: (studentId: string, parentId: string) => `/users/${studentId}/parents/${parentId}`,
    unlinkParent: (studentId: string, parentId: string) => `/users/${studentId}/parents/${parentId}`,
    linkStudent: (parentId: string, studentId: string) => `/users/${parentId}/students/${studentId}`,
    unlinkStudent: (parentId: string, studentId: string) => `/users/${parentId}/students/${studentId}`,
  },

  // Classes
  classes: {
    list: '/classes',
    detail: (id: string) => `/classes/${id}`,
    create: '/classes',
    update: (id: string) => `/classes/${id}`,
    delete: (id: string) => `/classes/${id}`,
    archive: (id: string) => `/classes/${id}/archive`,
    students: (id: string) => `/classes/${id}/students`,
    addStudent: (id: string) => `/classes/${id}/students`,
    removeStudent: (classId: string, studentId: string) => `/classes/${classId}/students/${studentId}`,
  },

  // Attendance
  attendance: {
    list: (classId: string) => `/classes/${classId}/attendance`,
    mark: (classId: string) => `/classes/${classId}/attendance`,
    summary: (classId: string) => `/classes/${classId}/attendance/summary`,
  },

  // Courses
  courses: {
    list: '/courses',
    detail: (id: string) => `/courses/${id}`,
    create: '/courses',
    update: (id: string) => `/courses/${id}`,
    delete: (id: string) => `/courses/${id}`,
    publish: (id: string) => `/courses/${id}/publish`,
    sections: {
      create: (courseId: string) => `/courses/${courseId}/sections`,
      update: (courseId: string, sectionId: string) => `/courses/${courseId}/sections/${sectionId}`,
      delete: (courseId: string, sectionId: string) => `/courses/${courseId}/sections/${sectionId}`,
      reorder: (courseId: string) => `/courses/${courseId}/sections/reorder`,
    },
    lessons: {
      detail: (courseId: string, sectionId: string, lessonId: string) =>
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      create: (courseId: string, sectionId: string) =>
        `/courses/${courseId}/sections/${sectionId}/lessons`,
      update: (courseId: string, sectionId: string, lessonId: string) =>
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      delete: (courseId: string, sectionId: string, lessonId: string) =>
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      duplicate: (courseId: string, sectionId: string, lessonId: string) =>
        `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/duplicate`,
      reorder: (courseId: string, sectionId: string) =>
        `/courses/${courseId}/sections/${sectionId}/lessons/reorder`,
    },
  },

  // Badges
  badges: {
    list: '/badges',
    detail: (id: string) => `/badges/${id}`,
    create: '/badges',
    update: (id: string) => `/badges/${id}`,
    delete: (id: string) => `/badges/${id}`,
    earnedStudents: (id: string) => `/badges/${id}/earned-students`,
  },

  // Shop
  shop: {
    list: '/shop',
    detail: (id: string) => `/shop/${id}`,
    create: '/shop',
    update: (id: string) => `/shop/${id}`,
    delete: (id: string) => `/shop/${id}`,
    toggle: (id: string) => `/shop/${id}/toggle`,
  },

  // Dashboard
  dashboard: {
    stats: '/admin/dashboard/stats',
    activity: '/admin/dashboard/activity',
    recentlyViewed: '/admin/dashboard/recently-viewed',
    courseCompletion: '/admin/dashboard/course-completion',
  },

  // Settings
  settings: {
    gamification: '/settings/gamification',
    features: '/settings/features',
    featureToggle: (key: string) => `/settings/features/${key}`,
    system: '/settings/system',
    storage: '/settings/storage',
  },
} as const

// Type helper for endpoint functions
export type EndpointFn<T extends (...args: never[]) => string> = T
