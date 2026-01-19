import { Notification } from '../modules/notifications/notification.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'
import type { SeededBadges } from './badges.seed'

export async function seedNotifications(
  users: SeededUsers,
  badges: SeededBadges
): Promise<void> {
  logger.info('Seeding notifications...')

  const notifications = []
  const now = Date.now()
  const hoursInMs = 60 * 60 * 1000
  const daysInMs = 24 * hoursInMs

  // Badge earned notifications (recent, mostly unread)
  notifications.push(
    {
      userId: users.students[0],
      type: 'badge_earned',
      title: 'New Badge Earned!',
      message: 'Congratulations! You earned the "First Steps" badge for logging in.',
      read: true,
      data: { badgeId: badges.firstLogin.toString() },
      createdAt: new Date(now - 7 * daysInMs),
    },
    {
      userId: users.students[0],
      type: 'badge_earned',
      title: 'Badge Unlocked!',
      message: 'Amazing! You earned the "Code Voyager" badge for completing your first lesson.',
      read: true,
      data: { badgeId: badges.firstLesson.toString() },
      createdAt: new Date(now - 6 * daysInMs),
    },
    {
      userId: users.students[2],
      type: 'badge_earned',
      title: 'New Achievement!',
      message: 'Awesome! You earned the "XP Hunter" badge for reaching 500 XP.',
      read: false,
      data: { badgeId: badges.xp500.toString() },
      createdAt: new Date(now - 4 * daysInMs),
    },
    {
      userId: users.students[2],
      type: 'badge_earned',
      title: 'Badge Earned!',
      message: 'Great work! You earned the "Rising Star" badge for reaching level 5.',
      read: false,
      data: { badgeId: badges.level5.toString() },
      createdAt: new Date(now - 3 * daysInMs),
    },
    {
      userId: users.students[7],
      type: 'badge_earned',
      title: 'New Badge!',
      message: 'Incredible! You earned the "Elite Coder" badge for reaching level 10.',
      read: false,
      data: { badgeId: badges.level10.toString() },
      createdAt: new Date(now - 1 * daysInMs),
    }
  )

  // Level up notifications
  notifications.push(
    {
      userId: users.students[0],
      type: 'level_up',
      title: 'Level Up!',
      message: 'Congratulations! You reached level 5. Keep up the great work!',
      read: true,
      data: { newLevel: 5 },
      createdAt: new Date(now - 5 * daysInMs),
    },
    {
      userId: users.students[2],
      type: 'level_up',
      title: 'Level Up!',
      message: 'Amazing progress! You reached level 7. You\'re becoming a coding expert!',
      read: true,
      data: { newLevel: 7 },
      createdAt: new Date(now - 3 * daysInMs - 6 * hoursInMs),
    },
    {
      userId: users.students[5],
      type: 'level_up',
      title: 'Level Up!',
      message: 'Fantastic! You reached level 6. Keep learning and growing!',
      read: false,
      data: { newLevel: 6 },
      createdAt: new Date(now - 2 * daysInMs),
    },
    {
      userId: users.students[7],
      type: 'level_up',
      title: 'Level Up!',
      message: 'Incredible achievement! You reached level 8. You\'re doing amazing!',
      read: false,
      data: { newLevel: 8 },
      createdAt: new Date(now - 1 * daysInMs - 12 * hoursInMs),
    }
  )

  // Help response notifications
  notifications.push(
    {
      userId: users.students[1],
      type: 'help_response',
      title: 'Help Request Answered',
      message: 'Your teacher responded to your question about JavaScript comparisons.',
      read: true,
      data: { helpRequestId: 'placeholder' },
      createdAt: new Date(now - 3 * daysInMs - 2 * hoursInMs),
    },
    {
      userId: users.students[3],
      type: 'help_response',
      title: 'Teacher Replied',
      message: 'Your teacher has answered your question about the exercise.',
      read: true,
      data: { helpRequestId: 'placeholder' },
      createdAt: new Date(now - 4 * daysInMs),
    },
    {
      userId: users.students[4],
      type: 'help_response',
      title: 'Help Request Answered',
      message: 'Your teacher explained the difference between let and const.',
      read: true,
      data: { helpRequestId: 'placeholder' },
      createdAt: new Date(now - 5 * daysInMs - 1 * hoursInMs),
    },
    {
      userId: users.students[6],
      type: 'help_response',
      title: 'Teacher Replied',
      message: 'Your teacher has answered your Python question.',
      read: false,
      data: { helpRequestId: 'placeholder' },
      createdAt: new Date(now - 3 * daysInMs - 3 * hoursInMs),
    },
    {
      userId: users.students[8],
      type: 'help_response',
      title: 'Help Request Answered',
      message: 'Your teacher explained what a string is in Python.',
      read: false,
      data: { helpRequestId: 'placeholder' },
      createdAt: new Date(now - 4 * daysInMs - 2 * hoursInMs),
    }
  )

  // Streak notifications
  notifications.push(
    {
      userId: users.students[0],
      type: 'streak',
      title: 'Streak Milestone!',
      message: 'You\'re on a 3-day learning streak! Keep it going!',
      read: true,
      data: { streakDays: 3 },
      createdAt: new Date(now - 4 * daysInMs),
    },
    {
      userId: users.students[2],
      type: 'streak',
      title: 'Streak Achievement!',
      message: 'Amazing! You\'ve maintained a 5-day learning streak!',
      read: true,
      data: { streakDays: 5 },
      createdAt: new Date(now - 2 * daysInMs - 12 * hoursInMs),
    },
    {
      userId: users.students[7],
      type: 'streak',
      title: 'Incredible Streak!',
      message: 'Wow! You\'re on a 7-day learning streak! Keep up the dedication!',
      read: false,
      data: { streakDays: 7 },
      createdAt: new Date(now - 1 * daysInMs - 6 * hoursInMs),
    }
  )

  // General notifications
  notifications.push(
    {
      userId: users.students[0],
      type: 'general',
      title: 'Welcome to Silver Edge Academy!',
      message: 'Start your coding journey today. Complete your first lesson to earn a badge!',
      read: true,
      data: {},
      createdAt: new Date(now - 7 * daysInMs - 12 * hoursInMs),
    },
    {
      userId: users.students[3],
      type: 'general',
      title: 'New Lesson Available',
      message: 'A new lesson on Variables is now available in your JavaScript course!',
      read: true,
      data: {},
      createdAt: new Date(now - 6 * daysInMs),
    },
    {
      userId: users.students[5],
      type: 'general',
      title: 'Keep Learning!',
      message: 'You\'re making great progress! Try completing another lesson this week.',
      read: false,
      data: {},
      createdAt: new Date(now - 2 * daysInMs - 8 * hoursInMs),
    },
    {
      userId: users.students[6],
      type: 'general',
      title: 'Welcome to Your Python Class!',
      message: 'Your teacher has started a new Python Adventures class. Check it out!',
      read: true,
      data: {},
      createdAt: new Date(now - 5 * daysInMs),
    },
    {
      userId: users.students[9],
      type: 'general',
      title: 'Great Progress!',
      message: 'You\'ve completed several lessons this week. Keep up the amazing work!',
      read: false,
      data: {},
      createdAt: new Date(now - 1 * daysInMs - 3 * hoursInMs),
    }
  )

  await Notification.insertMany(notifications)
  logger.info(`Created ${notifications.length} notifications`)
}
