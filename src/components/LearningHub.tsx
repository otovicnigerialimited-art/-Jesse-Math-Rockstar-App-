import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Play, Star, ChevronRight } from 'lucide-react';
import { Lesson, Difficulty } from '../types';
import { cn } from '../lib/utils';

const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Multiplication Mastery',
    description: 'Learn the secrets of fast multiplication from 1 to 12.',
    content: 'Multiplication is just repeated addition. 3 x 4 means 3 + 3 + 3 + 3...',
    category: 'Arithmetic',
    difficulty: 'easy'
  },
  {
    id: '2',
    title: 'Division Decoded',
    description: 'Understand how to split numbers fairly and find remainders.',
    content: 'Division is the inverse of multiplication. If 3 x 4 = 12, then 12 / 4 = 3.',
    category: 'Arithmetic',
    difficulty: 'medium'
  },
  {
    id: '4',
    title: 'Long Division Arena',
    description: 'Master the art of dividing large numbers with precision.',
    content: 'Long division involves finding how many times a divisor fits into parts of a dividend, subtracting, and bringing down the next digit.',
    category: 'Arithmetic',
    difficulty: 'hard'
  },
  {
    id: '5',
    title: 'Fraction Fusion',
    description: 'Learn to add fractions with common denominators and simplify them.',
    content: 'When adding fractions with the same denominator, add the numerators and keep the denominator. Always simplify your result!',
    category: 'Arithmetic',
    difficulty: 'extreme'
  },
  {
    id: '3',
    title: 'Algebraic Basics',
    description: 'Introduction to variables and solving simple equations.',
    content: 'Variables like "x" are placeholders for numbers we don\'t know yet.',
    category: 'Algebra',
    difficulty: 'hard'
  }
];

interface LearningHubProps {
  onStartLesson: (lesson: Lesson) => void;
}

export default function LearningHub({ onStartLesson }: LearningHubProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">Genius Hub 🎓</h2>
          <p className="text-slate-400">Master new math skills step-by-step!</p>
        </div>
        <div className="p-3 bg-brand-secondary/20 rounded-2xl">
          <BookOpen className="text-brand-secondary" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LESSONS.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass p-6 rounded-3xl group hover:border-brand-secondary/50 transition-all cursor-pointer"
            onClick={() => onStartLesson(lesson)}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                lesson.difficulty === 'easy' ? "bg-green-500/20 text-green-400" :
                lesson.difficulty === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              )}>
                {lesson.difficulty}
              </span>
              <Star className="text-brand-accent w-5 h-5" />
            </div>
            
            <h3 className="text-xl font-bold mb-2 group-hover:text-brand-secondary transition-colors">
              {lesson.title}
            </h3>
            <p className="text-slate-400 text-sm mb-6 line-clamp-2">
              {lesson.description}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-2 h-2 rounded-full bg-brand-secondary" />
                {lesson.category}
              </div>
              <div className="p-2 bg-white/5 rounded-xl group-hover:bg-brand-secondary group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass p-8 rounded-[2rem] bg-gradient-to-br from-brand-secondary/10 to-transparent border-brand-secondary/20 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h3 className="text-2xl font-bold">Ready for a Challenge, Genius? 🚀</h3>
            <p className="text-slate-400">
              Complete all interactive sessions to grow your brain muscles and unlock the legendary "Extreme" difficulty in the Arena.
            </p>
            <button className="mx-auto md:mx-0 px-6 py-3 bg-brand-secondary rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-brand-secondary/20">
              <Play size={18} fill="currentColor" /> Keep Growing Your Brain!
            </button>
          </div>
          <div className="w-48 h-48 bg-brand-secondary/20 rounded-full flex items-center justify-center animate-pulse shrink-0">
            <BookOpen size={64} className="text-brand-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
