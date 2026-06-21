import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCcw, ArrowRight, BookOpen, Brain, Settings } from 'lucide-react';
import { Difficulty, Problem } from '../types';
import { generateProblem } from '../lib/mathUtils';
import { cn } from '../lib/utils';

export default function LearnArena({ onExit }: { onExit: () => void }) {
  const [isStarted, setIsStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [types, setTypes] = useState<string[]>(['addition']);
  const [questions, setQuestions] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const startTraining = () => {
    const q: Problem[] = [];
    for (let i = 0; i < 20; i++) {
        // Simple adaptation: force retry until type matches
        let p = generateProblem(difficulty);
        while (!types.includes(p.type)) {
            p = generateProblem(difficulty);
        }
        q.push(p);
    }
    setQuestions(q);
    setCurrentIndex(0);
    setScore(0);
    setIsStarted(true);
    setIsFinished(false);
  };

  const submitAnswer = () => {
    if (userInput === '') return;
    const isCorrect = userInput.trim() === String(questions[currentIndex].answer);
    if (isCorrect) setScore(s => s + 1);
    
    if (currentIndex + 1 < 20) {
      setCurrentIndex(i => i + 1);
      setUserInput('');
    } else {
      setIsFinished(true);
    }
  };

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto glass p-8 rounded-3xl space-y-8">
        <h2 className="text-3xl font-black text-center">Settings</h2>
        <div className="space-y-4">
          <label className="block text-sm text-slate-400">Difficulty</label>
          <div className="grid grid-cols-4 gap-2">
            {(['easy', 'medium', 'hard', 'extreme'] as Difficulty[]).map(d => (
                <button key={d} onClick={() => setDifficulty(d)} className={cn("p-4 rounded-xl", difficulty === d ? "bg-brand-primary" : "bg-white/5")}>{d}</button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-400">Question Types</label>
            {['addition', 'subtraction', 'multiplication', 'division'].map(t => (
                <button key={t} onClick={() => setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className={cn("p-4 rounded-xl w-full text-left", types.includes(t) ? "bg-brand-accent text-slate-900" : "bg-white/5")}>{t}</button>
            ))}
        </div>
        <button onClick={startTraining} className="w-full py-4 btn-3d-green font-bold text-center">Start Learn Arena</button>
      </div>
    );
  }

  if (isFinished) {
    return (
        <div className="max-w-md mx-auto glass p-8 rounded-3xl text-center space-y-6">
            <h2 className="text-4xl font-bold">Session Finished!</h2>
            <p className="text-2xl">Score: {score} / 20</p>
            <button onClick={() => setIsStarted(false)} className="w-full py-4 btn-3d-blue font-bold">New Session</button>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <div className="glass p-8 rounded-3xl text-center space-y-8">
            <h3 className="text-6xl font-black">{questions[currentIndex].question}</h3>
            <form onSubmit={(e) => { e.preventDefault(); submitAnswer(); }} className="max-w-xs mx-auto">
                <input 
                    value={userInput} 
                    onChange={e => setUserInput(e.target.value)} 
                    className="w-full bg-white/5 border-2 border-white/20 rounded-2xl py-6 px-4 text-4xl text-center font-bold" 
                    placeholder="?"
                    autoFocus
                />
            </form>
            <p className="text-slate-400">Question {currentIndex + 1} / 20</p>
        </div>
    </div>
  );
}
