import mongoose from 'mongoose'
import { config } from '../config'
import { logger } from '../utils/logger'
import { seedUsers } from './users.seed'
import { seedCourses } from './courses.seed'
import { seedClasses } from './classes.seed'
import { seedProgress } from './progress.seed'
import { seedExerciseSubmissions } from './exerciseSubmissions.seed'
import { seedQuizSubmissions } from './quizSubmissions.seed'
import { seedShop } from './shop.seed'
import { seedPurchases } from './purchases.seed'
import { seedBadges, seedStudentBadges } from './badges.seed'
import { seedAttendance } from './attendance.seed'
import { seedHelpRequests } from './helpRequests.seed'
import { seedSandboxProjects } from './sandboxProjects.seed'
import { seedNotifications } from './notifications.seed'

// Parse CLI arguments
const args = process.argv.slice(2)
const forceOverride = args.includes('--force') || args.includes('-f')

async function seed() {
  try {
    logger.info('Connecting to MongoDB...')
    await mongoose.connect(config.db.uri)
    logger.info('Connected to MongoDB')

    // Check if database already has data
    if (!forceOverride) {
      const userCount = await mongoose.connection.db?.collection('users').countDocuments()
      if (userCount && userCount > 0) {
        logger.warn('Database already contains data. Skipping seed.')
        logger.info('To reseed, drop the database first OR use --force flag')
        await mongoose.disconnect()
        process.exit(0)
      }
    } else {
      logger.warn('Force override enabled - seeding without database check')
    }

    logger.info('Starting seed process...')

    // Seed in order due to dependencies
    const users = await seedUsers()
    const courses = await seedCourses(users.admin)
    const classes = await seedClasses(users, courses)
    await seedProgress(users, courses)
    await seedExerciseSubmissions(users, courses)
    await seedQuizSubmissions(users, courses)
    await seedShop(users.admin)
    await seedPurchases(users)

    // Seed gamification and operational data
    const badges = await seedBadges(users.admin)
    await seedStudentBadges(users, badges)
    await seedAttendance(users, classes)
    await seedHelpRequests(users, courses, classes)
    await seedSandboxProjects(users)
    await seedNotifications(users, badges)

    logger.info('='.repeat(50))
    logger.info('Seed completed successfully!')
    logger.info('='.repeat(50))
    logger.info('')
    logger.info('Seeded data includes:')
    logger.info('  - Users (admin, teachers, students with preferences, 5 parents)')
    logger.info('  - Courses (JavaScript: 12 lessons, 9 exercises, 6 quizzes)')
    logger.info('            (Python: 10 lessons, 8 exercises, 5 quizzes)')
    logger.info('  - Classes (JavaScript Beginners & Python Adventures)')
    logger.info('  - Student progress (realistic performance patterns)')
    logger.info('  - Exercise submissions (25 submissions with code and results)')
    logger.info('  - Quiz submissions (15 quiz attempts with scores)')
    logger.info('  - Shop items (avatar packs, UI themes, editor themes, teacher rewards)')
    logger.info('  - Purchases (8 purchases by high-level students)')
    logger.info('  - Badges and student badge awards')
    logger.info('  - Attendance records (last 3 weeks)')
    logger.info('  - Help requests (pending, in-progress, resolved)')
    logger.info('  - Sandbox projects (student coding projects)')
    logger.info('  - Notifications (various types)')
    logger.info('')
    logger.info('Default credentials:')
    logger.info('  Admin:    admin@silveredge.com / password123')
    logger.info('  Teacher1: teacher1@silveredge.com / password123')
    logger.info('  Teacher2: teacher2@silveredge.com / password123')
    logger.info('  Students: <username> / password123')
    logger.info('            (e.g., alex_coder, emma_dev, ...)')
    logger.info('  Parents:  parent1-5@silveredge.com / password123')
    logger.info('')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    logger.error({ error }, 'Seed failed')
    await mongoose.disconnect()
    process.exit(1)
  }
}

// Run if executed directly
seed()
