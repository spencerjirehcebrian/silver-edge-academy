import { StudentProfile } from '../modules/users/studentProfile.model'
import { connectDB } from '../config/database'

export async function up() {
  console.log('Adding xpHistory field to StudentProfile...')

  const result = await StudentProfile.updateMany(
    { xpHistory: { $exists: false } },
    { $set: { xpHistory: [] } }
  )

  console.log(`Updated ${result.modifiedCount} profiles`)
}

export async function down() {
  await StudentProfile.updateMany({}, { $unset: { xpHistory: '' } })
}

// Run migration if called directly
if (import.meta.main) {
  try {
    await connectDB()
    console.log('Running migration: add-xp-history')
    await up()
    console.log('Migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}
