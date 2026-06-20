import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Calendar, Sparkles, Lock, Flame, Target, Zap, Clock } from 'lucide-react';
import { UserStats, Difficulty } from '../types';
import { cn } from '../lib/utils';

// Core standard badges
export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  category: string;
  checkUnlocked: (stats: UserStats) => boolean;
}

export const CORE_BADGES: Badge[] = [
  {
    id: "first_steps",
    title: "The Spark ⚡️",
    description: "Launch your journey by finishing your first Arena session!",
    emoji: "⚡️",
    color: "from-yellow-400 to-orange-500",
    category: "Milestone",
    checkUnlocked: (stats) => stats.history.length > 0
  },
  {
    id: "accuracy_king",
    title: "Perfect Target 🎯",
    description: "Submit a matching perfect-score session with 100% accuracy!",
    emoji: "🎯",
    color: "from-red-400 to-pink-500",
    category: "Precision",
    checkUnlocked: (stats) => stats.history.some(h => h.score === h.total && h.total >= 3)
  },
  {
    id: "streak_racer",
    title: "Brain Streak Champion 🔥",
    description: "Power up your thinking and get a 5-question streak!",
    emoji: "🔥",
    color: "from-orange-500 to-red-600",
    category: "Streak",
    checkUnlocked: (stats) => stats.bestStreak >= 5
  },
  {
    id: "level_three_elite",
    title: "Ascended Scholar 👑",
    description: "Grow your brain muscles all the way to Level 3 or higher!",
    emoji: "👑",
    color: "from-purple-400 to-violet-600",
    category: "Level",
    checkUnlocked: (stats) => stats.level >= 3
  },
  {
    id: "legendary_xp",
    title: "Math Rockstar 🎸",
    description: "Climb the charts and accumulate 1,000 total XP!",
    emoji: "🎸",
    color: "from-blue-400 to-violet-500",
    category: "XP",
    checkUnlocked: (stats) => stats.xp >= 1000
  },
  {
    id: "fearless_solver",
    title: "Fearless Explorer 🧭",
    description: "Enter the advanced modes (hard/extreme) & test your limits!",
    emoji: "🧭",
    color: "from-emerald-400 to-teal-600",
    category: "Courage",
    checkUnlocked: (stats) => stats.history.some(h => h.difficulty === 'hard' || h.difficulty === 'extreme')
  }
];

// Helper to calculate the current calendar week data key (e.g. "2026-W25")
export function getWeeklyData() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  const weekKey = `${now.getFullYear()}-W${weekNumber}`;
  
  // Rotating themes for weekly accomplishments
  const weekThemes = [
    {
      id: "weekly_arithmetic_master",
      title: "Arithmetic Champion 👑",
      description: "Solve 15 correct problems this week to claim your crown!",
      requirement: 15,
      emoji: "🏆",
      color: "from-amber-400 via-orange-500 to-yellow-500",
      accent: "text-amber-400"
    },
    {
      id: "weekly_accuracy_legend",
      title: "Mind Marvel 🧠",
      description: "Solve 10 correct problems this week to unlock the brain key!",
      requirement: 10,
      emoji: "🧠",
      color: "from-cyan-400 via-blue-500 to-indigo-500",
      accent: "text-cyan-400"
    },
    {
      id: "weekly_speed_racer",
      title: "Thunder Genius ⚡️",
      description: "Solve 12 correct problems this week to unlock the speed spark!",
      requirement: 12,
      emoji: "⚡️",
      color: "from-yellow-400 via-amber-500 to-orange-400",
      accent: "text-yellow-400"
    },
    {
      id: "weekly_explorer_pioneer",
      title: "Galactic Explorer 🚀",
      description: "Solve 8 correct problems this week to launch your star badge!",
      requirement: 8,
      emoji: "🚀",
      color: "from-emerald-400 via-teal-500 to-cyan-500",
      accent: "text-emerald-400"
    }
  ];

  // Modulo calculation to cycle week themes
  const themeIndex = (weekNumber - 1) % weekThemes.length;
  const currentChallenge = weekThemes[themeIndex];
  
  // Calculate days remaining in the week (until next Monday)
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  const daysLeft = 7 - currentDay;
  
  return {
    weekKey,
    currentChallenge,
    daysLeft: daysLeft || 7,
    weekNumber
  };
}

interface BadgesSectionProps {
  stats: UserStats;
  onClaimWeeklyBadge: () => void;
}

