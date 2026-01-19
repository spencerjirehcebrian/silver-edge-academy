import { HelpRequest } from '../modules/helpRequests/helpRequest.model'
import { Lesson } from '../modules/lessons/lessons.model'
import { Exercise } from '../modules/exercises/exercises.model'
import { Section } from '../modules/sections/sections.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'
import type { SeededCourses } from './courses.seed'
import type { SeededClasses } from './classes.seed'

export async function seedHelpRequests(
  users: SeededUsers,
  courses: SeededCourses,
  classes: SeededClasses
): Promise<void> {
  logger.info('Seeding help requests...')

  // Get lessons from JavaScript course for class 1
  const jsSections = await Section.find({ courseId: courses.javascript })
  const jsLessons = await Lesson.find({ sectionId: { $in: jsSections.map((s) => s._id) } })
  const jsExercises = await Exercise.find({ lessonId: { $in: jsLessons.map((l) => l._id) } })

  // Get lessons from Python course for class 2
  const pySections = await Section.find({ courseId: courses.python })
  const pyLessons = await Lesson.find({ sectionId: { $in: pySections.map((s) => s._id) } })

  const helpRequests = []
  const now = Date.now()
  const hoursInMs = 60 * 60 * 1000
  const daysInMs = 24 * hoursInMs

  // Pending requests (5-8 from class 1)
  if (jsLessons.length > 0) {
    helpRequests.push(
      {
        studentId: users.students[0],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        exerciseId: jsExercises[0]?._id,
        message: "I'm stuck on the console.log() exercise. When I run my code, nothing appears in the console.",
        codeSnapshot: 'consol.log("Hello World");',
        status: 'pending',
        createdAt: new Date(now - 2 * hoursInMs),
      },
      {
        studentId: users.students[1],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        message: 'Can you explain what a variable is? I read the lesson but I still don\'t understand.',
        status: 'pending',
        createdAt: new Date(now - 5 * hoursInMs),
      },
      {
        studentId: users.students[2],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        message: 'My code works but I got the wrong output. How can I fix it?',
        codeSnapshot: 'let age = "10";\nconsole.log(age + 5);',
        status: 'pending',
        createdAt: new Date(now - 8 * hoursInMs),
      },
      {
        studentId: users.students[3],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        message: 'I keep getting an error that says "undefined". What does that mean?',
        status: 'pending',
        createdAt: new Date(now - 12 * hoursInMs),
      },
      {
        studentId: users.students[4],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        message: 'How do I use semicolons in JavaScript? Are they required?',
        status: 'pending',
        createdAt: new Date(now - 1 * daysInMs),
      }
    )
  }

  // In-progress requests (3-4 from both classes)
  if (jsLessons.length > 0) {
    helpRequests.push(
      {
        studentId: users.students[0],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        message: 'I don\'t understand how loops work. Can you help explain it?',
        status: 'in_progress',
        assignedTeacherId: users.teachers[0],
        createdAt: new Date(now - 1 * daysInMs - 3 * hoursInMs),
      },
      {
        studentId: users.students[2],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        message: 'My function isn\'t returning the right value. Can you check my code?',
        codeSnapshot: 'function add(a, b) {\n  a + b;\n}\nconsole.log(add(5, 3));',
        status: 'in_progress',
        assignedTeacherId: users.teachers[0],
        createdAt: new Date(now - 2 * daysInMs),
      }
    )
  }

  if (pyLessons.length > 0) {
    helpRequests.push(
      {
        studentId: users.students[5],
        classId: classes.class2,
        lessonId: pyLessons[0]._id,
        message: 'Why do I need to use indentation in Python? My code won\'t run.',
        codeSnapshot: 'print("Hello")\nprint("World")',
        status: 'in_progress',
        assignedTeacherId: users.teachers[1],
        createdAt: new Date(now - 1 * daysInMs - 5 * hoursInMs),
      },
      {
        studentId: users.students[7],
        classId: classes.class2,
        lessonId: pyLessons[0]._id,
        message: 'I got a syntax error but I can\'t find what\'s wrong with my code.',
        status: 'in_progress',
        assignedTeacherId: users.teachers[1],
        createdAt: new Date(now - 2 * daysInMs - 2 * hoursInMs),
      }
    )
  }

  // Resolved requests (5-7 from both classes)
  if (jsLessons.length > 0) {
    helpRequests.push(
      {
        studentId: users.students[1],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        message: 'How do I compare two numbers in JavaScript?',
        status: 'resolved',
        assignedTeacherId: users.teachers[0],
        response: 'Great question! You can use comparison operators like ==, ===, <, >, <=, >=. For example: if (x === 5) checks if x is exactly 5.',
        respondedAt: new Date(now - 3 * daysInMs - 2 * hoursInMs),
        createdAt: new Date(now - 3 * daysInMs - 6 * hoursInMs),
      },
      {
        studentId: users.students[3],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        exerciseId: jsExercises[0]?._id,
        message: 'The exercise says my answer is wrong but it looks correct to me.',
        codeSnapshot: 'console.log("Your Name");',
        status: 'resolved',
        assignedTeacherId: users.teachers[0],
        response: 'Your code is actually correct! Make sure you\'re printing exactly what the exercise asks for. Try clicking the "Run Tests" button again.',
        respondedAt: new Date(now - 4 * daysInMs),
        createdAt: new Date(now - 4 * daysInMs - 5 * hoursInMs),
      },
      {
        studentId: users.students[4],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        message: 'What\'s the difference between let and const?',
        status: 'resolved',
        assignedTeacherId: users.teachers[0],
        response: 'Good question! "let" is for variables that can change, like "let score = 0". "const" is for values that stay the same, like "const PI = 3.14". Use const when you know the value won\'t change!',
        respondedAt: new Date(now - 5 * daysInMs - 1 * hoursInMs),
        createdAt: new Date(now - 5 * daysInMs - 4 * hoursInMs),
      }
    )
  }

  if (pyLessons.length > 0) {
    helpRequests.push(
      {
        studentId: users.students[6],
        classId: classes.class2,
        lessonId: pyLessons[0]._id,
        message: 'How do I print multiple things on one line in Python?',
        status: 'resolved',
        assignedTeacherId: users.teachers[1],
        response: 'You can use commas in print()! For example: print("Hello", "World") will print "Hello World" on one line.',
        respondedAt: new Date(now - 3 * daysInMs - 3 * hoursInMs),
        createdAt: new Date(now - 3 * daysInMs - 7 * hoursInMs),
      },
      {
        studentId: users.students[8],
        classId: classes.class2,
        lessonId: pyLessons[0]._id,
        message: 'I don\'t understand what a string is.',
        status: 'resolved',
        assignedTeacherId: users.teachers[1],
        response: 'A string is text! Anything inside quotes like "Hello" or \'Python\' is a string. You can print strings, combine them, and do lots of cool things with them!',
        respondedAt: new Date(now - 4 * daysInMs - 2 * hoursInMs),
        createdAt: new Date(now - 4 * daysInMs - 6 * hoursInMs),
      }
    )
  }

  // Closed requests (2-3 old resolved requests)
  if (jsLessons.length > 0) {
    helpRequests.push(
      {
        studentId: users.students[0],
        classId: classes.class1,
        lessonId: jsLessons[0]._id,
        message: 'Can you explain what the lesson is about?',
        status: 'closed',
        assignedTeacherId: users.teachers[0],
        response: 'The lesson covers the basics of console.log() which is how we print output in JavaScript. Try re-reading the lesson and let me know if you have specific questions!',
        respondedAt: new Date(now - 7 * daysInMs),
        createdAt: new Date(now - 7 * daysInMs - 8 * hoursInMs),
      }
    )
  }

  if (pyLessons.length > 0) {
    helpRequests.push(
      {
        studentId: users.students[9],
        classId: classes.class2,
        lessonId: pyLessons[0]._id,
        message: 'I need help with Python.',
        status: 'closed',
        assignedTeacherId: users.teachers[1],
        response: 'Hi! I\'d be happy to help. Can you be more specific about what you need help with? Is it a particular concept or exercise?',
        respondedAt: new Date(now - 6 * daysInMs - 5 * hoursInMs),
        createdAt: new Date(now - 6 * daysInMs - 10 * hoursInMs),
      }
    )
  }

  await HelpRequest.insertMany(helpRequests)
  logger.info(`Created ${helpRequests.length} help requests`)
}
