import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  HelpCircle, 
  Award, 
  Flame, 
  Zap, 
  Trophy, 
  Activity, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Star 
} from 'lucide-react';

interface RulesPageProps {
  onNavigateToTab: (tab: any) => void;
}

export default function RulesPage({ onNavigateToTab }: RulesPageProps) {
  const rulesList = [
    {
      icon: <Activity className="text-violet-400" size={24} />,
      title: "Real-Time Direct Matchmaking",
      desc: "Instant live matchmaking! When you enter the play arena queue, the system connects you with any active rockstars online. If no one's around, you can practice your speeds as you prepare for global domination!"
    },
    {
      icon: <Flame className="text-orange-400" size={24} />,
      title: "Multiplication Speed Streaks",
      desc: "Answering multiple questions correctly in a row triggers the Streak Multiplier! As your active accuracy streak grows, your earned XP per answer increases dynamically."
    },
    {
      icon: <Zap className="text-amber-400" size={24} />,
      title: "TTRS Speed Difficulty Multipliers",
      desc: "Challenge your boundaries! Switching difficulty levels from easy, medium, hard to extreme in the settings increases your base reward. Face harder questions for much higher payouts!"
    },
    {
      icon: <Award className="text-cyan-400" size={24} />,
      title: "Evolving Ranks & Badge Collectibles",
      desc: "Build the ultimate showcase! Every 1,000 XP you earn unlocks a higher level rank (e.g. Young Genius, Master Mind, Table Titan) and prestigious badges that signify your intellectual supremacy."
    },
    {
      icon: <ShieldCheck className="text-emerald-400" size={24} />,
      title: "Unique Namespace Claiming Rules",
      desc: "No two players can have the same username. Each claimed username is globally unique and recorded on our dynamic ledger. If another young scholar tries to use your identical name, they will be blocked with an 'already taken' alert."
    },
    {
      icon: <HelpCircle className="text-pink-400" size={24} />,
      title: "Device-Bound Profile Identity",
      desc: "Since we don't request personal emails, usernames are tied to a unique device key on your local browser. If you clear cookies, you might need to register a new unique name. Always write down your math tag unless you have a Teacher account!"
    }
  ];

  return (
    <div className="space-y-10 py-4">
      {/* Page Header */}
      <div className="text-center md:text-left space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-black uppercase text-violet-400 tracking-wider">
          <BookOpen size={12} /> GAMEPLAY MANIFESTO & STUDY GUIDES
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
          How It Works & Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Rules</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Jesse Rock Math Arena combines rockstar energy with core math principles. Learn how to train your speed and score points effectively.
        </p>
      </div>

      {/* Rules Core Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {rulesList.map((r, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-violet-500/30 transition-all group scale-100 hover:bg-slate-900/60"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-violet-600/10 group-hover:text-violet-400 transition-colors shrink-0">
                {r.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white group-hover:text-violet-300 transition-colors">
                  {r.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {r.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Game Scoring Mechanics Detail */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-950/30 to-violet-950/20 border border-indigo-500/10 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Interactive Score Ledger</h3>
            <p className="text-slate-500 text-xs uppercase tracking-wider font-extrabold">Formula for Ultimate Supremacy</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-4">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-1.5">
            <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Multiplier Base</span>
            <h4 className="text-2xl font-black text-white">Difficulty Level</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Easy maps to <strong>1x base XP</strong>, Medium gives <strong>1.5x</strong>, Hard offers <strong>2x</strong>, and Extreme multiplies at <strong>3x XP</strong>.
            </p>
          </div>

          <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-1.5">
            <span className="text-[10px] uppercase font-black text-orange-400 tracking-wider">Streak Factor</span>
            <h4 className="text-2xl font-black text-white">Continual Accuracy</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Answering correctly increases multiplier multiplier. Any wrong equation triggers immediate streak resets to maintain professional fair play!
            </p>
          </div>

          <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-1.5">
            <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">Global Standing</span>
            <h4 className="text-2xl font-black text-white">Live Sync Stats</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Scores are automatically logged directly to Firebase Firestore, updating the leaderboard stats and badge records instantly.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
          <span className="text-slate-400 text-xs font-medium text-center sm:text-left">
            Ready to test these formulas in live battle? Select a grade lesson or multiplayer queue now.
          </span>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onNavigateToTab('hub')}
              className="flex-1 sm:flex-initial px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Browse Lessons
            </button>
            <button
              onClick={() => onNavigateToTab('quiz')}
              className="flex-1 sm:flex-initial px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-600/20"
            >
              Battle Arena
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
