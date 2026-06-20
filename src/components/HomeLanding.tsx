import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  BookOpen, 
  Award, 
  Search, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Flame, 
  Compass,
  ExternalLink,
  ChevronRight,
  Target
} from 'lucide-react';

interface HomeLandingProps {
  username: string;
  stats: {
    level: number;
    streak: number;
    correctAnswers: number;
    totalSolved: number;
  };
  onNavigateToTab: (tab: any) => void;
  onNavigateToLesson: (lessonId: string) => void;
}

const SITE_LESSONS = [
  { id: '1', title: 'Multiplication Mastery', cat: 'Arithmetic', desc: 'Step-by-step interactive array grids' },
  { id: '2', title: 'Division Decoded', cat: 'Arithmetic', desc: 'Splitting groups fairly with inverse math' },
  { id: '4', title: 'Long Division Arena', cat: 'Arithmetic', desc: 'Step-by-step long division workouts' },
  { id: '5', title: 'Fraction Fusion', cat: 'Arithmetic', desc: 'Learn parts with visual pie sectors' },
  { id: '3', title: 'Algebraic Basics', cat: 'Algebra', desc: 'Introducing dynamic equations and solving X' }
];

export default function HomeLanding({ username, stats, onNavigateToTab, onNavigateToLesson }: HomeLandingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter lessons based on query
  const filteredSuggestions = SITE_LESSONS.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const accuracy = stats.totalSolved > 0 
    ? Math.round((stats.correctAnswers / stats.totalSolved) * 100) 
    : 0;

  return (
    <div className="space-y-12">
      {/* Search & Site Explorer - Sleek Sticky feel */}
      <div className="relative">
        <div className="p-4 md:p-6 rounded-3xl bg-slate-900/30 border border-white/5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <Compass size={20} className="animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Interactive Site Explorer</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Instant Lesson Finder</p>
            </div>
          </div>

          {/* Search bar inputs */}
          <div className="relative w-full md:max-w-md">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search multiplication, fractions, algebraic equations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-white/5 rounded-2xl text-xs text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 font-semibold transition-all"
            />

            {/* Suggestions Overlay dropdown */}
            <AnimatePresence>
              {showSuggestions && searchQuery.trim().length > 0 && (
                <>
                  {/* Click trigger to dismiss suggestions */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-3 z-20 max-h-60 overflow-y-auto space-y-1"
                  >
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider px-2 pb-1.5 border-b border-white/5">Website Search Results</p>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => {
                            onNavigateToLesson(l.id);
                            setSearchQuery('');
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left p-2 hover:bg-white/5 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-black text-slate-200 group-hover:text-indigo-400 transition-colors">{l.title}</p>
                            <p className="text-[10px] text-slate-550 italic font-medium">{l.desc}</p>
                          </div>
                          <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded uppercase group-hover:bg-indigo-600/20 group-hover:text-indigo-400">
                            {l.cat}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-[11px] text-slate-500 italic text-center">No math topics found. Try typing 'division' or 'fraction'</p>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Hero Section */}
      <div className="relative overflow-hidden p-8 md:p-14 rounded-[3.5rem] bg-gradient-to-br from-violet-600/25 via-indigo-900/10 to-transparent border border-white/10 shadow-2xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 space-y-6 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-black text-violet-400 uppercase tracking-widest leading-none mx-auto md:mx-0">
            <Sparkles size={12} className="text-yellow-400 animate-pulse" /> ROCKSTAR PORTAL IS LIVE
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight leading-none text-white">
            WELCOME TO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              JESSE ROCK ARENA
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
            Hey <span className="text-violet-300 font-extrabold">{username}</span>, you are currently level <span className="text-violet-300 font-extrabold">{stats.level}</span>! 
            Challenge global duelists in real-time online battles, earn math tokens, master multi-grade math lessons, and climb the scoreboard! No third-party sign-ins, pure educational power.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
            <button
              onClick={() => onNavigateToTab('quiz')}
              className="w-full sm:w-auto px-10 py-5 btn-3d-pink text-white rounded-2xl font-black text-base tracking-wider uppercase flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              Enter Play Arena <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigateToTab('rules')}
              className="w-full sm:w-auto px-10 py-5 btn-3d-blue text-white rounded-2xl font-black text-base tracking-wide uppercase flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <HelpCircle size={17} /> How to Play & Rules
            </button>
          </div>
        </div>
      </div>

      {/* Website Core Feature Highlights */}
      <div className="space-y-6">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-xl font-black uppercase tracking-wider text-slate-300">Website Features & Hub Highlights</h2>
          <p className="text-xs text-slate-500 leading-normal font-medium">Explore the diverse features of Jesse Rock Math Hub in sequential pages</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 space-y-4 hover:border-violet-500/20 transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-400">
                <Trophy size={18} />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-violet-300 transition-colors">1. Quick Match Play Arena</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Engage in fast real-time matches against other players using direct Firestore synchronization. No restrictive Google popups!
              </p>
            </div>
            <button 
              onClick={() => onNavigateToTab('quiz')}
              className="text-[10px] text-violet-400 hover:text-violet-300 font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-2 mt-auto"
            >
              Start matchmaking now <ChevronRight size={12} />
            </button>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-400">
                <BookOpen size={18} />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">2. Interactive Learning Hub</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Access custom worksheets and visual generators for Arithmetic, Fraction Pie Fusion, Algebraic Basics, and step-by-step Division.
              </p>
            </div>
            <button 
              onClick={() => onNavigateToTab('hub')}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-2 mt-auto"
            >
              Browse curricula worksheets <ChevronRight size={12} />
            </button>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 space-y-4 hover:border-amber-500/20 transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-amber-600/10 rounded-xl flex items-center justify-center text-amber-400">
                <Award size={18} />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">3. Digital Medal Store</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Unlock weekly math challenges to earn ultra-rare elite badges (e.g. Genius Debut, Table Titan, Long Solver) to display on your global profile!
              </p>
            </div>
            <button 
              onClick={() => onNavigateToTab('badges')}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-2 mt-auto"
            >
              View unlocked trophies <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Mini Profile Sync Ticker banner */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px]">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>Active Device-Bound Username: <strong className="text-white">{username}</strong></span>
        </div>
        <div className="text-slate-500 font-semibold">
          Level {stats.level} Rank • Accuracy: {accuracy}% • Solved: {stats.totalSolved}
        </div>
      </div>
    </div>
  );
}
