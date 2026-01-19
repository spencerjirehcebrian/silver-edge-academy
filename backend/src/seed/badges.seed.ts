import { Types } from 'mongoose'
import { Badge, StudentBadge } from '../modules/badges/badges.model'
import { StudentProfile } from '../modules/users/studentProfile.model'
import { LessonProgress } from '../modules/progress/lessonProgress.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'

export interface SeededBadges {
  firstLogin: Types.ObjectId
  firstLesson: Types.ObjectId
  firstExercise: Types.ObjectId
  firstQuiz: Types.ObjectId
  lessons5: Types.ObjectId
  lessons10: Types.ObjectId
  lessons25: Types.ObjectId
  exercises5: Types.ObjectId
  exercises10: Types.ObjectId
  xp500: Types.ObjectId
  xp1000: Types.ObjectId
  xp2500: Types.ObjectId
  level5: Types.ObjectId
  level10: Types.ObjectId
  streak7: Types.ObjectId
}

export async function seedBadges(_adminId: Types.ObjectId): Promise<SeededBadges> {
  logger.info('Seeding badges...')

  const badges = [
    // First-time achievements
    {
      name: 'First Steps',
      description: 'Welcome to Silver Edge Academy!',
      iconName: 'footprints',
      gradientFrom: '#3b82f6',
      gradientTo: '#8b5cf6',
      triggerType: 'first_login',
      isActive: true,
    },
    {
      name: 'Code Voyager',
      description: 'Complete your first lesson',
      iconName: 'rocket',
      gradientFrom: '#10b981',
      gradientTo: '#06b6d4',
      triggerType: 'first_lesson',
      isActive: true,
    },
    {
      name: 'Problem Solver',
      description: 'Pass your first exercise',
      iconName: 'puzzle',
      gradientFrom: '#f59e0b',
      gradientTo: '#f97316',
      triggerType: 'first_exercise',
      isActive: true,
    },
    {
      name: 'Quiz Master',
      description: 'Complete your first quiz',
      iconName: 'brain',
      gradientFrom: '#8b5cf6',
      gradientTo: '#a855f7',
      triggerType: 'first_quiz',
      isActive: true,
    },
    {
      name: 'Creative Coder',
      description: 'Create your first sandbox project',
      iconName: 'palette',
      gradientFrom: '#ec4899',
      gradientTo: '#f43f5e',
      triggerType: 'first_sandbox',
      isActive: true,
    },

    // Lesson completion milestones
    {
      name: 'Learning Streak',
      description: 'Complete 5 lessons',
      iconName: 'book-open',
      gradientFrom: '#06b6d4',
      gradientTo: '#3b82f6',
      triggerType: 'lessons_completed',
      triggerValue: 5,
      isActive: true,
    },
    {
      name: 'Knowledge Seeker',
      description: 'Complete 10 lessons',
      iconName: 'book',
      gradientFrom: '#3b82f6',
      gradientTo: '#6366f1',
      triggerType: 'lessons_completed',
      triggerValue: 10,
      isActive: true,
    },
    {
      name: 'Learning Champion',
      description: 'Complete 25 lessons',
      iconName: 'trophy',
      gradientFrom: '#f59e0b',
      gradientTo: '#eab308',
      triggerType: 'lessons_completed',
      triggerValue: 25,
      isActive: true,
    },
    {
      name: 'Master Student',
      description: 'Complete 50 lessons',
      iconName: 'crown',
      gradientFrom: '#fbbf24',
      gradientTo: '#f59e0b',
      triggerType: 'lessons_completed',
      triggerValue: 50,
      isActive: true,
    },

    // Exercise completion milestones
    {
      name: 'Code Warrior',
      description: 'Pass 5 exercises',
      iconName: 'sword',
      gradientFrom: '#10b981',
      gradientTo: '#14b8a6',
      triggerType: 'exercises_passed',
      triggerValue: 5,
      isActive: true,
    },
    {
      name: 'Algorithm Expert',
      description: 'Pass 10 exercises',
      iconName: 'terminal',
      gradientFrom: '#14b8a6',
      gradientTo: '#06b6d4',
      triggerType: 'exercises_passed',
      triggerValue: 10,
      isActive: true,
    },
    {
      name: 'Coding Ninja',
      description: 'Pass 25 exercises',
      iconName: 'ninja',
      gradientFrom: '#1f2937',
      gradientTo: '#374151',
      triggerType: 'exercises_passed',
      triggerValue: 25,
      isActive: true,
    },

    // Course completion milestones
    {
      name: 'Course Completer',
      description: 'Finish your first course',
      iconName: 'graduation-cap',
      gradientFrom: '#8b5cf6',
      gradientTo: '#a855f7',
      triggerType: 'courses_finished',
      triggerValue: 1,
      isActive: true,
    },
    {
      name: 'Polyglot Programmer',
      description: 'Finish 2 courses',
      iconName: 'code',
      gradientFrom: '#6366f1',
      gradientTo: '#8b5cf6',
      triggerType: 'courses_finished',
      triggerValue: 2,
      isActive: true,
    },

    // Login streak badges
    {
      name: 'Committed Learner',
      description: '7-day login streak',
      iconName: 'fire',
      gradientFrom: '#f97316',
      gradientTo: '#f59e0b',
      triggerType: 'login_streak',
      triggerValue: 7,
      isActive: true,
    },
    {
      name: 'Dedicated Student',
      description: '14-day login streak',
      iconName: 'flame',
      gradientFrom: '#ef4444',
      gradientTo: '#f97316',
      triggerType: 'login_streak',
      triggerValue: 14,
      isActive: true,
    },
    {
      name: 'Unstoppable Force',
      description: '30-day login streak',
      iconName: 'bolt',
      gradientFrom: '#dc2626',
      gradientTo: '#ef4444',
      triggerType: 'login_streak',
      triggerValue: 30,
      isActive: true,
    },

    // XP milestones
    {
      name: 'XP Hunter',
      description: 'Earn 500 XP',
      iconName: 'star',
      gradientFrom: '#22c55e',
      gradientTo: '#10b981',
      triggerType: 'xp_earned',
      triggerValue: 500,
      isActive: true,
    },
    {
      name: 'XP Master',
      description: 'Earn 1000 XP',
      iconName: 'sparkles',
      gradientFrom: '#06b6d4',
      gradientTo: '#0ea5e9',
      triggerType: 'xp_earned',
      triggerValue: 1000,
      isActive: true,
    },
    {
      name: 'XP Legend',
      description: 'Earn 2500 XP',
      iconName: 'stars',
      gradientFrom: '#8b5cf6',
      gradientTo: '#a855f7',
      triggerType: 'xp_earned',
      triggerValue: 2500,
      isActive: true,
    },
    {
      name: 'XP God',
      description: 'Earn 5000 XP',
      iconName: 'infinity',
      gradientFrom: '#f59e0b',
      gradientTo: '#fbbf24',
      triggerType: 'xp_earned',
      triggerValue: 5000,
      isActive: true,
    },

    // Level milestones
    {
      name: 'Rising Star',
      description: 'Reach level 5',
      iconName: 'trending-up',
      gradientFrom: '#10b981',
      gradientTo: '#14b8a6',
      triggerType: 'level_reached',
      triggerValue: 5,
      isActive: true,
    },
    {
      name: 'Elite Coder',
      description: 'Reach level 10',
      iconName: 'shield',
      gradientFrom: '#3b82f6',
      gradientTo: '#6366f1',
      triggerType: 'level_reached',
      triggerValue: 10,
      isActive: true,
    },
    {
      name: 'Legendary Programmer',
      description: 'Reach level 15',
      iconName: 'diamond',
      gradientFrom: '#8b5cf6',
      gradientTo: '#a855f7',
      triggerType: 'level_reached',
      triggerValue: 15,
      isActive: true,
    },
    {
      name: 'Coding Deity',
      description: 'Reach level 20',
      iconName: 'gem',
      gradientFrom: '#f59e0b',
      gradientTo: '#fbbf24',
      triggerType: 'level_reached',
      triggerValue: 20,
      isActive: true,
    },
  ]

  const createdBadges = await Badge.insertMany(badges)
  logger.info(`Created ${createdBadges.length} badges`)

  // Return specific badge IDs for student badge assignment
  const badgeMap: SeededBadges = {
    firstLogin: createdBadges[0]._id,
    firstLesson: createdBadges[1]._id,
    firstExercise: createdBadges[2]._id,
    firstQuiz: createdBadges[3]._id,
    lessons5: createdBadges[5]._id,
    lessons10: createdBadges[6]._id,
    lessons25: createdBadges[7]._id,
    exercises5: createdBadges[9]._id,
    exercises10: createdBadges[10]._id,
    xp500: createdBadges[17]._id,
    xp1000: createdBadges[18]._id,
    xp2500: createdBadges[19]._id,
    level5: createdBadges[21]._id,
    level10: createdBadges[22]._id,
    streak7: createdBadges[14]._id,
  }

  return badgeMap
}

