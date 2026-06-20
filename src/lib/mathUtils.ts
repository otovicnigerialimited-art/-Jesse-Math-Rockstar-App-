import { Problem, Difficulty } from '../types';

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplify(num: number, den: number): string {
  const common = gcd(num, den);
  const sNum = num / common;
  const sDen = den / common;
  return sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`;
}

const operators = {
  addition: '+',
  subtraction: '-',
  multiplication: '×',
  division: '÷',
  long_division: '÷',
  fractions_addition: '+'
};

export function generateProblem(difficulty: Difficulty): Problem {
  const id = Math.random().toString(36).substring(2, 9);
  let num1: number, num2: number, type: Problem['type'];

  const types: Problem['type'][] = ['addition', 'subtraction', 'multiplication', 'division', 'long_division', 'fractions_addition'];
  
  // Weighted selection based on difficulty
  if (difficulty === 'easy') {
    type = Math.random() > 0.5 ? 'addition' : 'subtraction';
  } else if (difficulty === 'medium') {
    type = (['addition', 'subtraction', 'multiplication', 'division'] as const)[Math.floor(Math.random() * 4)];
  } else {
    type = types[Math.floor(Math.random() * types.length)];
  }

  let question = '';
  let answer: string | number = 0;

  if (type === 'fractions_addition') {
    const den = Math.floor(Math.random() * 8) + 2;
    const n1 = Math.floor(Math.random() * den) + 1;
    const n2 = Math.floor(Math.random() * den) + 1;
    question = `${n1}/${den} + ${n2}/${den}`;
    answer = simplify(n1 + n2, den);
    return { id, question, answer, type };
  }

  if (type === 'long_division') {
    num2 = Math.floor(Math.random() * 15) + 5;
    const quotient = Math.floor(Math.random() * 50) + 10;
    num1 = num2 * quotient;
    question = `${num1} ÷ ${num2}`;
    answer = quotient;
    return { id, question, answer, type };
  }

  switch (difficulty) {
    case 'easy':
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      break;
    case 'medium':
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      break;
    case 'hard':
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 100) + 1;
      break;
    case 'extreme':
      num1 = Math.floor(Math.random() * 500) + 1;
      num2 = Math.floor(Math.random() * 500) + 1;
      break;
    default:
      num1 = 1;
      num2 = 1;
  }

  if (type === 'subtraction' && num1 < num2) {
    [num1, num2] = [num2, num1];
  }

  if (type === 'division') {
    // Ensure clean division
    num2 = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : 20)) + 1;
    const quotient = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : 20)) + 1;
    num1 = num2 * quotient;
    answer = quotient;
  } else if (type === 'addition') {
    answer = num1 + num2;
  } else if (type === 'subtraction') {
    answer = num1 - num2;
  } else if (type === 'multiplication') {
    answer = num1 * num2;
  }

  return {
    id,
    question: `${num1} ${operators[type]} ${num2}`,
    answer,
    type
  };
}

export function calculateXP(correct: boolean, difficulty: Difficulty): number {
  if (!correct) return 0;
  const base = 10;
  const multipliers = { easy: 1, medium: 2, hard: 4, extreme: 8 };
  return base * multipliers[difficulty];
}
