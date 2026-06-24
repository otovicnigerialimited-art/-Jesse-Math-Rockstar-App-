import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, Zap, ArrowRight, RefreshCcw, Home, Flame } from 'lucide-react';
import { generateProblem, calculateXP } from '../lib/mathUtils';
import { Difficulty, Problem, UserStats } from '../types';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface QuizProps {
  difficulty: Difficulty;
  onFinish: (score: number, total: number, xpGained: number) => void;
  onExit: () => void;
  isGuest?: boolean;
  onConvertProgress?: () => void;
}

export default function Quiz({ difficulty, onFinish, onExit, isGuest, onConvertProgress }: QuizProps) {
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(difficulty));
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [activeFeedbackTag, setActiveFeedbackTag] = useState<string | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
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

  const submitAnswer = () => {
    if (userInput === '') return;

    const isCorrect = userInput.trim().split(' ').join('') === String(currentProblem.answer);
    setTotalQuestions(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setFeedback('correct');

      const funnyTaglines = [
        "🧠 Brainpower Overdrive!",
        "🎸 Unstoppable Math Rock Star!",
        "🚀 To Infinity and Beyond!",
        "🍌 That answer was bananas!",
        "🍕 You earn 100 virtual pizza slices!"
      ];
      const randomTag = funnyTaglines[Math.floor(Math.random() * funnyTaglines.length)];
      setActiveFeedbackTag(randomTag);

      if (streak + 1 >= 5) {
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fbbf24']
        });
        if (isGuest) {
          setShowMilestone(true);
        }
      }
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');
      setCurrentProblem(generateProblem(difficulty));
      setActiveFeedbackTag(null);
    }, 1300);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    submitAnswer();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || feedback !== null || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer();
      } else if (/^[0-9/.\-]$/.test(e.key) || e.key === 'Backspace') {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, currentProblem, isGameOver, feedback, streak]);

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
        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => onFinish(score, totalQuestions, xpGained)}
            className="flex-1 py-4 btn-3d-pink font-bold flex items-center justify-center gap-2"
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
            className="flex-1 py-4 btn-3d-blue font-bold flex items-center justify-center gap-2"
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

        <form onSubmit={handleSubmit} className="relative max-w-xs mx-auto lg:mb-0 mb-6">
          <input
            ref={inputRef}
            type="text"
            inputMode={currentProblem.type === 'fractions_addition' ? 'text' : 'none'}
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

        {/* Digital Keypad - Optimized for touchscreens but also usable on desktop */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'CLEAR', 0, 'GO'].map((key) => (
            <button
              key={key}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault(); // Prevents both loss of focus and mobile keyboard popping up abruptly if we override it
                if (key === 'CLEAR') setUserInput('');
                else if (key === 'GO') submitAnswer();
                else setUserInput((prev) => prev + key);
                inputRef.current?.focus();
              }}
              className={cn(
                "h-14 min-w-[3.5rem] rounded-2xl text-2xl font-black transition-transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer",
                key === 'CLEAR' ? "bg-rose-500/20 text-rose-400 text-sm border-2 border-rose-500/30 hover:bg-rose-500/30" : 
                key === 'GO' ? "bg-emerald-500 text-white text-lg hover:brightness-110 shadow-emerald-500/50" : 
                "bg-white/10 text-white border-2 border-white/10 hover:bg-white/20"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </motion.div>

      <button 
        onClick={onExit}
        className="mx-auto block text-slate-500 hover:text-slate-300 transition-colors pt-2"
      >
        Quit Session
      </button>

      {/* Styled Popup Random Feedback */}
      <AnimatePresence>
        {activeFeedbackTag && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
            animate={{ scale: [1, 1.15, 1], opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div 
              className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 border-4 border-white text-slate-900 font-extrabold px-8 py-5 rounded-3xl shadow-[0_12px_24px_rgba(0,0,0,0.6)] text-center max-w-sm mx-auto"
              style={{ boxShadow: "0 8px 0 #993300, 0 16px 30px rgba(0,0,0,0.6)" }}
            >
              <div className="text-3xl mb-1">⭐ MATH BLAST ⭐</div>
              <div className="text-xl font-black text-white drop-shadow-md">
                {activeFeedbackTag}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest Milestone Notification */}
      <AnimatePresence>
        {showMilestone && isGuest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMilestone(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 25 }}
              className="relative w-full max-w-md bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-2 border-orange-500 rounded-3xl p-8 shadow-[0_0_40px_rgba(249,115,22,0.4)] space-y-5 text-center z-10"
            >
              <div className="w-16 h-16 bg-orange-500/20 border border-orange-450 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Flame size={32} className="text-orange-400 fill-orange-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-wider">
                🔥 AMAZING STREAK!
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-semibold">
                🔥 Amazing streak! Sign up for a free account to save your high score permanently and claim your official rank on the Global Leaderboard!
              </p>
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMilestone(false);
                    if (onConvertProgress) {
                      onConvertProgress();
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25"
                >
                  💎 CLAIM MY FREE ACCOUNT
                </button>
                <button
                  type="button"
                  onClick={() => setShowMilestone(false)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Keep Playing as Guest
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
