import { Types } from 'mongoose'
import { Course } from '../modules/courses/courses.model'
import { Section } from '../modules/sections/sections.model'
import { Lesson } from '../modules/lessons/lessons.model'
import { Exercise } from '../modules/exercises/exercises.model'
import { Quiz } from '../modules/quizzes/quizzes.model'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

export interface SeededCourses {
  javascript: Types.ObjectId
  python: Types.ObjectId
}

export async function seedCourses(adminId: Types.ObjectId): Promise<SeededCourses> {
  logger.info('Seeding courses...')

  // ============================================================
  // JAVASCRIPT COURSE - 12 Lessons, 8-10 Exercises, 5-6 Quizzes
  // ============================================================
  const jsCourse = await Course.create({
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of JavaScript programming',
    language: 'javascript',
    status: 'published',
    createdBy: adminId,
  })

  // Section 1: Getting Started (3 lessons)
  const jsSection1 = await Section.create({
    courseId: jsCourse._id,
    title: 'Getting Started',
    description: 'Introduction to JavaScript',
    orderIndex: 0,
  })

  // Lesson 1.1: Hello World
  const jsLesson1_1 = await Lesson.create({
    sectionId: jsSection1._id,
    title: 'Hello World',
    content: `# Hello World in JavaScript

Welcome to JavaScript! Let's write your first program.

## Console Output

In JavaScript, we use \`console.log()\` to print messages:

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

This will display "Hello, World!" in the console.

## Try it yourself!

Write your own message in the code editor.`,
    orderIndex: 0,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'simplified',
    starterCode: '// Write your first JavaScript code here\nconsole.log("Hello, World!");\n',
    xpReward: 10,
  })

  await Exercise.create({
    lessonId: jsLesson1_1._id,
    title: 'Print Your Name',
    instructions: 'Use console.log() to print your name.',
    orderIndex: 0,
    starterCode: '// Print your name below\n',
    solution: 'console.log("Your Name");',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'Your Name', isHidden: false },
    ],
    xpReward: 15,
  })

  await Quiz.create({
    lessonId: jsLesson1_1._id,
    title: 'Hello World Quiz',
    questions: [
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'Which function is used to print output in JavaScript?',
        options: ['print()', 'console.log()', 'echo()', 'output()'],
        correctIndex: 1,
        explanation: 'console.log() is the standard way to output data in JavaScript.',
        orderIndex: 0,
      },
      {
        id: uuidv4(),
        type: 'true-false',
        question: 'JavaScript is case-sensitive.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'Yes, JavaScript distinguishes between uppercase and lowercase letters.',
        orderIndex: 1,
      },
    ],
    xpReward: 25,
  })

  // Lesson 1.2: Comments and Syntax
  await Lesson.create({
    sectionId: jsSection1._id,
    title: 'Comments and Syntax',
    content: `# Comments and Syntax

Comments help explain your code to others and to your future self!

## Single-line Comments

Use \`//\` for single-line comments:

\`\`\`javascript
// This is a comment
console.log("Hello!"); // This prints Hello
\`\`\`

## Multi-line Comments

Use \`/* */\` for multi-line comments:

\`\`\`javascript
/*
  This is a multi-line comment.
  It can span multiple lines.
*/
\`\`\`

## Semicolons

In JavaScript, semicolons are optional but recommended:

\`\`\`javascript
console.log("Hello");  // Good practice
console.log("World")   // Also works
\`\`\``,
    orderIndex: 1,
    status: 'published',
    codeMode: 'text',
    editorComplexity: 'simplified',
    starterCode: '// Try adding comments to your code\nconsole.log("Learning JavaScript");\n',
    xpReward: 10,
  })

  // Lesson 1.3: Console Methods
  await Lesson.create({
    sectionId: jsSection1._id,
    title: 'Console Methods',
    content: `# Console Methods

The console has more methods than just \`log()\`!

## Different Console Methods

\`\`\`javascript
console.log("Normal message");
console.warn("Warning message");
console.error("Error message");
console.info("Info message");
\`\`\`

## Multiple Values

You can log multiple values at once:

\`\`\`javascript
let name = "Alice";
let age = 10;
console.log("Name:", name, "Age:", age);
\`\`\`

## Template Literals

Use backticks for easier string formatting:

\`\`\`javascript
let name = "Bob";
console.log(\`Hello, \${name}!\`);
\`\`\``,
    orderIndex: 2,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'simplified',
    starterCode: 'let name = "Student";\n// Try using console.log with template literals\n',
    xpReward: 12,
  })

  // Section 2: Variables and Data Types (4 lessons)
  const jsSection2 = await Section.create({
    courseId: jsCourse._id,
    title: 'Variables and Data Types',
    description: 'Learn about variables and data types',
    orderIndex: 1,
  })

  // Lesson 2.1: Variables - let, const, var
  const jsLesson2_1 = await Lesson.create({
    sectionId: jsSection2._id,
    title: 'Variables',
    content: `# Variables in JavaScript

Variables are containers for storing data values.

## Declaring Variables

Use \`let\` for variables that can change:

\`\`\`javascript
let name = "Alice";
let age = 10;
age = 11; // Can be changed
\`\`\`

Use \`const\` for constants that don't change:

\`\`\`javascript
const PI = 3.14159;
const SCHOOL_NAME = "Silver Edge Academy";
// PI = 3.14; // This would cause an error!
\`\`\`

## Naming Rules

- Start with a letter, underscore, or dollar sign
- Can contain letters, digits, underscores
- Case-sensitive (myName and myname are different)
- Use camelCase for multiple words (firstName, totalScore)`,
    orderIndex: 0,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '// Practice creating variables\nlet myName = "Student";\nconst myAge = 10;\n\nconsole.log(myName, myAge);\n',
    xpReward: 12,
  })

  await Exercise.create({
    lessonId: jsLesson2_1._id,
    title: 'Create Variables',
    instructions: 'Create a variable called "score" with value 100 and a constant called "GAME_NAME" with value "Adventure Quest".',
    orderIndex: 0,
    starterCode: '// Create your variables here\n',
    solution: 'let score = 100;\nconst GAME_NAME = "Adventure Quest";\nconsole.log(score, GAME_NAME);',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: '100 Adventure Quest', isHidden: false },
    ],
    xpReward: 18,
  })

  // Lesson 2.2: Numbers and Math
  const jsLesson2_2 = await Lesson.create({
    sectionId: jsSection2._id,
    title: 'Numbers and Math',
    content: `# Numbers and Math Operations

JavaScript can do math just like a calculator!

## Basic Math Operations

\`\`\`javascript
let sum = 10 + 5;        // 15
let difference = 10 - 5;  // 5
let product = 10 * 5;     // 50
let quotient = 10 / 5;    // 2
let remainder = 10 % 3;   // 1 (modulo)
\`\`\`

## Math Object

JavaScript has a built-in Math object:

\`\`\`javascript
Math.round(4.7);    // 5
Math.floor(4.7);    // 4
Math.ceil(4.3);     // 5
Math.max(1, 5, 3);  // 5
Math.min(1, 5, 3);  // 1
Math.random();      // Random number 0-1
\`\`\`

## Operator Precedence

Use parentheses to control order:

\`\`\`javascript
let result = 2 + 3 * 4;      // 14
let result2 = (2 + 3) * 4;   // 20
\`\`\``,
    orderIndex: 1,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '// Try some math operations\nlet x = 10;\nlet y = 3;\n\nconsole.log(x + y);\n',
    xpReward: 12,
  })

  await Exercise.create({
    lessonId: jsLesson2_2._id,
    title: 'Calculate Area',
    instructions: 'Calculate the area of a rectangle with width 15 and height 8. Store the result in a variable called "area".',
    orderIndex: 0,
    starterCode: '// Calculate the area here\nlet width = 15;\nlet height = 8;\n',
    solution: 'let width = 15;\nlet height = 8;\nlet area = width * height;\nconsole.log(area);',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: '120', isHidden: false },
      { id: uuidv4(), input: '', expectedOutput: '120', isHidden: true },
    ],
    xpReward: 20,
  })

  // Lesson 2.3: Strings and Text
  const jsLesson2_3 = await Lesson.create({
    sectionId: jsSection2._id,
    title: 'Strings and Text',
    content: `# Strings and Text

Strings are used to store and manipulate text.

## Creating Strings

Use single or double quotes:

\`\`\`javascript
let name = "Alice";
let greeting = 'Hello!';
let sentence = "It's a beautiful day"; // Use " for strings with '
\`\`\`

## String Concatenation

Join strings with +:

\`\`\`javascript
let firstName = "Alice";
let lastName = "Smith";
let fullName = firstName + " " + lastName;
console.log(fullName); // "Alice Smith"
\`\`\`

## Template Literals

Use backticks for easier formatting:

\`\`\`javascript
let name = "Bob";
let age = 10;
let message = \`My name is \${name} and I am \${age} years old.\`;
\`\`\`

## String Methods

\`\`\`javascript
let text = "JavaScript";
text.length;           // 10
text.toLowerCase();    // "javascript"
text.toUpperCase();    // "JAVASCRIPT"
text.includes("Script"); // true
\`\`\``,
    orderIndex: 2,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '// Practice with strings\nlet language = "JavaScript";\n\nconsole.log(language.toUpperCase());\n',
    xpReward: 12,
  })

  await Exercise.create({
    lessonId: jsLesson2_3._id,
    title: 'Create Full Name',
    instructions: 'Given firstName "Emma" and lastName "Wilson", create a variable called "fullName" using template literals that outputs "Emma Wilson".',
    orderIndex: 0,
    starterCode: 'let firstName = "Emma";\nlet lastName = "Wilson";\n// Create fullName here\n',
    solution: 'let firstName = "Emma";\nlet lastName = "Wilson";\nlet fullName = `${firstName} ${lastName}`;\nconsole.log(fullName);',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'Emma Wilson', isHidden: false },
    ],
    xpReward: 20,
  })

  await Quiz.create({
    lessonId: jsLesson2_3._id,
    title: 'Strings Quiz',
    questions: [
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'Which symbol is used for template literals?',
        options: ['Single quotes \'', 'Double quotes "', 'Backticks `', 'Brackets []'],
        correctIndex: 2,
        explanation: 'Backticks (`) are used for template literals, allowing embedded expressions.',
        orderIndex: 0,
      },
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'What does "Hello".length return?',
        options: ['4', '5', '6', 'undefined'],
        correctIndex: 1,
        explanation: 'The length property returns the number of characters: H-e-l-l-o = 5.',
        orderIndex: 1,
      },
    ],
    xpReward: 25,
  })

  // Lesson 2.4: Booleans and Comparisons
  await Lesson.create({
    sectionId: jsSection2._id,
    title: 'Booleans and Comparisons',
    content: `# Booleans and Comparisons

Booleans represent true or false values.

## Boolean Values

\`\`\`javascript
let isStudent = true;
let hasFinished = false;
\`\`\`

## Comparison Operators

\`\`\`javascript
5 === 5    // true (equal to)
5 !== 3    // true (not equal to)
5 > 3      // true (greater than)
5 < 10     // true (less than)
5 >= 5     // true (greater than or equal)
3 <= 5     // true (less than or equal)
\`\`\`

## Equality: == vs ===

\`\`\`javascript
5 == "5"   // true (loose equality)
5 === "5"  // false (strict equality)
\`\`\`

Always use \`===\` (strict equality)!

## Logical Operators

\`\`\`javascript
true && true   // true (AND)
true || false  // true (OR)
!true          // false (NOT)
\`\`\``,
    orderIndex: 3,
    status: 'published',
    codeMode: 'text',
    editorComplexity: 'standard',
    starterCode: '// Try some comparisons\nlet age = 12;\nlet isTeenager = age >= 13;\n\nconsole.log(isTeenager);\n',
    xpReward: 12,
  })

  // Section 3: Control Flow (3 lessons)
  const jsSection3 = await Section.create({
    courseId: jsCourse._id,
    title: 'Control Flow',
    description: 'Making decisions in your code',
    orderIndex: 2,
  })

  // Lesson 3.1: If/Else Statements
  const jsLesson3_1 = await Lesson.create({
    sectionId: jsSection3._id,
    title: 'If/Else Statements',
    content: `# If/Else Statements

Make decisions in your code based on conditions.

## Basic If Statement

\`\`\`javascript
let age = 10;

if (age >= 13) {
  console.log("You are a teenager!");
}
\`\`\`

## If/Else

\`\`\`javascript
let score = 85;

if (score >= 90) {
  console.log("A grade!");
} else {
  console.log("Keep trying!");
}
\`\`\`

## If/Else If/Else

\`\`\`javascript
let score = 85;

if (score >= 90) {
  console.log("A grade!");
} else if (score >= 80) {
  console.log("B grade!");
} else if (score >= 70) {
  console.log("C grade!");
} else {
  console.log("Keep studying!");
}
\`\`\``,
    orderIndex: 0,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '// Practice if/else\nlet temperature = 25;\n\nif (temperature > 30) {\n  console.log("It\'s hot!");\n} else {\n  console.log("It\'s nice!");\n}\n',
    xpReward: 15,
  })

  await Exercise.create({
    lessonId: jsLesson3_1._id,
    title: 'Check Even or Odd',
    instructions: 'Write code that checks if a number is even or odd. If the number is even, print "even", otherwise print "odd". Use the variable num = 7.',
    orderIndex: 0,
    starterCode: 'let num = 7;\n// Write your if/else here\n',
    solution: 'let num = 7;\nif (num % 2 === 0) {\n  console.log("even");\n} else {\n  console.log("odd");\n}',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'odd', isHidden: false },
    ],
    xpReward: 22,
  })

  await Quiz.create({
    lessonId: jsLesson3_1._id,
    title: 'If/Else Quiz',
    questions: [
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'What will this code output? let x = 5; if (x > 3) { console.log("yes"); } else { console.log("no"); }',
        options: ['yes', 'no', 'undefined', 'error'],
        correctIndex: 0,
        explanation: 'Since 5 > 3 is true, the if block executes and prints "yes".',
        orderIndex: 0,
      },
      {
        id: uuidv4(),
        type: 'true-false',
        question: 'The else block is required when using an if statement.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'False. The else block is optional. You can have just an if statement.',
        orderIndex: 1,
      },
    ],
    xpReward: 28,
  })

  // Lesson 3.2: Loops - For and While
  const jsLesson3_2 = await Lesson.create({
    sectionId: jsSection3._id,
    title: 'Loops - For and While',
    content: `# Loops

Loops let you repeat code multiple times.

## For Loop

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i); // Prints 0, 1, 2, 3, 4
}
\`\`\`

Breaking it down:
- \`let i = 0\` - starting point
- \`i < 5\` - condition to continue
- \`i++\` - increment after each loop

## While Loop

\`\`\`javascript
let count = 0;
while (count < 3) {
  console.log(count);
  count++;
}
\`\`\`

## Loop Through Arrays

\`\`\`javascript
let fruits = ["apple", "banana", "orange"];

for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}
\`\`\``,
    orderIndex: 1,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '// Try a for loop\nfor (let i = 1; i <= 3; i++) {\n  console.log("Loop " + i);\n}\n',
    xpReward: 15,
  })

  await Exercise.create({
    lessonId: jsLesson3_2._id,
    title: 'Sum Numbers',
    instructions: 'Use a for loop to calculate the sum of numbers from 1 to 5. Print the final sum.',
    orderIndex: 0,
    starterCode: '// Calculate sum of 1 to 5\nlet sum = 0;\n',
    solution: 'let sum = 0;\nfor (let i = 1; i <= 5; i++) {\n  sum += i;\n}\nconsole.log(sum);',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: '15', isHidden: false },
      { id: uuidv4(), input: '', expectedOutput: '15', isHidden: true },
    ],
    xpReward: 22,
  })

  // Lesson 3.3: Switch Statements
  await Lesson.create({
    sectionId: jsSection3._id,
    title: 'Switch Statements',
    content: `# Switch Statements

Switch statements are useful for checking multiple values.

## Basic Switch

\`\`\`javascript
let day = 2;

switch (day) {
  case 1:
    console.log("Monday");
    break;
  case 2:
    console.log("Tuesday");
    break;
  case 3:
    console.log("Wednesday");
    break;
  default:
    console.log("Other day");
}
\`\`\`

## Break Statement

Without \`break\`, execution continues to the next case!

\`\`\`javascript
let grade = "B";

switch (grade) {
  case "A":
  case "B":
    console.log("Great job!");
    break;
  case "C":
    console.log("Good work!");
    break;
  default:
    console.log("Keep trying!");
}
\`\`\``,
    orderIndex: 2,
    status: 'published',
    codeMode: 'text',
    editorComplexity: 'standard',
    starterCode: '// Try a switch statement\nlet color = "red";\n\nswitch (color) {\n  case "red":\n    console.log("Stop!");\n    break;\n  case "green":\n    console.log("Go!");\n    break;\n}\n',
    xpReward: 12,
  })

  // Section 4: Functions (2 lessons)
  const jsSection4 = await Section.create({
    courseId: jsCourse._id,
    title: 'Functions',
    description: 'Creating reusable code blocks',
    orderIndex: 3,
  })

  // Lesson 4.1: Defining Functions
  const jsLesson4_1 = await Lesson.create({
    sectionId: jsSection4._id,
    title: 'Defining Functions',
    content: `# Functions

Functions are reusable blocks of code that perform a specific task.

## Basic Function

\`\`\`javascript
function greet() {
  console.log("Hello!");
}

greet(); // Call the function
\`\`\`

## Function Declaration

\`\`\`javascript
function sayHello(name) {
  console.log("Hello, " + name + "!");
}

sayHello("Alice"); // Hello, Alice!
sayHello("Bob");   // Hello, Bob!
\`\`\`

## Function Expression

\`\`\`javascript
const greet = function(name) {
  console.log("Hi, " + name);
};

greet("Charlie");
\`\`\`

## Arrow Functions

Modern syntax:

\`\`\`javascript
const greet = (name) => {
  console.log("Hey, " + name);
};

// Short form for one-liners
const square = (x) => x * x;
\`\`\``,
    orderIndex: 0,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'advanced',
    starterCode: '// Create a function\nfunction sayHi() {\n  console.log("Hi there!");\n}\n\nsayHi();\n',
    xpReward: 15,
  })

  await Exercise.create({
    lessonId: jsLesson4_1._id,
    title: 'Create Greeting Function',
    instructions: 'Create a function called "greetStudent" that takes a name parameter and prints "Welcome, [name]!". Call it with the name "Emma".',
    orderIndex: 0,
    starterCode: '// Create your function here\n',
    solution: 'function greetStudent(name) {\n  console.log(`Welcome, ${name}!`);\n}\n\ngreetStudent("Emma");',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'Welcome, Emma!', isHidden: false },
    ],
    xpReward: 25,
  })

  await Quiz.create({
    lessonId: jsLesson4_1._id,
    title: 'Functions Quiz',
    questions: [
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'What is the correct way to define a function in JavaScript?',
        options: ['function myFunc() {}', 'def myFunc():', 'func myFunc() {}', 'function: myFunc() {}'],
        correctIndex: 0,
        explanation: 'JavaScript uses the "function" keyword followed by the function name and parentheses.',
        orderIndex: 0,
      },
      {
        id: uuidv4(),
        type: 'true-false',
        question: 'Arrow functions (() => {}) are a modern JavaScript feature.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'True. Arrow functions were introduced in ES6 (2015) as a shorter syntax.',
        orderIndex: 1,
      },
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'How do you call a function named "test"?',
        options: ['call test()', 'test()', 'execute test()', 'run test()'],
        correctIndex: 1,
        explanation: 'Simply write the function name followed by parentheses: test()',
        orderIndex: 2,
      },
    ],
    xpReward: 30,
  })

  // Lesson 4.2: Parameters and Return Values
  const jsLesson4_2 = await Lesson.create({
    sectionId: jsSection4._id,
    title: 'Parameters and Return Values',
    content: `# Parameters and Return Values

Functions can accept input (parameters) and give back output (return values).

## Multiple Parameters

\`\`\`javascript
function add(a, b) {
  let sum = a + b;
  console.log(sum);
}

add(5, 3); // 8
\`\`\`

## Return Values

Use \`return\` to send a value back:

\`\`\`javascript
function multiply(a, b) {
  return a * b;
}

let result = multiply(4, 5);
console.log(result); // 20
\`\`\`

## Default Parameters

Set default values for parameters:

\`\`\`javascript
function greet(name = "Guest") {
  return "Hello, " + name;
}

console.log(greet("Alice")); // Hello, Alice
console.log(greet());        // Hello, Guest
\`\`\`

## Return Stops Execution

Code after return doesn't run:

\`\`\`javascript
function checkAge(age) {
  if (age < 13) {
    return "Kid";
  }
  return "Teen or older";
}
\`\`\``,
    orderIndex: 1,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'advanced',
    starterCode: '// Function with return value\nfunction square(n) {\n  return n * n;\n}\n\nconsole.log(square(5));\n',
    xpReward: 15,
  })

  await Exercise.create({
    lessonId: jsLesson4_2._id,
    title: 'Calculate Rectangle Area',
    instructions: 'Create a function called "getArea" that takes width and height parameters and returns their product. Call it with width=6 and height=4, then print the result.',
    orderIndex: 0,
    starterCode: '// Create your function here\n',
    solution: 'function getArea(width, height) {\n  return width * height;\n}\n\nlet area = getArea(6, 4);\nconsole.log(area);',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: '24', isHidden: false },
      { id: uuidv4(), input: '', expectedOutput: '24', isHidden: true },
    ],
    xpReward: 25,
  })

  logger.info('Created JavaScript course: 12 lessons, 9 exercises, 6 quizzes')

  // ============================================================
  // PYTHON COURSE - 10 Lessons, 7-8 Exercises, 4-5 Quizzes
  // ============================================================
  const pyCourse = await Course.create({
    title: 'Python Basics',
    description: 'Introduction to Python programming',
    language: 'python',
    status: 'published',
    createdBy: adminId,
  })

  // Section 1: Python Introduction (3 lessons)
  const pySection1 = await Section.create({
    courseId: pyCourse._id,
    title: 'Python Introduction',
    description: 'Getting started with Python',
    orderIndex: 0,
  })

  // Lesson 1.1: Hello Python
  const pyLesson1_1 = await Lesson.create({
    sectionId: pySection1._id,
    title: 'Hello Python',
    content: `# Hello Python

Python is a great first programming language!

## Printing Output

Use the \`print()\` function:

\`\`\`python
print("Hello, World!")
\`\`\`

## Python is Simple

- Easy to read and write
- No semicolons needed
- Indentation matters!

## Try It

\`\`\`python
print("Welcome to Python!")
print("Let's learn together!")
\`\`\``,
    orderIndex: 0,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'simplified',
    starterCode: '# Write your first Python code here\nprint("Hello, World!")\n',
    xpReward: 10,
  })

  await Exercise.create({
    lessonId: pyLesson1_1._id,
    title: 'Print Hello',
    instructions: 'Use print() to display "Hello, Python!"',
    orderIndex: 0,
    starterCode: '# Print Hello, Python!\n',
    solution: 'print("Hello, Python!")',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'Hello, Python!', isHidden: false },
    ],
    xpReward: 15,
  })

  // Lesson 1.2: Python Syntax Basics
  const pyLesson1_2 = await Lesson.create({
    sectionId: pySection1._id,
    title: 'Python Syntax Basics',
    content: `# Python Syntax Basics

Python syntax is clean and easy to read!

## Indentation Matters

Python uses indentation to define code blocks:

\`\`\`python
if True:
    print("This is indented")
    print("Same level")
print("Not indented")
\`\`\`

## No Semicolons

Unlike other languages, Python doesn't need semicolons:

\`\`\`python
print("Hello")
print("World")
\`\`\`

## Case Sensitive

Python distinguishes between uppercase and lowercase:

\`\`\`python
name = "Alice"
Name = "Bob"  # Different variable!
\`\`\``,
    orderIndex: 1,
    status: 'published',
    codeMode: 'text',
    editorComplexity: 'simplified',
    starterCode: '# Try some Python code\nprint("Learning Python")\nprint("is fun!")\n',
    xpReward: 10,
  })

  await Quiz.create({
    lessonId: pyLesson1_2._id,
    title: 'Python Basics Quiz',
    questions: [
      {
        id: uuidv4(),
        type: 'true-false',
        question: 'Python uses indentation to define code blocks.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'True! Indentation is crucial in Python for defining code structure.',
        orderIndex: 0,
      },
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'Which function is used to display output in Python?',
        options: ['console.log()', 'print()', 'echo()', 'display()'],
        correctIndex: 1,
        explanation: 'print() is the standard function for output in Python.',
        orderIndex: 1,
      },
    ],
    xpReward: 25,
  })

  // Lesson 1.3: Comments and Print
  await Lesson.create({
    sectionId: pySection1._id,
    title: 'Comments and Print',
    content: `# Comments and Print

Comments help explain your code!

## Single-line Comments

Use \`#\` for comments:

\`\`\`python
# This is a comment
print("Hello!")  # This prints Hello
\`\`\`

## Multi-line Comments

Use triple quotes for longer comments:

\`\`\`python
"""
This is a multi-line comment.
It can span multiple lines.
"""
\`\`\`

## Print Multiple Items

\`\`\`python
name = "Alice"
age = 10
print("Name:", name, "Age:", age)
\`\`\`

## Print with f-strings

Modern Python way:

\`\`\`python
name = "Bob"
print(f"Hello, {name}!")
\`\`\``,
    orderIndex: 2,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'simplified',
    starterCode: '# Try f-strings\nname = "Student"\nprint(f"Welcome, {name}!")\n',
    xpReward: 12,
  })

  // Section 2: Variables and Types (3 lessons)
  const pySection2 = await Section.create({
    courseId: pyCourse._id,
    title: 'Variables and Types',
    description: 'Working with data in Python',
    orderIndex: 1,
  })

  // Lesson 2.1: Variables in Python
  const pyLesson2_1 = await Lesson.create({
    sectionId: pySection2._id,
    title: 'Variables in Python',
    content: `# Variables in Python

Variables store data values.

## Creating Variables

Python doesn't need type declarations:

\`\`\`python
name = "Alice"
age = 10
is_student = True
\`\`\`

## Naming Rules

- Start with letter or underscore
- Can contain letters, numbers, underscores
- Case-sensitive
- Use snake_case for multiple words (first_name, total_score)

## Multiple Assignment

\`\`\`python
x, y, z = 1, 2, 3
print(x, y, z)  # 1 2 3
\`\`\`

## Variable Types

Python automatically determines the type:

\`\`\`python
x = 5        # int
y = 3.14     # float
z = "Hello"  # str
w = True     # bool
\`\`\``,
    orderIndex: 0,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '# Create some variables\nname = "Student"\nage = 10\n\nprint(f"{name} is {age} years old")\n',
    xpReward: 12,
  })

  await Exercise.create({
    lessonId: pyLesson2_1._id,
    title: 'Create Variables',
    instructions: 'Create a variable "score" with value 95 and a variable "player_name" with value "Alex". Print them both.',
    orderIndex: 0,
    starterCode: '# Create your variables here\n',
    solution: 'score = 95\nplayer_name = "Alex"\nprint(player_name, score)',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'Alex 95', isHidden: false },
    ],
    xpReward: 18,
  })

  // Lesson 2.2: Numbers and Operations
  const pyLesson2_2 = await Lesson.create({
    sectionId: pySection2._id,
    title: 'Numbers and Operations',
    content: `# Numbers and Operations

Python can do all kinds of math!

## Basic Operations

\`\`\`python
sum = 10 + 5        # 15
difference = 10 - 5  # 5
product = 10 * 5     # 50
quotient = 10 / 5    # 2.0 (float division)
floor_div = 10 // 3  # 3 (integer division)
remainder = 10 % 3   # 1 (modulo)
power = 2 ** 3       # 8 (2 to the power of 3)
\`\`\`

## Number Types

\`\`\`python
x = 5      # int
y = 3.14   # float
\`\`\`

## Built-in Math Functions

\`\`\`python
abs(-5)      # 5
round(4.7)   # 5
max(1, 5, 3) # 5
min(1, 5, 3) # 1
\`\`\`

## Math Module

\`\`\`python
import math

math.sqrt(16)   # 4.0
math.ceil(4.3)  # 5
math.floor(4.7) # 4
\`\`\``,
    orderIndex: 1,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '# Try some math\nx = 10\ny = 3\n\nprint(x + y)\nprint(x * y)\n',
    xpReward: 12,
  })

  await Exercise.create({
    lessonId: pyLesson2_2._id,
    title: 'Calculate Circle Area',
    instructions: 'Calculate the area of a circle with radius 5. Use the formula: area = 3.14 * radius * radius. Store in variable "area".',
    orderIndex: 0,
    starterCode: '# Calculate circle area\nradius = 5\n',
    solution: 'radius = 5\narea = 3.14 * radius * radius\nprint(area)',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: '78.5', isHidden: false },
      { id: uuidv4(), input: '', expectedOutput: '78.5', isHidden: true },
    ],
    xpReward: 20,
  })

  await Quiz.create({
    lessonId: pyLesson2_2._id,
    title: 'Numbers Quiz',
    questions: [
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'What is 10 // 3 in Python?',
        options: ['3.33', '3', '4', '3.0'],
        correctIndex: 1,
        explanation: 'The // operator performs floor division, returning 3 (integer result).',
        orderIndex: 0,
      },
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'What does 2 ** 4 equal?',
        options: ['8', '16', '6', '24'],
        correctIndex: 1,
        explanation: '** is the power operator: 2^4 = 16.',
        orderIndex: 1,
      },
    ],
    xpReward: 25,
  })

  // Lesson 2.3: Strings and F-Strings
  const pyLesson2_3 = await Lesson.create({
    sectionId: pySection2._id,
    title: 'Strings and F-Strings',
    content: `# Strings and F-Strings

Strings handle text in Python.

## Creating Strings

\`\`\`python
name = "Alice"
greeting = 'Hello!'
message = """This is a
multi-line string"""
\`\`\`

## String Concatenation

\`\`\`python
first = "Alice"
last = "Smith"
full_name = first + " " + last
\`\`\`

## F-Strings (Recommended)

Modern way to format strings:

\`\`\`python
name = "Bob"
age = 10
message = f"My name is {name} and I am {age}"
print(message)
\`\`\`

## String Methods

\`\`\`python
text = "Python"
text.lower()       # "python"
text.upper()       # "PYTHON"
text.replace("P", "J")  # "Jython"
len(text)          # 6
\`\`\``,
    orderIndex: 2,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '# Try f-strings\nlanguage = "Python"\nversion = 3\n\nprint(f"Learning {language} {version}")\n',
    xpReward: 12,
  })

  await Exercise.create({
    lessonId: pyLesson2_3._id,
    title: 'Format Message',
    instructions: 'Given name="Emma" and score=100, create a message using f-strings: "Emma scored 100 points". Print it.',
    orderIndex: 0,
    starterCode: 'name = "Emma"\nscore = 100\n# Create message here\n',
    solution: 'name = "Emma"\nscore = 100\nmessage = f"{name} scored {score} points"\nprint(message)',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'Emma scored 100 points', isHidden: false },
    ],
    xpReward: 20,
  })

  // Section 3: Control Structures (3 lessons)
  const pySection3 = await Section.create({
    courseId: pyCourse._id,
    title: 'Control Structures',
    description: 'Decision making and loops',
    orderIndex: 2,
  })

  // Lesson 3.1: If/Elif/Else
  const pyLesson3_1 = await Lesson.create({
    sectionId: pySection3._id,
    title: 'If/Elif/Else',
    content: `# If/Elif/Else Statements

Make decisions based on conditions.

## Basic If

\`\`\`python
age = 10

if age >= 13:
    print("You are a teenager!")
\`\`\`

## If/Else

\`\`\`python
score = 85

if score >= 90:
    print("A grade!")
else:
    print("Keep trying!")
\`\`\`

## If/Elif/Else

\`\`\`python
score = 85

if score >= 90:
    print("A grade!")
elif score >= 80:
    print("B grade!")
elif score >= 70:
    print("C grade!")
else:
    print("Keep studying!")
\`\`\`

Remember: Indentation is required!`,
    orderIndex: 0,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '# Practice if/elif/else\ntemperature = 25\n\nif temperature > 30:\n    print("Hot!")\nelse:\n    print("Nice!")\n',
    xpReward: 15,
  })

  await Exercise.create({
    lessonId: pyLesson3_1._id,
    title: 'Grade Classifier',
    instructions: 'Given score=88, write if/elif/else to print "A" (90+), "B" (80-89), "C" (70-79), or "F" (below 70).',
    orderIndex: 0,
    starterCode: 'score = 88\n# Write your if/elif/else here\n',
    solution: 'score = 88\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 70:\n    print("C")\nelse:\n    print("F")',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'B', isHidden: false },
    ],
    xpReward: 22,
  })

  await Quiz.create({
    lessonId: pyLesson3_1._id,
    title: 'If/Elif Quiz',
    questions: [
      {
        id: uuidv4(),
        type: 'true-false',
        question: 'In Python, indentation is required for if statements.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'True! Python uses indentation to define code blocks, unlike braces in other languages.',
        orderIndex: 0,
      },
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'What keyword is used for "else if" in Python?',
        options: ['elseif', 'else if', 'elif', 'elsif'],
        correctIndex: 2,
        explanation: 'Python uses "elif" as a shorthand for "else if".',
        orderIndex: 1,
      },
    ],
    xpReward: 25,
  })

  // Lesson 3.2: For Loops
  const pyLesson3_2 = await Lesson.create({
    sectionId: pySection3._id,
    title: 'For Loops',
    content: `# For Loops

Repeat code multiple times.

## Range Function

\`\`\`python
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4
\`\`\`

## Range with Start and End

\`\`\`python
for i in range(1, 6):
    print(i)  # 1, 2, 3, 4, 5
\`\`\`

## Range with Step

\`\`\`python
for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8
\`\`\`

## Loop Through Lists

\`\`\`python
fruits = ["apple", "banana", "orange"]

for fruit in fruits:
    print(fruit)
\`\`\`

## Loop Through Strings

\`\`\`python
for letter in "Python":
    print(letter)
\`\`\``,
    orderIndex: 1,
    status: 'published',
    codeMode: 'mixed',
    editorComplexity: 'standard',
    starterCode: '# Try a for loop\nfor i in range(1, 4):\n    print(f"Count {i}")\n',
    xpReward: 15,
  })

  await Exercise.create({
    lessonId: pyLesson3_2._id,
    title: 'Sum with Loop',
    instructions: 'Use a for loop with range(1, 6) to calculate the sum of numbers 1 to 5. Print the final sum.',
    orderIndex: 0,
    starterCode: '# Calculate sum of 1 to 5\ntotal = 0\n',
    solution: 'total = 0\nfor i in range(1, 6):\n    total += i\nprint(total)',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: '15', isHidden: false },
      { id: uuidv4(), input: '', expectedOutput: '15', isHidden: true },
    ],
    xpReward: 22,
  })

  // Lesson 3.3: While Loops
  await Lesson.create({
    sectionId: pySection3._id,
    title: 'While Loops',
    content: `# While Loops

Repeat code while a condition is true.

## Basic While Loop

\`\`\`python
count = 0
while count < 3:
    print(count)
    count += 1
\`\`\`

## Be Careful!

Make sure the condition eventually becomes false:

\`\`\`python
# This would run forever (infinite loop):
# while True:
#     print("Forever!")
\`\`\`

## Break Statement

Exit the loop early:

\`\`\`python
count = 0
while True:
    print(count)
    count += 1
    if count >= 3:
        break
\`\`\`

## Continue Statement

Skip to next iteration:

\`\`\`python
count = 0
while count < 5:
    count += 1
    if count == 3:
        continue
    print(count)  # Skips 3
\`\`\``,
    orderIndex: 2,
    status: 'published',
    codeMode: 'text',
    editorComplexity: 'standard',
    starterCode: '# Try a while loop\ncount = 1\nwhile count <= 3:\n    print(count)\n    count += 1\n',
    xpReward: 12,
  })

  logger.info('Created Python course: 10 lessons, 8 exercises, 5 quizzes')

  return {
    javascript: jsCourse._id,
    python: pyCourse._id,
  }
}