export async function seedStudentBadges(
  users: SeededUsers,
  badges: SeededBadges
): Promise<void> {
  logger.info('Seeding student badges...')

  const studentBadges = []

  // Award badges based on student progress
  for (const studentId of users.students) {
    const profile = await StudentProfile.findOne({ userId: studentId })
    if (!profile) continue

    const completedLessons = await LessonProgress.countDocuments({
      studentId,
      status: 'completed',
    })

    // Everyone gets first login and first lesson
    studentBadges.push(
      { studentId, badgeId: badges.firstLogin, earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { studentId, badgeId: badges.firstLesson, earnedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) }
    )

    // Award lesson completion badges
    if (completedLessons >= 5) {
      studentBadges.push({
        studentId,
        badgeId: badges.lessons5,
        earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      })
    }
    if (completedLessons >= 10) {
      studentBadges.push({
        studentId,
        badgeId: badges.lessons10,
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      })
    }

    // Award XP badges
    if (profile.totalXp >= 500) {
      studentBadges.push({
        studentId,
        badgeId: badges.xp500,
        earnedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      })
    }
    if (profile.totalXp >= 1000) {
      studentBadges.push({
        studentId,
        badgeId: badges.xp1000,
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      })
    }

    // Award level badges
    if (profile.currentLevel >= 5) {
      studentBadges.push({
        studentId,
        badgeId: badges.level5,
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      })
    }
    if (profile.currentLevel >= 10) {
      studentBadges.push({
        studentId,
        badgeId: badges.level10,
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      })
    }

    // Award streak badge for students with good streaks
    if (profile.currentStreakDays >= 7) {
      studentBadges.push({
        studentId,
        badgeId: badges.streak7,
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      })
    }
  }

  await StudentBadge.insertMany(studentBadges)
  logger.info(`Awarded ${studentBadges.length} badges to students`)
}
