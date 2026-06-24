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

export function generateProblem(difficulty: Difficulty, allowedTypes?: Problem['type'][]): Problem {
  const id = Math.random().toString(36).substring(2, 9);
  let num1: number, num2: number, type: Problem['type'];

  const types: Problem['type'][] = ['addition', 'subtraction', 'multiplication', 'division', 'long_division', 'fractions_addition'];
  
  if (allowedTypes && allowedTypes.length > 0) {
    type = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  } else {
    // Weighted selection based on difficulty
    if (difficulty === 'easy') {
      type = Math.random() > 0.5 ? 'addition' : 'subtraction';
    } else if (difficulty === 'medium') {
      type = (['addition', 'subtraction', 'multiplication', 'division'] as const)[Math.floor(Math.random() * 4)];
    } else {
      type = types[Math.floor(Math.random() * types.length)];
    }
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

export function generateArenaQuestions(): { question: string, answer: string, id: string }[] {
  const list = [];
  // multiplication, addition and subtraction as requested
  const ops = ['+', '-', '×'];
  for (let i = 0; i < 20; i++) {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let num1 = 0, num2 = 0;
    
    // Questions progress: 5 easy, 5 medium, 10 hard
    if (i < 5) { // Easy
      if (op === '×') {
        num1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        num2 = Math.floor(Math.random() * 5) + 1; 
      } else if (op === '+') {
        num1 = Math.floor(Math.random() * 15) + 5; // 5 to 20
        num2 = Math.floor(Math.random() * 15) + 5;
      } else {
        num1 = Math.floor(Math.random() * 20) + 5; // 5 to 25
        num2 = Math.floor(Math.random() * 10) + 1;
      }
    } else if (i < 10) { // Medium
      if (op === '×') {
        num1 = Math.floor(Math.random() * 8) + 4; // 4 to 11
        num2 = Math.floor(Math.random() * 8) + 4;
      } else if (op === '+') {
        num1 = Math.floor(Math.random() * 80) + 20; // 20 to 100
        num2 = Math.floor(Math.random() * 80) + 20;
      } else {
        num1 = Math.floor(Math.random() * 100) + 30; // 30 to 130
        num2 = Math.floor(Math.random() * 60) + 10;
      }
    } else { // Hard
      if (op === '×') {
        num1 = Math.floor(Math.random() * 15) + 7; // 7 to 21
        num2 = Math.floor(Math.random() * 13) + 6; // 6 to 18
      } else if (op === '+') {
        num1 = Math.floor(Math.random() * 380) + 60; // 60 to 440
        num2 = Math.floor(Math.random() * 380) + 60;
      } else {
        num1 = Math.floor(Math.random() * 450) + 100; // 100 to 550
        num2 = Math.floor(Math.random() * 380) + 40;
      }
    }

    if (op === '-' && num1 < num2) {
      [num1, num2] = [num2, num1];
    }

    let answer = '';
    if (op === '+') answer = String(num1 + num2);
    else if (op === '-') answer = String(num1 - num2);
    else if (op === '×') answer = String(num1 * num2);

    list.push({
      id: `arena-q-${i}-${Math.random().toString(36).substring(2, 6)}`,
      question: `${num1} ${op} ${num2}`,
      answer
    });
  }
  return list;
}

