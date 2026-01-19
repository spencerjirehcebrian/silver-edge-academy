import type { StudentAuthUser } from '@/types/student'

// Mock students for testing
export const mockStudents: (StudentAuthUser & { password: string })[] = [
  {
    id: 'student-1',
    username: 'alex_coder',
    password: 'student123',
    displayName: 'Alex Coder',
    email: 'alex@example.com',
    role: 'student',
    avatarId: 'robot-avatar',
    status: 'active',
    emailVerified: true,
    parentIds: ['parent-1'],
    classId: 'class-1',
    className: 'Morning Coders',
    currentLevel: 5,
    totalXp: 680,
    currencyBalance: 350,
    currentStreakDays: 5,
    lastActivityDate: new Date().toISOString(),
    preferences: {
      theme: 'light',
      editorTheme: 'dracula',
    },
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'student-2',
    username: 'maya_dev',
    password: 'student123',
    displayName: 'Maya Dev',
    email: 'maya@example.com',
    role: 'student',
    avatarId: 'wizard-avatar',
    status: 'active',
    emailVerified: true,
    parentIds: ['parent-2'],
    classId: 'class-1',
    className: 'Morning Coders',
    currentLevel: 12,
    totalXp: 2450,
    currencyBalance: 780,
    currentStreakDays: 15,
    lastActivityDate: new Date().toISOString(),
    preferences: {
      theme: 'dark',
      editorTheme: 'github-dark',
    },
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'student-3',
    username: 'newbie',
    password: 'student123',
    displayName: 'New Student',
    email: 'newbie@example.com',
    role: 'student',
    avatarId: null,
    status: 'active',
    emailVerified: false,
    parentIds: [],
    classId: 'class-2',
    className: 'Afternoon Explorers',
    currentLevel: 1,
    totalXp: 25,
    currencyBalance: 50,
    currentStreakDays: 1,
    lastActivityDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Token storage for mock auth
const mockTokens = new Map<string, string>()

export function generateMockToken(userId: string): string {
  const token = `mock-token-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  mockTokens.set(token, userId)
  return token
}

export function validateMockToken(token: string): string | null {
  return mockTokens.get(token) || null
}

export function invalidateMockToken(token: string): void {
  mockTokens.delete(token)
}
