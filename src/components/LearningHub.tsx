import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Play, Star, ChevronRight, ArrowLeft, Plus, Minus, Check, HelpCircle } from 'lucide-react';
import { Lesson, Difficulty } from '../types';
import { cn } from '../lib/utils';

const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Multiplication Mastery',
    description: 'Learn how multiplication works step-by-step with interactive grids.',
    content: 'Multiplication is just repeated addition. 3 x 4 means 3 + 3 + 3 + 3.',
    category: 'Arithmetic',
    difficulty: 'easy'
  },
  {
    id: '2',
    title: 'Division Decoded',
    description: 'Understand how to split groups of items fairly with zero remainders.',
    content: 'Division is the inverse of multiplication. If 3 x 4 = 12, then 12 / 4 = 3.',
    category: 'Arithmetic',
    difficulty: 'medium'
  },
  {
    id: '4',
    title: 'Long Division Arena',
    description: 'Master step-by-step long division using the DMSB method.',
    content: 'Long division involves finding how many times a divisor fits into parts of a dividend, subtracting, and bringing down the next digit.',
    category: 'Arithmetic',
    difficulty: 'hard'
  },
  {
    id: '5',
    title: 'Fraction Fusion',
    description: 'Learn fraction parts with visual interactive pie blocks.',
    content: 'When adding fractions with the same denominator, add the numerators and keep the denominator. Always simplify your result!',
    category: 'Arithmetic',
    difficulty: 'extreme'
  },
  {
    id: '3',
    title: 'Algebraic Basics',
    description: 'Introduction to balancing equations and finding the secret x.',
    content: 'Variables like "x" are placeholders for numbers we don\'t know yet.',
    category: 'Algebra',
    difficulty: 'hard'
  }
];

interface LearningHubProps {
  onStartLesson: (lesson: Lesson) => void;
}

