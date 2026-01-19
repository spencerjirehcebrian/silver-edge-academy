import { ExerciseSubmission } from '../modules/progress/exerciseSubmission.model'
import { Exercise } from '../modules/exercises/exercises.model'
import { Lesson } from '../modules/lessons/lessons.model'
import { Section } from '../modules/sections/sections.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'
import type { SeededCourses } from './courses.seed'

export async function seedExerciseSubmissions(
  users: SeededUsers,
  courses: SeededCourses
): Promise<void> {
  logger.info('Seeding exercise submissions...')

  // Get JavaScript exercises
  const jsSections = await Section.find({ courseId: courses.javascript })
  const jsLessons = await Lesson.find({
    sectionId: { $in: jsSections.map((s) => s._id) },
  })
  const jsExercises = await Exercise.find({
    lessonId: { $in: jsLessons.map((l) => l._id) },
  })

  // Get Python exercises
  const pySections = await Section.find({ courseId: courses.python })
  const pyLessons = await Lesson.find({
    sectionId: { $in: pySections.map((s) => s._id) },
  })
  const pyExercises = await Exercise.find({
    lessonId: { $in: pyLessons.map((l) => l._id) },
  })

  // Student profiles for realistic patterns
  // Struggling: emma_dev (JS), william_dev (JS), olivia_py (Python)
  // Average: noah_code (JS), alex_coder (JS), james_py (Python), isabella_code (JS)
  // High performers: liam_js (JS), sophia_js (JS), ava_tech (Python)

  const submissions = []

  // Helper function to create timestamps
  const daysAgo = (days: number, hours: number = 0) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000)

  // ==========================================
  // HIGH PERFORMER: liam_js - Passes first try
  // ==========================================
  if (jsExercises.length > 0) {
    const liamId = users.students[2] // liam_js

    // Exercise 1: Print Your Name - PASS first try
    const ex1 = jsExercises[0]
    submissions.push({
      studentId: liamId,
      exerciseId: ex1._id,
      code: 'console.log("Liam");',
      passed: true,
      testResults: [
        {
          testCaseId: ex1.testCases[0].id,
          passed: true,
          actualOutput: 'Liam',
        },
      ],
      xpEarned: ex1.xpReward,
      submittedAt: daysAgo(6, 2),
    })

    // Exercise 2: Create Variables - PASS first try
    if (jsExercises.length > 1) {
      const ex2 = jsExercises[1]
      submissions.push({
        studentId: liamId,
        exerciseId: ex2._id,
        code: 'let score = 100;\nconst GAME_NAME = "Adventure Quest";\nconsole.log(score, GAME_NAME);',
        passed: true,
        testResults: [
          {
            testCaseId: ex2.testCases[0].id,
            passed: true,
            actualOutput: '100 Adventure Quest',
          },
        ],
        xpEarned: ex2.xpReward,
        submittedAt: daysAgo(5, 3),
      })
    }

    // Exercise 3: Calculate Area - PASS first try
    if (jsExercises.length > 2) {
      const ex3 = jsExercises[2]
      submissions.push({
        studentId: liamId,
        exerciseId: ex3._id,
        code: 'let width = 15;\nlet height = 8;\nlet area = width * height;\nconsole.log(area);',
        passed: true,
        testResults: [
          {
            testCaseId: ex3.testCases[0].id,
            passed: true,
            actualOutput: '120',
          },
          {
            testCaseId: ex3.testCases[1].id,
            passed: true,
            actualOutput: '120',
          },
        ],
        xpEarned: ex3.xpReward,
        submittedAt: daysAgo(4, 1),
      })
    }
  }

  // ==========================================
  // STRUGGLING STUDENT: emma_dev - Multiple failed attempts
  // ==========================================
  if (jsExercises.length > 0) {
    const emmaId = users.students[1] // emma_dev

    // Exercise 1: Print Your Name - FAIL attempt 1 (forgot quotes)
    const ex1 = jsExercises[0]
    submissions.push({
      studentId: emmaId,
      exerciseId: ex1._id,
      code: 'console.log(Emma);',
      passed: false,
      testResults: [
        {
          testCaseId: ex1.testCases[0].id,
          passed: false,
          error: 'ReferenceError: Emma is not defined',
        },
      ],
      xpEarned: 0,
      submittedAt: daysAgo(7, 5),
    })

    // Exercise 1: Print Your Name - FAIL attempt 2 (wrong output)
    submissions.push({
      studentId: emmaId,
      exerciseId: ex1._id,
      code: 'console.log("My name is Emma");',
      passed: false,
      testResults: [
        {
          testCaseId: ex1.testCases[0].id,
          passed: false,
          actualOutput: 'My name is Emma',
        },
      ],
      xpEarned: 0,
      submittedAt: daysAgo(7, 4),
    })

    // Exercise 1: Print Your Name - PASS attempt 3
    submissions.push({
      studentId: emmaId,
      exerciseId: ex1._id,
      code: 'console.log("Emma");',
      passed: true,
      testResults: [
        {
          testCaseId: ex1.testCases[0].id,
          passed: true,
          actualOutput: 'Emma',
        },
      ],
      xpEarned: ex1.xpReward,
      submittedAt: daysAgo(7, 3),
    })

    // Exercise 2: Create Variables - FAIL attempt 1 (used let instead of const)
    if (jsExercises.length > 1) {
      const ex2 = jsExercises[1]
      submissions.push({
        studentId: emmaId,
        exerciseId: ex2._id,
        code: 'let score = 100;\nlet GAME_NAME = "Adventure Quest";\nconsole.log(score, GAME_NAME);',
        passed: false,
        testResults: [
          {
            testCaseId: ex2.testCases[0].id,
            passed: false,
            actualOutput: '100 Adventure Quest',
          },
        ],
        xpEarned: 0,
        submittedAt: daysAgo(6, 5),
      })

      // Exercise 2: PASS attempt 2
      submissions.push({
        studentId: emmaId,
        exerciseId: ex2._id,
        code: 'let score = 100;\nconst GAME_NAME = "Adventure Quest";\nconsole.log(score, GAME_NAME);',
        passed: true,
        testResults: [
          {
            testCaseId: ex2.testCases[0].id,
            passed: true,
            actualOutput: '100 Adventure Quest',
          },
        ],
        xpEarned: ex2.xpReward,
        submittedAt: daysAgo(6, 4),
      })
    }
  }

  // ==========================================
  // AVERAGE STUDENT: noah_code - 1-2 attempts
  // ==========================================
  if (jsExercises.length > 0) {
    const noahId = users.students[4] // noah_code

    // Exercise 1: Print Your Name - PASS first try
    const ex1 = jsExercises[0]
    submissions.push({
      studentId: noahId,
      exerciseId: ex1._id,
      code: 'console.log("Noah");',
      passed: true,
      testResults: [
        {
          testCaseId: ex1.testCases[0].id,
          passed: true,
          actualOutput: 'Noah',
        },
      ],
      xpEarned: ex1.xpReward,
      submittedAt: daysAgo(6, 8),
    })

    // Exercise 2: Create Variables - FAIL attempt 1 (forgot to print)
    if (jsExercises.length > 1) {
      const ex2 = jsExercises[1]
      submissions.push({
        studentId: noahId,
        exerciseId: ex2._id,
        code: 'let score = 100;\nconst GAME_NAME = "Adventure Quest";',
        passed: false,
        testResults: [
          {
            testCaseId: ex2.testCases[0].id,
            passed: false,
            actualOutput: '',
          },
        ],
        xpEarned: 0,
        submittedAt: daysAgo(5, 7),
      })

      // Exercise 2: PASS attempt 2
      submissions.push({
        studentId: noahId,
        exerciseId: ex2._id,
        code: 'let score = 100;\nconst GAME_NAME = "Adventure Quest";\nconsole.log(score, GAME_NAME);',
        passed: true,
        testResults: [
          {
            testCaseId: ex2.testCases[0].id,
            passed: true,
            actualOutput: '100 Adventure Quest',
          },
        ],
        xpEarned: ex2.xpReward,
        submittedAt: daysAgo(5, 6),
      })
    }

    // Exercise 3: Calculate Area - PASS first try
    if (jsExercises.length > 2) {
      const ex3 = jsExercises[2]
      submissions.push({
        studentId: noahId,
        exerciseId: ex3._id,
        code: 'let width = 15;\nlet height = 8;\nlet area = width * height;\nconsole.log(area);',
        passed: true,
        testResults: [
          {
            testCaseId: ex3.testCases[0].id,
            passed: true,
            actualOutput: '120',
          },
          {
            testCaseId: ex3.testCases[1].id,
            passed: true,
            actualOutput: '120',
          },
        ],
        xpEarned: ex3.xpReward,
        submittedAt: daysAgo(4, 5),
      })
    }
  }

  // ==========================================
  // HIGH PERFORMER: sophia_js - Quick and accurate
  // ==========================================
  if (jsExercises.length > 3) {
    const sophiaId = users.students[7] // sophia_js

    // Exercise 4: Create Full Name - PASS first try
    const ex4 = jsExercises[3]
    submissions.push({
      studentId: sophiaId,
      exerciseId: ex4._id,
      code: 'let firstName = "Emma";\nlet lastName = "Wilson";\nlet fullName = `${firstName} ${lastName}`;\nconsole.log(fullName);',
      passed: true,
      testResults: [
        {
          testCaseId: ex4.testCases[0].id,
          passed: true,
          actualOutput: 'Emma Wilson',
        },
      ],
      xpEarned: ex4.xpReward,
      submittedAt: daysAgo(3, 2),
    })

    // Exercise 5: Check Even or Odd - PASS first try
    if (jsExercises.length > 4) {
      const ex5 = jsExercises[4]
      submissions.push({
        studentId: sophiaId,
        exerciseId: ex5._id,
        code: 'let num = 7;\nif (num % 2 === 0) {\n  console.log("even");\n} else {\n  console.log("odd");\n}',
        passed: true,
        testResults: [
          {
            testCaseId: ex5.testCases[0].id,
            passed: true,
            actualOutput: 'odd',
          },
        ],
        xpEarned: ex5.xpReward,
        submittedAt: daysAgo(2, 1),
      })
    }

    // Exercise 6: Sum Numbers - PASS first try
    if (jsExercises.length > 5) {
      const ex6 = jsExercises[5]
      submissions.push({
        studentId: sophiaId,
        exerciseId: ex6._id,
        code: 'let sum = 0;\nfor (let i = 1; i <= 5; i++) {\n  sum += i;\n}\nconsole.log(sum);',
        passed: true,
        testResults: [
          {
            testCaseId: ex6.testCases[0].id,
            passed: true,
            actualOutput: '15',
          },
          {
            testCaseId: ex6.testCases[1].id,
            passed: true,
            actualOutput: '15',
          },
        ],
        xpEarned: ex6.xpReward,
        submittedAt: daysAgo(1, 3),
      })
    }
  }

  // ==========================================
  // AVERAGE STUDENT: alex_coder - Mix of performance
  // ==========================================
  if (jsExercises.length > 0) {
    const alexId = users.students[0] // alex_coder

    // Exercise 1: Print Your Name - PASS first try
    const ex1 = jsExercises[0]
    submissions.push({
      studentId: alexId,
      exerciseId: ex1._id,
      code: 'console.log("Alex");',
      passed: true,
      testResults: [
        {
          testCaseId: ex1.testCases[0].id,
          passed: true,
          actualOutput: 'Alex',
        },
      ],
      xpEarned: ex1.xpReward,
      submittedAt: daysAgo(6, 10),
    })

    // Exercise 3: Calculate Area - FAIL attempt 1 (wrong formula)
    if (jsExercises.length > 2) {
      const ex3 = jsExercises[2]
      submissions.push({
        studentId: alexId,
        exerciseId: ex3._id,
        code: 'let width = 15;\nlet height = 8;\nlet area = width + height;\nconsole.log(area);',
        passed: false,
        testResults: [
          {
            testCaseId: ex3.testCases[0].id,
            passed: false,
            actualOutput: '23',
          },
          {
            testCaseId: ex3.testCases[1].id,
            passed: false,
            actualOutput: '23',
          },
        ],
        xpEarned: 0,
        submittedAt: daysAgo(4, 6),
      })

      // Exercise 3: PASS attempt 2
      submissions.push({
        studentId: alexId,
        exerciseId: ex3._id,
        code: 'let width = 15;\nlet height = 8;\nlet area = width * height;\nconsole.log(area);',
        passed: true,
        testResults: [
          {
            testCaseId: ex3.testCases[0].id,
            passed: true,
            actualOutput: '120',
          },
          {
            testCaseId: ex3.testCases[1].id,
            passed: true,
            actualOutput: '120',
          },
        ],
        xpEarned: ex3.xpReward,
        submittedAt: daysAgo(4, 5),
      })
    }
  }

  // ==========================================
  // PYTHON STUDENTS
  // ==========================================

  // HIGH PERFORMER: ava_tech - Python expert
  if (pyExercises.length > 0) {
    const avaId = users.students[5] // ava_tech

    // Python Exercise 1: Print Hello - PASS first try
    const pyEx1 = pyExercises[0]
    submissions.push({
      studentId: avaId,
      exerciseId: pyEx1._id,
      code: 'print("Hello, Python!")',
      passed: true,
      testResults: [
        {
          testCaseId: pyEx1.testCases[0].id,
          passed: true,
          actualOutput: 'Hello, Python!',
        },
      ],
      xpEarned: pyEx1.xpReward,
      submittedAt: daysAgo(5, 4),
    })

    // Python Exercise 2: Create Variables - PASS first try
    if (pyExercises.length > 1) {
      const pyEx2 = pyExercises[1]
      submissions.push({
        studentId: avaId,
        exerciseId: pyEx2._id,
        code: 'score = 95\nplayer_name = "Alex"\nprint(player_name, score)',
        passed: true,
        testResults: [
          {
            testCaseId: pyEx2.testCases[0].id,
            passed: true,
            actualOutput: 'Alex 95',
          },
        ],
        xpEarned: pyEx2.xpReward,
        submittedAt: daysAgo(4, 3),
      })
    }

    // Python Exercise 3: Calculate Circle Area - PASS first try
    if (pyExercises.length > 2) {
      const pyEx3 = pyExercises[2]
      submissions.push({
        studentId: avaId,
        exerciseId: pyEx3._id,
        code: 'radius = 5\narea = 3.14 * radius * radius\nprint(area)',
        passed: true,
        testResults: [
          {
            testCaseId: pyEx3.testCases[0].id,
            passed: true,
            actualOutput: '78.5',
          },
          {
            testCaseId: pyEx3.testCases[1].id,
            passed: true,
            actualOutput: '78.5',
          },
        ],
        xpEarned: pyEx3.xpReward,
        submittedAt: daysAgo(3, 2),
      })
    }
  }

  // STRUGGLING STUDENT: olivia_py - Multiple attempts
  if (pyExercises.length > 0) {
    const oliviaId = users.students[3] // olivia_py

    // Python Exercise 1: Print Hello - FAIL attempt 1 (wrong syntax)
    const pyEx1 = pyExercises[0]
    submissions.push({
      studentId: oliviaId,
      exerciseId: pyEx1._id,
      code: 'console.log("Hello, Python!")',
      passed: false,
      testResults: [
        {
          testCaseId: pyEx1.testCases[0].id,
          passed: false,
          error: 'NameError: name \'console\' is not defined',
        },
      ],
      xpEarned: 0,
      submittedAt: daysAgo(6, 7),
    })

    // Python Exercise 1: PASS attempt 2
    submissions.push({
      studentId: oliviaId,
      exerciseId: pyEx1._id,
      code: 'print("Hello, Python!")',
      passed: true,
      testResults: [
        {
          testCaseId: pyEx1.testCases[0].id,
          passed: true,
          actualOutput: 'Hello, Python!',
        },
      ],
      xpEarned: pyEx1.xpReward,
      submittedAt: daysAgo(6, 6),
    })
  }

  // AVERAGE STUDENT: james_py
  if (pyExercises.length > 1) {
    const jamesId = users.students[8] // james_py

    // Python Exercise 2: Create Variables - FAIL attempt 1 (forgot print)
    const pyEx2 = pyExercises[1]
    submissions.push({
      studentId: jamesId,
      exerciseId: pyEx2._id,
      code: 'score = 95\nplayer_name = "Alex"',
      passed: false,
      testResults: [
        {
          testCaseId: pyEx2.testCases[0].id,
          passed: false,
          actualOutput: '',
        },
      ],
      xpEarned: 0,
      submittedAt: daysAgo(5, 9),
    })

    // Python Exercise 2: PASS attempt 2
    submissions.push({
      studentId: jamesId,
      exerciseId: pyEx2._id,
      code: 'score = 95\nplayer_name = "Alex"\nprint(player_name, score)',
      passed: true,
      testResults: [
        {
          testCaseId: pyEx2.testCases[0].id,
          passed: true,
          actualOutput: 'Alex 95',
        },
      ],
      xpEarned: pyEx2.xpReward,
      submittedAt: daysAgo(5, 8),
    })
  }

  // Create all submissions
  await ExerciseSubmission.insertMany(submissions)

  logger.info(`Created ${submissions.length} exercise submissions`)
}
