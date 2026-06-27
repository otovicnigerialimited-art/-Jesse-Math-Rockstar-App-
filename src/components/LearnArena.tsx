import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Brain, Settings, Trophy, Flame, Play, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Difficulty, Problem } from '../types';
import { generateProblem, calculateXP } from '../lib/mathUtils';
import { playCorrectSound, playWrongSound } from '../lib/audioUtils';
import { cn } from '../lib/utils';

interface LearnArenaProps {
  onExit: () => void;
  onFinish?: (score: number, total: number, xpGained: number, difficulty: Difficulty, sections: string[]) => void;
}

const typeDetails: Record<string, { label: string; desc: string; icon: string }> = {
  addition: { label: 'Addition', desc: 'A + B sum problems', icon: '➕' },
  subtraction: { label: 'Subtraction', desc: 'A - B differences', icon: '➖' },
  multiplication: { label: 'Multiplication', desc: 'A × B multiplications', icon: '✖️' },
  division: { label: 'Division', desc: 'A ÷ B clean divisions', icon: '➗' },
  long_division: { label: 'Long Division', desc: 'Multi-digit quotients', icon: '🔢' },
  fractions_addition: { label: 'Fractions', desc: 'Fraction arithmetic sums', icon: '🍰' }
};

const difficultyDetails: Record<Difficulty, { label: string; desc: string; color: string; bg: string; activeBg: string }> = {
  easy: { label: 'Easy Mode', desc: 'Single-digit equations for warmups', color: 'text-emerald-400 border-emerald-500/20', bg: 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400', activeBg: 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' },
  medium: { label: 'Medium Mode', desc: 'Double-digit numbers & basic divisions', color: 'text-sky-400 border-sky-500/20', bg: 'bg-sky-500/5 hover:bg-sky-500/10 text-sky-400', activeBg: 'bg-sky-500 text-slate-950 font-black shadow-[0_0_15px_rgba(14,165,233,0.4)]' },
  hard: { label: 'Hard Mode', desc: 'Triple-digit arithmetic & division operations', color: 'text-amber-400 border-amber-500/20', bg: 'bg-amber-500/5 hover:bg-amber-500/10 text-amber-400', activeBg: 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' },
  extreme: { label: 'Extreme Mode', desc: 'Insane brain busters to test master scholars', color: 'text-rose-400 border-rose-500/20', bg: 'bg-rose-500/5 hover:bg-rose-500/10 text-rose-400', activeBg: 'bg-rose-500 text-slate-950 font-black shadow-[0_0_15px_rgba(244,63,94,0.4)]' }
};

export default function LearnArena({ onExit, onFinish }: LearnArenaProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [types, setTypes] = useState<string[]>(['addition', 'subtraction']);
  const [questions, setQuestions] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Keep track of which answers were correct for review
  const [userAnswers, setUserAnswers] = useState<{ problem: Problem; userAns: string; isCorrect: boolean }[]>([]);

  const toggleType = (t: string) => {
    setTypes(prev => {
      if (prev.includes(t)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(x => x !== t);
      } else {
        return [...prev, t];
      }
    });
  };

  const startTraining = () => {
    const q: Problem[] = [];
    const allowedTypes = types.length > 0 ? (types as Problem['type'][]) : (['addition'] as Problem['type'][]);
    
    for (let i = 0; i < 20; i++) {
      const p = generateProblem(difficulty, allowedTypes);
      q.push(p);
    }
    
    setQuestions(q);
    setUserAnswers([]);
    setCurrentIndex(0);
    setScore(0);
    setIsStarted(true);
    setIsFinished(false);
  };

  const submitAnswer = () => {
    if (userInput.trim() === '') return;

    if (userInput.length > 30) {
      alert("Input too long! Keep your math response short.");
      return;
    }

    const badWords = ["ignore", "override", "system prompt", "instruction", "developer role"];
    const containsInjection = badWords.some(word => userInput.toLowerCase().includes(word));
    if (containsInjection) {
      console.log("Potential prompt injection blocked!");
      return;
    }
    
    const currentQuestion = questions[currentIndex];
    const isCorrect = userInput.trim().toLowerCase() === String(currentQuestion.answer).trim().toLowerCase();
    
    const nextScore = score + (isCorrect ? 1 : 0);
    if (isCorrect) {
      setScore(s => s + 1);
      playCorrectSound();
    } else {
      playWrongSound();
    }
    
    setUserAnswers(prev => [...prev, {
      problem: currentQuestion,
      userAns: userInput,
      isCorrect
    }]);

    if (currentIndex + 1 < 20) {
      setCurrentIndex(i => i + 1);
      setUserInput('');
    } else {
      setIsFinished(true);
      const xpGained = calculateXP(true, difficulty) * nextScore;
      onFinish?.(nextScore, 20, xpGained, difficulty, types);
    }
  };

  // 1. Setup / Settings View
  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between px-4 sm:px-0">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/40 border border-white/5 px-4 py-2 rounded-2xl cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-bold">Back to Hub</span>
          </button>
          <div className="flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full">
            <Brain size={14} className="text-violet-400" />
            <span className="text-xs font-black text-violet-300 uppercase tracking-wider">Custom Workout</span>
          </div>
        </div>

        {/* Setting Card */}
        <div className="glass p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden bg-slate-900/40 shadow-2xl space-y-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white flex items-center justify-center gap-3">
              <Settings className="text-violet-400 animate-spin" style={{ animationDuration: '6s' }} size={32} />
              Learn Arena Settings
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Configure your ultimate personalized mathematical training session. Choose your difficulty level and specific arithmetic disciplines.
            </p>
          </div>

          <hr className="border-white/5" />

          {/* Difficulty Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-black tracking-widest text-violet-400 block">
                Select Difficulty Level
              </label>
              <span className="text-xs text-slate-400 font-medium">Controls equation size & constraints</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['easy', 'medium', 'hard', 'extreme'] as Difficulty[]).map(d => {
                const details = difficultyDetails[d];
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 text-center cursor-pointer space-y-1.5",
                      active 
                        ? details.activeBg 
                        : "bg-slate-950/40 border-white/10 hover:border-white/20 text-slate-300 hover:scale-[1.02]"
                    )}
                  >
                    <span className="text-sm font-black uppercase tracking-wider">{details.label}</span>
                    <span className={cn("text-[10px] font-medium leading-tight opacity-90", active ? "text-slate-950 font-bold" : "text-slate-400")}>
                      {details.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-black tracking-widest text-violet-400 block">
                Discipline Customizer
              </label>
              <span className="text-xs text-slate-400 font-medium">Select at least one question format</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(typeDetails).map(t => {
                const details = typeDetails[t];
                const active = types.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden",
                      active
                        ? "bg-violet-500/20 border-violet-500/40 text-white shadow-lg"
                        : "bg-slate-950/20 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {active && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                    )}
                    <span className="text-2xl">{details.icon}</span>
                    <div className="min-w-0">
                      <p className={cn("font-black text-sm", active ? "text-violet-300" : "text-slate-300")}>
                        {details.label}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{details.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              onClick={startTraining}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-violet-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={18} fill="currentColor" />
              Enter Training Arena (20 Questions)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Finished View (With Review Panel!)
  if (isFinished) {
    const accuracy = Math.round((score / 20) * 100);
    const xpGained = calculateXP(true, difficulty) * score;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Results Card */}
        <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 text-center relative overflow-hidden bg-slate-900/40 shadow-2xl space-y-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Trophy size={40} className="animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] bg-amber-500/10 text-amber-400 font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20">
              Workout Complete
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white mt-4">Session Results</h2>
            <p className="text-sm text-slate-400">
              Excellent job conditioning your cognitive focus. Here is how you performed:
            </p>
          </div>

          {/* Score Stats Row */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Correct</span>
              <span className="text-2xl font-black text-white mt-1 block">{score} / 20</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Accuracy</span>
              <span className={cn(
                "text-2xl font-black mt-1 block",
                accuracy >= 80 ? "text-emerald-400" : accuracy >= 50 ? "text-amber-400" : "text-rose-400"
              )}>{accuracy}%</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">XP Gained</span>
              <span className="text-2xl font-black text-brand-primary mt-1 block">+{xpGained}</span>
            </div>
          </div>

          {/* Detailed Question Review Panel */}
          <div className="space-y-4 text-left">
            <h3 className="text-sm uppercase font-black tracking-wider text-slate-300">Training Review</h3>
            <div className="bg-slate-950/30 border border-white/5 rounded-2xl divide-y divide-white/5 max-h-72 overflow-y-auto">
              {userAnswers.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs text-slate-500 font-mono">#{idx + 1}</span>
                    <span className="text-2xl">{typeDetails[item.problem.type]?.icon || '❓'}</span>
                    <div>
                      <p className="font-bold text-white font-mono">{item.problem.question}</p>
                      <p className="text-[11px] text-slate-400">
                        Type: <span className="text-violet-300 font-semibold">{typeDetails[item.problem.type]?.label || item.problem.type}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs">
                      Your answer: <span className={cn("font-black", item.isCorrect ? "text-emerald-400" : "text-rose-400")}>{item.userAns}</span>
                    </p>
                    {!item.isCorrect && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        Correct: <span className="text-emerald-400 font-bold">{item.problem.answer}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setIsStarted(false)}
              className="flex-1 py-3.5 bg-slate-950/50 hover:bg-slate-950/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer text-center text-sm"
            >
              Adjust Settings
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3.5 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer text-center text-sm"
            >
              Go to Dashboard
            </button>
            <button
              onClick={startTraining}
              className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all duration-200 cursor-pointer text-center text-sm"
            >
              Train Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Quiz View
  const currentProblem = questions[currentIndex];
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between px-4 sm:px-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeDetails[currentProblem.type]?.icon || '❓'}</span>
          <div>
            <span className="text-[10px] text-violet-400 uppercase font-black tracking-widest block leading-none">
              Current Discipline
            </span>
            <span className="text-sm font-bold text-white mt-1 block">
              {typeDetails[currentProblem.type]?.label || currentProblem.type}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsStarted(false)}
          className="text-xs text-rose-400 hover:text-rose-300 font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
        >
          Quit Workout
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900/60 border border-white/5 rounded-full p-1 relative">
        <div className="h-2 rounded-full bg-slate-950 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / 20) * 100}%` }}
          />
        </div>
        <div className="absolute -top-6 right-2 text-xs font-mono font-bold text-slate-500">
          Question {currentIndex + 1} / 20
        </div>
      </div>

      {/* Equation Panel */}
      <div className="glass p-8 sm:p-12 rounded-3xl border border-white/10 text-center relative overflow-hidden bg-slate-900/40 shadow-2xl space-y-8">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <span className="text-[10px] bg-slate-950/40 text-slate-400 font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/5">
            Difficulty: {difficulty}
          </span>
          <h3 className="text-5xl sm:text-7xl font-display font-black text-white tracking-tight pt-4">
            {currentProblem.question}
          </h3>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitAnswer();
          }}
          className="max-w-xs mx-auto"
        >
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full bg-slate-950/60 border-2 border-white/10 hover:border-white/20 focus:border-violet-500 rounded-2xl py-5 px-4 text-4xl text-center font-black text-white focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all duration-300 shadow-inner font-mono"
            placeholder="?"
            autoFocus
            type="text"
            pattern="-?[0-9]*\/?[0-9]*"
            inputMode="text"
          />
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-colors duration-200 text-sm"
          >
            Submit Answer
          </button>
        </form>

        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          {currentProblem.type === 'fractions_addition' 
            ? 'Note: Please provide fraction answer in simplified form (e.g., 1/2 or 3).' 
            : 'Type your answer and press Enter or click Submit.'}
        </p>
      </div>
    </div>
  );
}
