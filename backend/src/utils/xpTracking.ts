import { Types, UpdateQuery } from 'mongoose'
import { StudentProfile, type IStudentProfile } from '../modules/users/studentProfile.model'

export interface AwardXpOptions {
  studentId: string | Types.ObjectId
  amount: number
  source: string
  sourceId?: string | Types.ObjectId
  updateLastActivity?: boolean
}

export async function awardXp(options: AwardXpOptions): Promise<void> {
  const { studentId, amount, source, sourceId, updateLastActivity = true } = options

  if (amount <= 0) return

  const updateData: UpdateQuery<IStudentProfile> = {
    $inc: { totalXp: amount },
    $push: {
      xpHistory: {
        $each: [{
          amount,
          source,
          sourceId: sourceId ? new Types.ObjectId(sourceId as string) : undefined,
          earnedAt: new Date(),
        }],
        $position: 0,
        $slice: 100,
      }
    }
  }

  if (updateLastActivity) {
    updateData.lastActivityDate = new Date()
  }

  await StudentProfile.findOneAndUpdate(
    { userId: new Types.ObjectId(studentId as string) },
    updateData
  )
}
