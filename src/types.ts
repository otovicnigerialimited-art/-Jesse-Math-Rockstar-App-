export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface Problem {
  id: string;
  question: string;
  answer: number | string;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions_addition' | 'long_division';
}

export interface UserStats {
  totalSolved: number;
  correctAnswers: number;
  level: number;
  xp: number;
  streak: number;
  bestStreak: number;
  history: {
    date: string;
    score: number;
    total: number;
    difficulty?: Difficulty;
    arenaType?: string;
    sections?: string[];
  }[];
  unlockedBadges?: string[];
  weeklyProgress?: {
    weekKey: string; // e.g. "2026-W25"
    solvedThisWeek: number;
    xpThisWeek: number;
    claimedWeeklyBadge?: boolean;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'Arithmetic' | 'Algebra' | 'Geometry';
  difficulty: Difficulty;
}
