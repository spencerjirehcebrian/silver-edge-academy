import { SandboxProject } from '../modules/sandbox/sandboxProject.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'

export async function seedSandboxProjects(users: SeededUsers): Promise<void> {
  logger.info('Seeding sandbox projects...')

  const projects = [
    // JavaScript projects for class 1 students
    {
      studentId: users.students[0], // alex_coder (level 5)
      name: 'My First Game',
      description: 'A simple click counter game',
      language: 'javascript' as const,
      code: `let score = 0;

function increaseScore() {
  score = score + 1;
  console.log("Score: " + score);
}

console.log("Click game started!");
console.log("Current score: " + score);`,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[0],
      name: 'Color Picker',
      description: 'Experimenting with different colors',
      language: 'javascript' as const,
      code: `const colors = ["red", "blue", "green", "yellow"];

for (let i = 0; i < colors.length; i++) {
  console.log("Color " + (i + 1) + ": " + colors[i]);
}`,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[1], // emma_dev (level 3)
      name: 'Hello World Explorer',
      description: 'Learning different ways to say hello',
      language: 'javascript' as const,
      code: `console.log("Hello, World!");
console.log("Hola, Mundo!");
console.log("Bonjour, Monde!");
console.log("こんにちは世界!");`,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[2], // liam_js (level 7)
      name: 'Simple Calculator',
      description: 'A basic calculator with add, subtract, multiply, divide',
      language: 'javascript' as const,
      code: `function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return "Cannot divide by zero!";
  }
  return a / b;
}

console.log("5 + 3 =", add(5, 3));
console.log("10 - 4 =", subtract(10, 4));
console.log("6 * 7 =", multiply(6, 7));
console.log("20 / 5 =", divide(20, 5));`,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[2],
      name: 'Number Guesser',
      description: 'Guess the secret number game',
      language: 'javascript' as const,
      code: `const secretNumber = 7;
let guess = 5;

if (guess === secretNumber) {
  console.log("You got it!");
} else if (guess < secretNumber) {
  console.log("Too low, try again!");
} else {
  console.log("Too high, try again!");
}`,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[3], // olivia_py (level 2)
      name: 'My Variables Practice',
      description: 'Practicing with variables',
      language: 'javascript' as const,
      code: `let myName = "Olivia";
let myAge = 10;
let favoriteColor = "purple";

console.log("Hi, I'm " + myName);
console.log("I am " + myAge + " years old");
console.log("My favorite color is " + favoriteColor);`,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[4], // noah_code (level 4)
      name: 'Countdown Timer',
      description: 'Counting down from 10',
      language: 'javascript' as const,
      code: `for (let i = 10; i >= 0; i--) {
  console.log(i);
}
console.log("Blast off!");`,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },

    // Python projects for class 2 students
    {
      studentId: users.students[5], // ava_tech (level 6)
      name: 'Story Generator',
      description: 'Generate a random story with variables',
      language: 'python' as const,
      code: `name = "Dragon"
place = "castle"
action = "dancing"

story = f"Once upon a time, a {name} was {action} in a {place}."
print(story)`,
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[5],
      name: 'Pet Age Calculator',
      description: 'Convert human years to dog years',
      language: 'python' as const,
      code: `human_age = 5
dog_years = human_age * 7

print(f"If you are {human_age} years old,")
print(f"you are {dog_years} years old in dog years!")`,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[6], // william_dev (level 1)
      name: 'Hello Python',
      description: 'My first Python program',
      language: 'python' as const,
      code: `print("Hello, Python!")
print("I am learning to code!")`,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[7], // sophia_js (level 8)
      name: 'Shopping List',
      description: 'Keep track of shopping items',
      language: 'python' as const,
      code: `shopping_list = ["apples", "bread", "milk", "eggs"]

print("Shopping List:")
for item in shopping_list:
    print(f"- {item}")

print(f"\\nTotal items: {len(shopping_list)}")`,
      createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[7],
      name: 'Temperature Converter',
      description: 'Convert Celsius to Fahrenheit',
      language: 'python' as const,
      code: `def celsius_to_fahrenheit(celsius):
    fahrenheit = (celsius * 9/5) + 32
    return fahrenheit

temp_c = 25
temp_f = celsius_to_fahrenheit(temp_c)
print(f"{temp_c}°C is {temp_f}°F")`,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[8], // james_py (level 3)
      name: 'Math Quiz',
      description: 'Simple math problems',
      language: 'python' as const,
      code: `print("Math Quiz!")
print("What is 5 + 3?")
answer = 8
print(f"The answer is {answer}")

print("\\nWhat is 10 - 4?")
answer = 6
print(f"The answer is {answer}")`,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[9], // isabella_code (level 5)
      name: 'Password Checker',
      description: 'Check if password is strong enough',
      language: 'python' as const,
      code: `password = "secret123"

if len(password) >= 8:
    print("Password is strong!")
else:
    print("Password is too short. Use at least 8 characters.")`,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
    {
      studentId: users.students[9],
      name: 'Fun Facts',
      description: 'Random fun facts about animals',
      language: 'python' as const,
      code: `facts = [
    "Elephants can't jump",
    "A snail can sleep for 3 years",
    "Dolphins have names for each other"
]

print("Fun Animal Facts:")
for i, fact in enumerate(facts, 1):
    print(f"{i}. {fact}")`,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  ]

  await SandboxProject.insertMany(projects)
  logger.info(`Created ${projects.length} sandbox projects`)
}