export default function LearningHub({ onStartLesson }: LearningHubProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Multiplication Interactive States
  const [multNum1, setMultNum1] = useState(4);
  const [multNum2, setMultNum2] = useState(5);

  // Division Interactive States
  const [divTotal, setDivTotal] = useState(12);
  const [divGroups, setDivGroups] = useState(3);

  // Long Division step state
  const [longDivStep, setLongDivStep] = useState(0);

  // Fraction interactive states
  const [fracNum1, setFracNum1] = useState(2);
  const [fracNum2, setFracNum2] = useState(1);
  const [fracDen, setFracDen] = useState(5);

  // Algebra interactive states
  const [algTarget, setAlgTarget] = useState(12);
  const [algConst, setAlgConst] = useState(4);
  const [algGuess, setAlgGuess] = useState(5);

  // Reset interactive parameters on lesson shift
  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLongDivStep(0);
    // Preset states
    if (lesson.id === '1') {
      setMultNum1(4);
      setMultNum2(5);
    } else if (lesson.id === '2') {
      setDivTotal(12);
      setDivGroups(3);
    } else if (lesson.id === '4') {
      setLongDivStep(0);
    } else if (lesson.id === '5') {
      setFracNum1(2);
      setFracNum2(1);
      setFracDen(5);
    } else if (lesson.id === '3') {
      setAlgTarget(12);
      setAlgConst(4);
      setAlgGuess(5);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Header if lesson selected */}
      {selectedLesson ? (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedLesson(null)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/15 rounded-xl text-slate-300 hover:text-white transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft size={16} /> All Lessons
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass rounded-2xl border-brand-secondary/30 bg-gradient-to-r from-brand-secondary/15 to-transparent">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-brand-secondary/20 text-brand-secondary px-2.5 py-1 rounded-full mb-2 inline-block">
                Interactive Tutor Mode 🎓
              </span>
              <h2 className="text-3xl font-display font-black text-white">{selectedLesson.title}</h2>
              <p className="text-slate-400 text-sm mt-1">{selectedLesson.description}</p>
            </div>
            
            <button 
              onClick={() => onStartLesson(selectedLesson)}
              className="px-6 py-3.5 bg-brand-secondary hover:bg-brand-secondary/90 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-secondary/20 transition-all hover:scale-[1.03]"
            >
              <Play size={14} fill="currentColor" /> Practice this topic
            </button>
          </div>

          {/* Interactive Learning Playground */}
          <div className="glass p-6 md:p-8 rounded-[2.5rem] bg-slate-900/50 border-white/5">
            {/* 1. Multiplication Mastery Teaching view */}
            {selectedLesson.id === '1' && (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-300 text-sm leading-relaxed space-y-2">
                  <span className="font-extrabold text-brand-secondary">★ Real Subject Concept:</span>
                  <p>Multiplication is shorthand for <strong>repeated addition</strong>. Instead of writing <code className="bg-slate-950 px-2 py-0.5 rounded font-mono text-brand-secondary">4 + 4 + 4 + 4 + 4</code>, we write <code className="bg-slate-950 px-2 py-0.5 rounded font-mono text-brand-secondary">4 × 5</code>. They calculate the total items across columns and rows!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center pt-4">
                  {/* Left Controls */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-black text-white">🎛️ Interactive Grid Builder</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                        <span className="text-xs font-bold text-slate-300">Columns (Width): <span className="text-brand-secondary font-black text-base ml-2">{multNum1}</span></span>
                        <div className="flex gap-1.5">
                          <button onClick={() => setMultNum1(Math.max(1, multNum1 - 1))} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded cursor-pointer"><Minus size={12} /></button>
                          <button onClick={() => setMultNum1(Math.min(10, multNum1 + 1))} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded cursor-pointer"><Plus size={12} /></button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                        <span className="text-xs font-bold text-slate-300">Rows (Height): <span className="text-brand-primary font-black text-base ml-2">{multNum2}</span></span>
                        <div className="flex gap-1.5">
                          <button onClick={() => setMultNum2(Math.max(1, multNum2 - 1))} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded cursor-pointer"><Minus size={12} /></button>
                          <button onClick={() => setMultNum2(Math.min(10, multNum2 + 1))} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded cursor-pointer"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 text-center">
                      <div className="text-xl font-bold tracking-tight text-slate-200">
                        {multNum1} × {multNum2} = <span className="text-amber-400 font-black text-3xl">{multNum1 * multNum2}</span>
                      </div>
                      <div className="text-xs text-brand-secondary/80 font-mono mt-3 leading-relaxed">
                        Repeated Addition: {Array(multNum2).fill(multNum1).join(' + ')} = {multNum1 * multNum2}
                      </div>
                    </div>
                  </div>

                  {/* Right: Grid Visualization */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-950/50 rounded-2xl border border-white/5 min-h-[250px]">
                    <div className="grid gap-2 border-2 border-brand-secondary/20 p-4 rounded-xl bg-slate-950" style={{ gridTemplateColumns: `repeat(${multNum1}, minmax(0, 1fr))` }}>
                      {Array.from({ length: multNum1 * multNum2 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="w-6 h-6 md:w-8 md:h-8 rounded flex items-center justify-center bg-brand-secondary text-[10px] text-white font-black shadow-inner animate-pulse"
                        >
                          ⭐
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] uppercase font-black text-slate-500 mt-3 tracking-widest">{multNum1} Columns by {multNum2} Rows Grid</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Division Decoded Teaching view */}
            {selectedLesson.id === '2' && (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-300 text-sm leading-relaxed space-y-2">
                  <span className="font-extrabold text-orange-400">★ Division is Equal Sharing:</span>
                  <p>When we divide, we split a large set of items fairly into a set number of buckets. Every bucket must get the exact same number of items. Leftover items are the <strong>remainders</strong>!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-white">🍎 Fair Division Splitter</h3>

                    <div className="space-y-3">
                      <div className="bg-white/5 p-4 rounded-xl space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 flex justify-between">
                          <span>Total Items to Split:</span>
                          <span className="text-orange-400 font-extrabold">{divTotal}</span>
                        </label>
                        <input 
                          type="range" 
                          min={4} 
                          max={30} 
                          value={divTotal} 
                          onChange={(e) => setDivTotal(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                        />
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 flex justify-between">
                          <span>Split into how many groups?</span>
                          <span className="text-orange-400 font-extrabold">{divGroups}</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5 mt-1">
                          {[2, 3, 4, 5, 6].map((num) => (
                            <button
                              key={num}
                              onClick={() => setDivGroups(num)}
                              className={cn(
                                "py-2 text-xs font-black transition-all rounded-lg cursor-pointer",
                                divGroups === num 
                                  ? "bg-orange-500 text-white font-extrabold" 
                                  : "bg-white/5 text-slate-400 hover:bg-white/10"
                              )}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 space-y-1">
                      <div className="text-xl font-bold text-center text-slate-200">
                        {divTotal} ÷ {divGroups} = <span className="text-orange-400 font-black text-3xl">{Math.floor(divTotal / divGroups)}</span> {divTotal % divGroups > 0 && <span className="text-yellow-400 font-bold text-lg">R {divTotal % divGroups}</span>}
                      </div>
                      <div className="text-[11px] text-center text-slate-400 leading-tight">
                        Each of the {divGroups} groups gets exactly {Math.floor(divTotal / divGroups)} items. Leftovers: {divTotal % divGroups}.
                      </div>
                    </div>
                  </div>

                  {/* Division Visualization Boxes */}
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Visual Split Display ({divGroups} bins):</span>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: divGroups }).map((_, gIdx) => {
                        const itemsInThisGroup = Math.floor(divTotal / divGroups);
                        return (
                          <div key={gIdx} className="bg-slate-900 border border-orange-500/20 p-2.5 rounded-xl flex flex-col items-center">
                            <span className="text-[9px] font-bold text-orange-400 mb-1.5 bg-orange-500/10 px-2 py-0.5 rounded-full">Group #{gIdx+1}</span>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {Array.from({ length: itemsInThisGroup }).map((_, idx) => (
                                <span key={idx} className="text-sm">🔴</span>
                              ))}
                              {itemsInThisGroup === 0 && <span className="text-[9px] font-bold text-slate-600">Empty</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {divTotal % divGroups > 0 && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-yellow-500">Remainder leftovers:</span>
                        <div className="flex gap-1">
                          {Array.from({ length: divTotal % divGroups }).map((_, idx) => (
                            <span key={idx} className="text-sm animate-bounce">⚠️</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Long Division Arena Teaching view */}
            {selectedLesson.id === '4' && (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-300 text-sm leading-relaxed space-y-2">
                  <span className="font-extrabold text-red-400">★ DMSB Long Division Cheat Sheet:</span>
                  <p>Remember the legendary acronym <strong>DMSB</strong> to divide massive numbers: <br />
                    1. <strong>D</strong>ivide ➔ 2. <strong>M</strong>ultiply ➔ 3. <strong>S</strong>ubtract ➔ 4. <strong>B</strong>ring down. Let's walk through <strong>148 ÷ 6</strong> step-by-step!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4 items-center">
                  <div className="space-y-5">
                    <h3 className="text-lg font-black text-white">🚀 Step-by-Step DMSB Simulator</h3>
                    
                    <div className="space-y-3">
                      {[
                        { title: 'START: The layout', desc: 'Write the divisor (6) and dividend (148) in the bracket.' },
                        { title: 'STEP 1: Divide (14 ÷ 6)', desc: 'How many 6s fit in 14? 2 because 2 × 6 = 12. Write 2 on top.' },
                        { title: 'STEP 2: Multiply & Subtract', desc: 'Multiply 2 × 6 = 12. Write it below 14. Subtract: 14 - 12 = 2.' },
                        { title: 'STEP 3: Bring Down & Divide Again', desc: 'Bring down the 8 to make 2. How many 6s fit in 28? 4. Write 4 on top.' },
                        { title: 'STEP 4: Multiply & Subtract final', desc: 'Multiply 4 × 6 = 24. Subtract: 28 - 24 = 4. Since nothing is left to bring down, 4 is the Remainder!' },
                        { title: 'RESULT: Finished!', desc: '148 ÷ 6 = 24 with a Remainder of 4. Double check: 24 × 6 + 4 = 148. Correct!' }
                      ].map((step, idx) => (
                        <button
                          key={idx}
                          onClick={() => setLongDivStep(idx)}
                          className={cn(
                            "w-full p-3.5 text-left rounded-xl transition-all border cursor-pointer border-transparent flex gap-3",
                            longDivStep === idx 
                              ? "bg-slate-950 border-brand-secondary/40 text-white shadow" 
                              : "bg-white/5 text-slate-400 hover:bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                            longDivStep === idx ? "bg-brand-secondary text-white" : "bg-white/10 text-slate-400"
                          )}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-black tracking-tight">{step.title}</p>
                            {longDivStep === idx && <p className="text-[11px] text-slate-400 mt-1 leading-normal">{step.desc}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Math Blackboard graphic */}
                  <div className="p-6 bg-slate-950 border border-white/10 rounded-3xl min-h-[300px] flex flex-col justify-between font-mono relative">
                    <span className="text-[8px] tracking-widest text-[#00d2ff] uppercase font-black absolute top-3 right-4">Mathematical Chalkboard</span>
                    
                    <div className="space-y-4 text-center py-6">
                      {/* Step 1 division visual */}
                      {longDivStep === 0 && (
                        <div className="text-2xl font-black text-rose-500 whitespace-pre leading-relaxed">
                          {"   \n"}
                          {"6 )  1 4 8\n"}
                          {"    -------\n"}
                        </div>
                      )}
                      
                      {longDivStep === 1 && (
                        <div className="text-2xl font-black text-cyan-400 whitespace-pre leading-relaxed">
                          {"     2\n"}
                          {"6 )  1 4 8\n"}
                          {"    -------\n"}
                          <span className="text-xs font-bold text-slate-400">(6 goes into 14 two times)</span>
                        </div>
                      )}

                      {longDivStep === 2 && (
                        <div className="text-2xl font-black text-emerald-400 whitespace-pre leading-relaxed">
                          {"     2\n"}
                          {"6 )  1 4 8\n"}
                          {"   - 1 2\n"}
                          {"    -----\n"}
                          {"     2\n"}
                        </div>
                      )}

                      {longDivStep === 3 && (
                        <div className="text-2xl font-black text-amber-400 whitespace-pre leading-relaxed">
                          {"     2  4\n"}
                          {"6 )  1 4 8\n"}
                          {"   - 1 2 |\n"}
                          {"    ---- v\n"}
                          {"     2  8\n"}
                        </div>
                      )}

                      {longDivStep === 4 && (
                        <div className="text-2xl font-black text-violet-400 whitespace-pre leading-relaxed">
                          {"     2  4\n"}
                          {"6 )  1 4 8\n"}
                          {"   - 1 2\n"}
                          {"    -----\n"}
                          {"     2  8\n"}
                          {"   - 2  4\n"}
                          {"    -----\n"}
                          {"        4\n"}
                        </div>
                      )}

                      {longDivStep === 5 && (
                        <div className="text-2xl font-black text-yellow-400 whitespace-pre leading-relaxed animate-pulse">
                          {"     2  4   R 4\n"}
                          {"6 )  1 4 8   👑\n"}
                          {"   - 1 2\n"}
                          {"    -----\n"}
                          {"     2  8\n"}
                          {"   - 2  4\n"}
                          {"    -----\n"}
                          {"        4\n"}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[11px] text-slate-400 mt-auto leading-normal">
                      <span className="font-extrabold text-white">Quiz Shortcut Hint:</span> In division problems, you can always multiply back to verify! <code className="text-brand-secondary">Quotient × Divisor + Remainder = Dividend</code>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Fraction Fusion Teaching view */}
            {selectedLesson.id === '5' && (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-300 text-sm leading-relaxed space-y-2">
                  <span className="font-extrabold text-yellow-400">★ Fractions representing parts of a whole:</span>
                  <p>The **Denominator** is the number of pizza slices the circle is cut into. The **Numerator** is the number of slices you have. When denominators match, simply add the slices!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4 items-center">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-white">🍕 Pizza Fraction Custom Mixer</h3>

                    <div className="space-y-3">
                      <div className="bg-white/5 p-4 rounded-xl space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 flex justify-between">
                          <span>Pizza Slices Total (Denominator):</span>
                          <span className="text-yellow-400 font-extrabold">{fracDen} slices</span>
                        </label>
                        <input 
                          type="range" 
                          min={3} 
                          max={10} 
                          value={fracDen} 
                          onChange={(e) => {
                            const d = Number(e.target.value);
                            setFracDen(d);
                            setFracNum1(Math.min(fracNum1, d - 1));
                            setFracNum2(Math.min(fracNum2, d - 1));
                          }}
                          className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                        />
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-400 block">Slices you have:</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-950 rounded-lg text-center">
                            <span className="text-[10px] text-zinc-400 block mb-1">First slice fraction</span>
                            <div className="flex justify-center items-center gap-2">
                              <button onClick={() => setFracNum1(Math.max(1, fracNum1 - 1))} className="p-0.5 px-2 bg-white/5 hover:bg-white/10 rounded"><Minus size={11} /></button>
                              <span className="text-md font-bold text-white font-mono">{fracNum1} / {fracDen}</span>
                              <button onClick={() => setFracNum1(Math.min(fracDen - 1, fracNum1 + 1))} className="p-0.5 px-2 bg-white/5 hover:bg-white/10 rounded"><Plus size={11} /></button>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-950 rounded-lg text-center">
                            <span className="text-[10px] text-zinc-400 block mb-1">Second slice fraction</span>
                            <div className="flex justify-center items-center gap-2">
                              <button onClick={() => setFracNum2(Math.max(1, fracNum2 - 1))} className="p-0.5 px-2 bg-white/5 hover:bg-white/10 rounded"><Minus size={11} /></button>
                              <span className="text-md font-bold text-white font-mono">{fracNum2} / {fracDen}</span>
                              <button onClick={() => setFracNum2(Math.min(fracDen - 1, fracNum2 + 1))} className="p-0.5 px-2 bg-white/5 hover:bg-white/10 rounded"><Plus size={11} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5">
                      <div className="text-xl font-bold text-center text-slate-200 flex items-center justify-center gap-2.5">
                        <span className="font-mono">{fracNum1}/{fracDen}</span>
                        <span className="text-slate-500 font-extrabold">+</span>
                        <span className="font-mono">{fracNum2}/{fracDen}</span>
                        <span className="text-slate-500 font-extrabold">=</span>
                        <span className="text-emerald-400 font-extrabold font-mono text-2xl">{(fracNum1 + fracNum2)}/{fracDen}</span>
                      </div>
                      <p className="text-[10px] text-center text-zinc-500 mt-2 font-black leading-none uppercase">We just add the numerators because denominators are same Whole size</p>
                    </div>
                  </div>

                  {/* Pie Visuals */}
                  <div className="p-6 bg-slate-950/50 border border-white/5 rounded-3xl min-h-[260px] flex flex-col justify-center items-center space-y-4">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Dynamic visual pie circle:</span>
                    <div className="relative w-36 h-36 bg-slate-900 rounded-full border-4 border-slate-700 overflow-hidden flex items-center justify-center animate-spin-slow">
                      {/* Slices representation using simple line rotation separators */}
                      {Array.from({ length: fracDen }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className="absolute w-px h-full bg-slate-800" 
                          style={{ transform: `rotate(${(360 / fracDen) * idx}deg)` }} 
                        />
                      ))}
                      
                      {/* Interactive block overlay telling fraction capacity state */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center font-black bg-slate-950/85 px-3 py-1.5 rounded-xl border border-white/10 z-10">
                          <p className="text-slate-400 text-[10px] uppercase tracking-wider leading-none">Adding up</p>
                          <p className="text-emerald-400 text-lg font-mono">{(fracNum1 + fracNum2)} / {fracDen}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold max-w-xs text-center leading-normal">The circle represents a single pizza shared. Slices of {fracNum1} + {fracNum2} sums up to {(fracNum1 + fracNum2)} of {fracDen} slices totals.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Algebraic Basics Teaching view */}
            {selectedLesson.id === '3' && (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-300 text-sm leading-relaxed space-y-2">
                  <span className="font-extrabold text-[#00d2ff]">★ Algebra Balance Scale:</span>
                  <p>An algebraic equation is like a balanced playground scale. Whatever you do to the left side, you must do to the right side! If <code className="bg-slate-950 px-2 py-0.5 rounded font-mono text-cyan-400">x + {algConst} = {algTarget}</code>, we subtract {algConst} from both sides to find x!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4 items-center">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-white">⚖️ Interactive Balance Equation</h3>

                    <div className="space-y-3 bg-white/5 p-4 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-400 block">The Equation:</span>
                        <div className="text-xl font-black text-center text-white py-1.5 bg-slate-950 rounded-lg">
                          x + <span className="text-cyan-400 font-extrabold">{algConst}</span> = <span className="text-amber-400 font-extrabold">{algTarget}</span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="text-xs font-bold text-slate-400 flex justify-between">
                          <span>Guess what value x must be?</span>
                          <span className="text-brand-secondary font-black">{algGuess}</span>
                        </label>
                        <input 
                          type="range" 
                          min={1} 
                          max={25} 
                          value={algGuess} 
                          onChange={(e) => setAlgGuess(Number(e.target.value))}
                          className="w-full accent-brand-secondary cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-white/5 text-center">
                      <p className="text-xs text-slate-400">Current Balance Sum (Guess + {algConst}):</p>
                      <p className="text-lg font-black mt-1">
                        {algGuess} + {algConst} = <span className={cn(
                          "text-xl",
                          algGuess + algConst === algTarget ? "text-green-400" : "text-amber-500 font-extrabold"
                        )}>{algGuess + algConst}</span>
                      </p>
                    </div>
                  </div>

                  {/* Balance Scale graphic */}
                  <div className="p-6 bg-slate-950/50 border border-white/5 rounded-3xl min-h-[260px] flex flex-col justify-center items-center">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-6">Interactive weight state:</span>
                    
                    {/* Scale balance drawing */}
                    <div className="w-full max-w-xs space-y-4">
                      {/* Horizontal bar with balance angle */}
                      <div 
                        className="h-2 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full transition-transform duration-500 relative flex items-center justify-between px-6"
                        style={{ 
                          transform: `rotate(${Math.min(15, Math.max(-15, ((algGuess + algConst) - algTarget) * 2))}deg)` 
                        }}
                      >
                        <div className="absolute top-1 left-2 text-xs">⚖️</div>
                        <div className="absolute top-1 right-2 text-xs">⚖️</div>
                      </div>

                      <div className="flex justify-between px-6">
                        <div className="bg-cyan-500/10 border border-cyan-500/20 p-2 rounded-xl text-center min-w-[100px]">
                          <span className="text-[10px] text-cyan-400 font-extrabold block">Left Side Weighs</span>
                          <span className="text-sm font-black text-white">{algGuess + algConst}</span>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-center min-w-[100px]">
                          <span className="text-[10px] text-amber-400 font-extrabold block">Right Side Weighs</span>
                          <span className="text-sm font-black text-white">{algTarget}</span>
                        </div>
                      </div>
                    </div>

                    {algGuess + algConst === algTarget ? (
                      <div className="mt-6 p-2 p-x-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                        <Check size={14} /> Perfectly Balanced! x = {algGuess}
                      </div>
                    ) : (
                      <div className="mt-6 p-2 p-x-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <HelpCircle size={14} /> Slide weight to balance
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Lesson Directory view */
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-display font-black text-white">Genius Hub 🎓</h2>
              <p className="text-slate-400 text-sm">Master brand new math logic with zero stress!</p>
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
                transition={{ delay: index * 0.08 }}
                className="glass p-6 rounded-[2rem] border-white/5 bg-slate-900/40 group hover:border-brand-secondary/50 hover:bg-slate-900/70 transition-all cursor-pointer flex flex-col justify-between"
                onClick={() => handleSelectLesson(lesson)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                      lesson.difficulty === 'easy' ? "bg-green-500/20 text-green-400" :
                      lesson.difficulty === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-rose-500/20 text-rose-400"
                    )}>
                      {lesson.difficulty}
                    </span>
                    <Star className="text-brand-accent w-4 h-4 fill-brand-accent/20" />
                  </div>
                  
                  <h3 className="text-lg font-black text-white mb-1.5 group-hover:text-brand-secondary transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed line-clamp-3">
                    {lesson.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                    {lesson.category}
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl group-hover:bg-brand-secondary group-hover:text-white transition-all text-xs font-black flex items-center gap-1">
                    Study Topic <ChevronRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass p-8 rounded-[2rem] bg-gradient-to-br from-brand-secondary/10 to-transparent border-brand-secondary/20 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-black text-white">Do you have deep questions? 🧠</h3>
                <p className="text-slate-400 text-sm">
                  Choose a topic from the interactive grid cards above to study with visual helpers, slider models, balance lines, and animations before jumping into battles!
                </p>
              </div>
              <div className="w-40 h-40 bg-brand-secondary/15 rounded-full flex items-center justify-center animate-pulse shrink-0">
                <BookOpen size={48} className="text-brand-secondary animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
