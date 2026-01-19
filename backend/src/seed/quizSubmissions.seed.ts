import { QuizSubmission } from '../modules/progress/quizSubmission.model'
import { Quiz } from '../modules/quizzes/quizzes.model'
import { Lesson } from '../modules/lessons/lessons.model'
import { Section } from '../modules/sections/sections.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'
import type { SeededCourses } from './courses.seed'

export async function seedQuizSubmissions(
  users: SeededUsers,
  courses: SeededCourses
): Promise<void> {
  logger.info('Seeding quiz submissions...')

  // Get JavaScript quizzes
  const jsSections = await Section.find({ courseId: courses.javascript })
  const jsLessons = await Lesson.find({
    sectionId: { $in: jsSections.map((s) => s._id) },
  })
  const jsQuizzes = await Quiz.find({
    lessonId: { $in: jsLessons.map((l) => l._id) },
  })

  // Get Python quizzes
  const pySections = await Section.find({ courseId: courses.python })
  const pyLessons = await Lesson.find({
    sectionId: { $in: pySections.map((s) => s._id) },
  })
  const pyQuizzes = await Quiz.find({
    lessonId: { $in: pyLessons.map((l) => l._id) },
  })

  const submissions = []

  // Helper function to create timestamps
  const daysAgo = (days: number, hours: number = 0) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000)

  // ==========================================
  // HIGH PERFORMER: liam_js - Perfect scores
  // ==========================================
  if (jsQuizzes.length > 0) {
    const liamId = users.students[2] // liam_js

    // Quiz 1: Hello World Quiz - Perfect score (2/2)
    const quiz1 = jsQuizzes[0]
    const lesson1 = await Lesson.findById(quiz1.lessonId)
    if (lesson1) {
      submissions.push({
        studentId: liamId,
        lessonId: lesson1._id,
        quizId: quiz1._id,
        answers: [
          {
            questionId: quiz1.questions[0].id,
            selectedIndex: 1, // console.log() - CORRECT
            isCorrect: true,
          },
          {
            questionId: quiz1.questions[1].id,
            selectedIndex: 0, // True - CORRECT
            isCorrect: true,
          },
        ],
        score: 2,
        maxScore: 2,
        passed: true,
        xpEarned: quiz1.xpReward,
        submittedAt: daysAgo(6, 1),
      })
    }

    // Quiz 2: Strings Quiz - Perfect score (2/2)
    if (jsQuizzes.length > 1) {
      const quiz2 = jsQuizzes[1]
      const lesson2 = await Lesson.findById(quiz2.lessonId)
      if (lesson2) {
        submissions.push({
          studentId: liamId,
          lessonId: lesson2._id,
          quizId: quiz2._id,
          answers: [
            {
              questionId: quiz2.questions[0].id,
              selectedIndex: 2, // Backticks - CORRECT
              isCorrect: true,
            },
            {
              questionId: quiz2.questions[1].id,
              selectedIndex: 1, // 5 - CORRECT
              isCorrect: true,
            },
          ],
          score: 2,
          maxScore: 2,
          passed: true,
          xpEarned: quiz2.xpReward,
          submittedAt: daysAgo(4, 2),
        })
      }
    }
  }

  // ==========================================
  // STRUGGLING STUDENT: emma_dev - Low scores, retakes
  // ==========================================
  if (jsQuizzes.length > 0) {
    const emmaId = users.students[1] // emma_dev

    // Quiz 1: Hello World Quiz - FAIL attempt 1 (1/2)
    const quiz1 = jsQuizzes[0]
    const lesson1 = await Lesson.findById(quiz1.lessonId)
    if (lesson1) {
      submissions.push({
        studentId: emmaId,
        lessonId: lesson1._id,
        quizId: quiz1._id,
        answers: [
          {
            questionId: quiz1.questions[0].id,
            selectedIndex: 0, // print() - WRONG
            isCorrect: false,
          },
          {
            questionId: quiz1.questions[1].id,
            selectedIndex: 0, // True - CORRECT
            isCorrect: true,
          },
        ],
        score: 1,
        maxScore: 2,
        passed: false,
        xpEarned: 0,
        submittedAt: daysAgo(7, 2),
      })

      // Quiz 1: PASS attempt 2 (2/2)
      submissions.push({
        studentId: emmaId,
        lessonId: lesson1._id,
        quizId: quiz1._id,
        answers: [
          {
            questionId: quiz1.questions[0].id,
            selectedIndex: 1, // console.log() - CORRECT
            isCorrect: true,
          },
          {
            questionId: quiz1.questions[1].id,
            selectedIndex: 0, // True - CORRECT
            isCorrect: true,
          },
        ],
        score: 2,
        maxScore: 2,
        passed: true,
        xpEarned: quiz1.xpReward,
        submittedAt: daysAgo(7, 1),
      })
    }
  }

  // ==========================================
  // AVERAGE STUDENT: noah_code - Pass on second try
  // ==========================================
  if (jsQuizzes.length > 1) {
    const noahId = users.students[4] // noah_code

    // Quiz 2: Strings Quiz - FAIL attempt 1 (1/2)
    const quiz2 = jsQuizzes[1]
    const lesson2 = await Lesson.findById(quiz2.lessonId)
    if (lesson2) {
      submissions.push({
        studentId: noahId,
        lessonId: lesson2._id,
        quizId: quiz2._id,
        answers: [
          {
            questionId: quiz2.questions[0].id,
            selectedIndex: 1, // Double quotes - WRONG
            isCorrect: false,
          },
          {
            questionId: quiz2.questions[1].id,
            selectedIndex: 1, // 5 - CORRECT
            isCorrect: true,
          },
        ],
        score: 1,
        maxScore: 2,
        passed: false,
        xpEarned: 0,
        submittedAt: daysAgo(5, 5),
      })

      // Quiz 2: PASS attempt 2 (2/2)
      submissions.push({
        studentId: noahId,
        lessonId: lesson2._id,
        quizId: quiz2._id,
        answers: [
          {
            questionId: quiz2.questions[0].id,
            selectedIndex: 2, // Backticks - CORRECT
            isCorrect: true,
          },
          {
            questionId: quiz2.questions[1].id,
            selectedIndex: 1, // 5 - CORRECT
            isCorrect: true,
          },
        ],
        score: 2,
        maxScore: 2,
        passed: true,
        xpEarned: quiz2.xpReward,
        submittedAt: daysAgo(5, 4),
      })
    }
  }

  // ==========================================
  // HIGH PERFORMER: sophia_js - Perfect scores
  // ==========================================
  if (jsQuizzes.length > 2) {
    const sophiaId = users.students[7] // sophia_js

    // Quiz 3: If/Else Quiz - Perfect score (2/2)
    const quiz3 = jsQuizzes[2]
    const lesson3 = await Lesson.findById(quiz3.lessonId)
    if (lesson3) {
      submissions.push({
        studentId: sophiaId,
        lessonId: lesson3._id,
        quizId: quiz3._id,
        answers: [
          {
            questionId: quiz3.questions[0].id,
            selectedIndex: 0, // "yes" - CORRECT
            isCorrect: true,
          },
          {
            questionId: quiz3.questions[1].id,
            selectedIndex: 1, // False - CORRECT
            isCorrect: true,
          },
        ],
        score: 2,
        maxScore: 2,
        passed: true,
        xpEarned: quiz3.xpReward,
        submittedAt: daysAgo(2, 3),
      })
    }

    // Quiz 4: Functions Quiz - Perfect score (3/3)
    if (jsQuizzes.length > 3) {
      const quiz4 = jsQuizzes[3]
      const lesson4 = await Lesson.findById(quiz4.lessonId)
      if (lesson4) {
        submissions.push({
          studentId: sophiaId,
          lessonId: lesson4._id,
          quizId: quiz4._id,
          answers: [
            {
              questionId: quiz4.questions[0].id,
              selectedIndex: 0, // function myFunc() {} - CORRECT
              isCorrect: true,
            },
            {
              questionId: quiz4.questions[1].id,
              selectedIndex: 0, // True - CORRECT
              isCorrect: true,
            },
            {
              questionId: quiz4.questions[2].id,
              selectedIndex: 1, // test() - CORRECT
              isCorrect: true,
            },
          ],
          score: 3,
          maxScore: 3,
          passed: true,
          xpEarned: quiz4.xpReward,
          submittedAt: daysAgo(1, 1),
        })
      }
    }
  }

  // ==========================================
  // AVERAGE STUDENT: alex_coder - Decent scores
  // ==========================================
  if (jsQuizzes.length > 0) {
    const alexId = users.students[0] // alex_coder

    // Quiz 1: Hello World Quiz - Pass first try (2/2)
    const quiz1 = jsQuizzes[0]
    const lesson1 = await Lesson.findById(quiz1.lessonId)
    if (lesson1) {
      submissions.push({
        studentId: alexId,
        lessonId: lesson1._id,
        quizId: quiz1._id,
        answers: [
          {
            questionId: quiz1.questions[0].id,
            selectedIndex: 1, // console.log() - CORRECT
            isCorrect: true,
          },
          {
            questionId: quiz1.questions[1].id,
            selectedIndex: 0, // True - CORRECT
            isCorrect: true,
          },
        ],
        score: 2,
        maxScore: 2,
        passed: true,
        xpEarned: quiz1.xpReward,
        submittedAt: daysAgo(6, 9),
      })
    }
  }

  // ==========================================
  // PYTHON STUDENTS
  // ==========================================

  // HIGH PERFORMER: ava_tech - Perfect Python scores
  if (pyQuizzes.length > 0) {
    const avaId = users.students[5] // ava_tech

    // Python Quiz 1: Python Basics Quiz - Perfect (2/2)
    const pyQuiz1 = pyQuizzes[0]
    const pyLesson1 = await Lesson.findById(pyQuiz1.lessonId)
    if (pyLesson1) {
      submissions.push({
        studentId: avaId,
        lessonId: pyLesson1._id,
        quizId: pyQuiz1._id,
        answers: [
          {
            questionId: pyQuiz1.questions[0].id,
            selectedIndex: 0, // True - CORRECT
            isCorrect: true,
          },
          {
            questionId: pyQuiz1.questions[1].id,
            selectedIndex: 1, // print() - CORRECT
            isCorrect: true,
          },
        ],
        score: 2,
        maxScore: 2,
        passed: true,
        xpEarned: pyQuiz1.xpReward,
        submittedAt: daysAgo(5, 3),
      })
    }

    // Python Quiz 2: Numbers Quiz - Perfect (2/2)
    if (pyQuizzes.length > 1) {
      const pyQuiz2 = pyQuizzes[1]
      const pyLesson2 = await Lesson.findById(pyQuiz2.lessonId)
      if (pyLesson2) {
        submissions.push({
          studentId: avaId,
          lessonId: pyLesson2._id,
          quizId: pyQuiz2._id,
          answers: [
            {
              questionId: pyQuiz2.questions[0].id,
              selectedIndex: 1, // 3 - CORRECT
              isCorrect: true,
            },
            {
              questionId: pyQuiz2.questions[1].id,
              selectedIndex: 1, // 16 - CORRECT
              isCorrect: true,
            },
          ],
          score: 2,
          maxScore: 2,
          passed: true,
          xpEarned: pyQuiz2.xpReward,
          submittedAt: daysAgo(4, 2),
        })
      }
    }
  }

  // STRUGGLING STUDENT: olivia_py - Multiple attempts
  if (pyQuizzes.length > 0) {
    const oliviaId = users.students[3] // olivia_py

    // Python Quiz 1: Python Basics Quiz - FAIL attempt 1 (1/2)
    const pyQuiz1 = pyQuizzes[0]
    const pyLesson1 = await Lesson.findById(pyQuiz1.lessonId)
    if (pyLesson1) {
      submissions.push({
        studentId: oliviaId,
        lessonId: pyLesson1._id,
        quizId: pyQuiz1._id,
        answers: [
          {
            questionId: pyQuiz1.questions[0].id,
            selectedIndex: 1, // False - WRONG
            isCorrect: false,
          },
          {
            questionId: pyQuiz1.questions[1].id,
            selectedIndex: 1, // print() - CORRECT
            isCorrect: true,
          },
        ],
        score: 1,
        maxScore: 2,
        passed: false,
        xpEarned: 0,
        submittedAt: daysAgo(6, 5),
      })

      // Python Quiz 1: PASS attempt 2 (2/2)
      submissions.push({
        studentId: oliviaId,
        lessonId: pyLesson1._id,
        quizId: pyQuiz1._id,
        answers: [
          {
            questionId: pyQuiz1.questions[0].id,
            selectedIndex: 0, // True - CORRECT
            isCorrect: true,
          },
          {
            questionId: pyQuiz1.questions[1].id,
            selectedIndex: 1, // print() - CORRECT
            isCorrect: true,
          },
        ],
        score: 2,
        maxScore: 2,
        passed: true,
        xpEarned: pyQuiz1.xpReward,
        submittedAt: daysAgo(6, 4),
      })
    }
  }

  // AVERAGE STUDENT: james_py - Pass first try
  if (pyQuizzes.length > 2) {
    const jamesId = users.students[8] // james_py

    // Python Quiz 3: If/Elif Quiz - Pass (2/2)
    const pyQuiz3 = pyQuizzes[2]
    const pyLesson3 = await Lesson.findById(pyQuiz3.lessonId)
    if (pyLesson3) {
      submissions.push({
        studentId: jamesId,
        lessonId: pyLesson3._id,
        quizId: pyQuiz3._id,
        answers: [
          {
            questionId: pyQuiz3.questions[0].id,
            selectedIndex: 0, // True - CORRECT
            isCorrect: true,
          },
          {
            questionId: pyQuiz3.questions[1].id,
            selectedIndex: 2, // elif - CORRECT
            isCorrect: true,
          },
        ],
        score: 2,
        maxScore: 2,
        passed: true,
        xpEarned: pyQuiz3.xpReward,
        submittedAt: daysAgo(3, 5),
      })
    }
  }

  // Create all submissions
  await QuizSubmission.insertMany(submissions)

  logger.info(`Created ${submissions.length} quiz submissions`)
}
