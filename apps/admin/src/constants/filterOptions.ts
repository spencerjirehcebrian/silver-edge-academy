/**
 * Shared filter options used across list pages.
 */

export const STATUS_OPTIONS = [
  { id: '', name: 'All Status' },
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
] as const

export const CLASS_STATUS_OPTIONS = [
  { id: '', name: 'All Status' },
  { id: 'active', name: 'Active' },
  { id: 'draft', name: 'Draft' },
  { id: 'archived', name: 'Archived' },
] as const

export const LANGUAGE_OPTIONS = [
  { id: '', name: 'All Languages' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
] as const

export const COURSE_STATUS_OPTIONS = [
  { id: '', name: 'All Statuses' },
  { id: 'published', name: 'Published' },
  { id: 'draft', name: 'Draft' },
] as const

export const CLASS_OPTIONS = [
  { id: '', name: 'All Classes' },
  { id: 'Class 5A', name: 'Class 5A' },
  { id: 'Class 5B', name: 'Class 5B' },
  { id: 'Class 6A', name: 'Class 6A' },
  { id: 'Class 6B', name: 'Class 6B' },
] as const

// Type helpers
export type StatusOption = (typeof STATUS_OPTIONS)[number]
export type ClassStatusOption = (typeof CLASS_STATUS_OPTIONS)[number]
export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number]
export type CourseStatusOption = (typeof COURSE_STATUS_OPTIONS)[number]
export type ClassOption = (typeof CLASS_OPTIONS)[number]
