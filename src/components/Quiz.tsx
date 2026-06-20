import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, Zap, ArrowRight, RefreshCcw, Home } from 'lucide-react';
import { generateProblem, calculateXP } from '../lib/mathUtils';
import { Difficulty, Problem, UserStats } from '../types';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface QuizProps {
  difficulty: Difficulty;
  onFinish: (score: number, total: number, xpGained: number) => void;
  onExit: () => void;
}

export default function Quiz({ difficulty, onFinish, onExit }: QuizProps) {
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(difficulty));
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentProblem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput === '') return;

    const isCorrect = userInput.trim().split(' ').join('') === String(currentProblem.answer);
    setTotalQuestions(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setFeedback('correct');
      if (streak + 1 >= 5) {
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fbbf24']
        });
      }
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');
      setCurrentProblem(generateProblem(difficulty));
    }, 400);
  };

  if (isGameOver) {
    const xpGained = calculateXP(true, difficulty) * score;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto p-8 glass rounded-3xl text-center space-y-6"
      >
        <Trophy className="w-20 h-20 mx-auto text-brand-accent" />
        <h2 className="text-4xl font-display font-bold">Session Complete!</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl">
            <p className="text-slate-400 text-sm">Score</p>
            <p className="text-3xl font-bold">{score}/{totalQuestions}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl">
            <p className="text-slate-400 text-sm">XP Gained</p>
            <p className="text-3xl font-bold text-brand-primary">+{xpGained}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onFinish(score, totalQuestions, xpGained)}
            className="flex-1 py-4 bg-brand-primary hover:bg-brand-primary/90 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Home size={20} /> Dashboard
          </button>
          <button 
            onClick={() => {
              setIsGameOver(false);
              setTimeLeft(60);
              setScore(0);
              setTotalQuestions(0);
              setStreak(0);
              setCurrentProblem(generateProblem(difficulty));
            }}
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCcw size={20} /> Play Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center glass p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/20 rounded-lg">
            <Timer className="text-brand-primary" />
          </div>
          <span className={cn("text-2xl font-mono font-bold", timeLeft < 10 && "text-red-500 animate-pulse")}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className={cn("text-brand-accent transition-all", streak > 0 ? "scale-110" : "opacity-30")} />
            <span className="text-xl font-bold">{streak}</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <span className="text-xl font-bold">{score} pts</span>
        </div>
      </div>

      <motion.div 
        key={currentProblem.id}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "glass p-12 rounded-[3rem] text-center space-y-8 transition-colors duration-300",
          feedback === 'correct' && "bg-green-500/20 border-green-500/50",
          feedback === 'wrong' && "bg-red-500/20 border-red-500/50"
        )}
      >
        <div className="space-y-2">
          <h3 className="text-7xl md:text-8xl font-display font-black tracking-tighter">
            {currentProblem.question}
          </h3>
          {currentProblem.type === 'fractions_addition' && (
            <p className="text-brand-accent text-sm font-bold uppercase tracking-widest animate-pulse">
              Tip: Simplify your answer (e.g. 1/2)
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative max-w-xs mx-auto">
          <input
            ref={inputRef}
            type="text"
            inputMode={currentProblem.type === 'fractions_addition' ? 'text' : 'numeric'}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full bg-white/5 border-2 border-white/20 rounded-2xl py-6 px-4 text-4xl text-center font-bold focus:border-brand-primary focus:outline-none transition-all placeholder:text-white/10"
            placeholder={currentProblem.type === 'fractions_addition' ? "a/b" : "?"}
            autoFocus
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-brand-primary rounded-xl hover:scale-105 transition-transform"
          >
            <ArrowRight />
          </button>
        </form>
      </motion.div>

      <button 
        onClick={onExit}
        className="mx-auto block text-slate-500 hover:text-slate-300 transition-colors"
      >
        Quit Session
      </button>
    </div>
  );
}