export default function BadgesSection({ stats, onClaimWeeklyBadge }: BadgesSectionProps) {
  const { weekKey, currentChallenge, daysLeft } = getWeeklyData();
  
  // Calculate weekly stats
  const weeklyProgress = stats.weeklyProgress?.weekKey === weekKey 
    ? stats.weeklyProgress 
    : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };

  const currentSolved = weeklyProgress.solvedThisWeek;
  const targetSolved = currentChallenge.requirement;
  const percentComplete = Math.min(100, Math.round((currentSolved / targetSolved) * 100));
  const canClaim = currentSolved >= targetSolved && !weeklyProgress.claimedWeeklyBadge;
  const isClaimed = !!weeklyProgress.claimedWeeklyBadge;

  // Track unlocked core badges
  const unlockedCoreIDs = stats.unlockedBadges || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-accent">
          <Sparkles className="animate-pulse" size={20} />
          <span className="text-xs uppercase tracking-wider font-bold">Rewards & Achievements</span>
        </div>
        <h2 className="text-4xl font-display font-black tracking-tight">
          GENIUS BADGES <span className="text-brand-primary">SHELF</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-lg">
          We are young genius! Tackle weekly accomplishments and perfect your math score to unlock sparkly awards for your trophy room.
        </p>
      </div>

      {/* Grid of accomplishments */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Weekly Quest Card */}
        <div className="lg:col-span-1 glass relative overflow-hidden rounded-3xl border border-white/10 p-6 flex flex-col justify-between bg-gradient-to-b from-brand-secondary/15 via-transparent to-brand-primary/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-brand-secondary/20 rounded-full text-[10px] font-black tracking-widest text-brand-secondary uppercase border border-brand-secondary/30">
                Weekly Quest ⚡️
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-white/5 py-1 px-2.5 rounded-full">
                <Clock size={12} className="text-brand-accent" />
                <span>{daysLeft} days left</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-4xl font-black">{currentChallenge.emoji}</div>
              <h3 className="text-xl font-display font-black tracking-tight">{currentChallenge.title}</h3>
              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                {currentChallenge.description}
              </p>
            </div>

            {/* Progress Meter */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Weekly Solve Progress</span>
                <span className="text-brand-accent">{currentSolved} / {targetSolved} Solved</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  style={{ width: `${percentComplete}%` }} 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    percentComplete >= 100 
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                      : "bg-gradient-to-r from-brand-secondary to-brand-accent"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            {isClaimed ? (
              <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-black text-xs text-center uppercase tracking-wider flex items-center justify-center gap-2">
                🏆 Badge Claimed & Added to Shelf!
              </div>
            ) : canClaim ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClaimWeeklyBadge}
                className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-black rounded-xl text-center shadow-lg shadow-brand-primary/20 hover:shadow-brand-secondary/30 cursor-pointer text-sm tracking-wide uppercase flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Claim Weekly Badge!
              </motion.button>
            ) : (
              <div className="w-full py-3 bg-white/5 border border-white/5 text-slate-500 rounded-xl font-bold text-xs text-center uppercase tracking-wider">
                🔒 Keep Solving in Arena to Unlock
              </div>
            )}
          </div>
        </div>

        {/* Badges Collection Shelf Grid */}
        <div className="lg:col-span-2 glass rounded-3xl border border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-display font-black text-lg tracking-tight flex items-center gap-2">
              <Award className="text-brand-primary" /> Core Achievements
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              Unlocked: {CORE_BADGES.filter(b => b.checkUnlocked(stats)).length} / {CORE_BADGES.length}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {CORE_BADGES.map((badge) => {
              const isUnlocked = badge.checkUnlocked(stats);
              
              return (
                <div 
                  key={badge.id}
                  className={cn(
                    "relative p-4 rounded-2xl flex items-center gap-4 border transition-all",
                    isUnlocked 
                      ? "bg-white/5 border-white/10 hover:bg-white/[0.08]" 
                      : "bg-black/20 border-white/5 opacity-60"
                  )}
                >
                  {/* Badge Circle Visual */}
                  <div className={cn(
                    "w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-3xl shadow-md",
                    isUnlocked 
                      ? `bg-gradient-to-tr ${badge.color} text-white` 
                      : "bg-white/5 text-slate-600"
                  )}>
                    {isUnlocked ? badge.emoji : <Lock size={20} />}
                  </div>

                  {/* Badge Label and Goal */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <p className={cn(
                        "font-display font-black text-sm",
                        isUnlocked ? "text-slate-100" : "text-slate-500"
                      )}>{badge.title}</p>
                      {isUnlocked && (
                        <span className="text-[9px] bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          Earned
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Dynamic Celebration Modal or Banner when claiming a Weekly Badge */}
      <div className="glass p-6 rounded-3xl border border-white/5 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="font-bold text-lg flex items-center justify-center sm:justify-start gap-2">
            🥇 Looking for more accomplishments?
          </h4>
          <p className="text-xs text-slate-400 font-medium max-w-xl">
            You earn **100 XP** instantly for every badge unlocked! Earn badges to jump multiple levels and unlock special crown symbols in the Young Genius arena.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-2xl border border-white/5">
          <Zap className="text-yellow-400 animate-bounce" size={20} />
          <span className="text-xs font-black text-slate-300">Level Boost Factor: x1.5 active</span>
        </div>
      </div>
    </div>
  );
}
