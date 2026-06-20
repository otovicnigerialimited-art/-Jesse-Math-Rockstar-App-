import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Settings, 
  LogOut,
  Menu,
  X,
  Music,
  Award,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Lock
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import LearningHub from './components/LearningHub';
import BadgesSection, { getWeeklyData } from './components/BadgesSection';
import { UserStats, Difficulty, Lesson } from './types';
import { cn } from './lib/utils';

const INITIAL_STATS: UserStats = {
  totalSolved: 0,
  correctAnswers: 0,
  level: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  history: []
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'hub' | 'quiz' | 'badges'>('dashboard');
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('math_rockstar_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');

  // Interactive Authentication State
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isChecking: boolean;
    isCookieBlocked: boolean;
    message: string;
    username: string | null;
  }>({
    isAuthenticated: false,
    isChecking: true,
    isCookieBlocked: false,
    message: "Initializing secure session...",
    username: null
  });

  // Verify auth session cookies with the server
  const verifyAuthSession = async () => {
    try {
      const res = await fetch('/api/auth-status');
      if (res.ok) {
        const data = await res.json();
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: data.authenticated,
          isChecking: false,
          isCookieBlocked: window.self !== window.top && !document.cookie.includes('session_token='),
          message: data.message
        }));
      } else {
        setAuthState(prev => ({ ...prev, isChecking: false }));
      }
    } catch (err) {
      console.warn("Could not reach backend API server. Operating in offline/client mode.", err);
      setAuthState(prev => ({ ...prev, isChecking: false }));
    }
  };

  useEffect(() => {
    // 1. Check initial status
    verifyAuthSession();

    // 2. Set up cross-origin secure message listener for the popup fallback
    const handlePopupMessage = (event: MessageEvent) => {
      // Validate that message is indeed our AUTH_SUCCESS
      if (event.data && event.data.type === 'AUTH_SUCCESS') {
        console.log("🔒 Secure auth cookie synced successfully from top-level popup!");
        setAuthState({
          isAuthenticated: true,
          isChecking: false,
          isCookieBlocked: false,
          message: "Secure cross-site session synced!",
          username: "Young Genius Scholar"
        });
      }
    };

    window.addEventListener('message', handlePopupMessage);
    return () => window.removeEventListener('message', handlePopupMessage);
  }, []);

  // Standard login trigger: attempts to login inside the iframe
  const handleStandardLogin = async () => {
    try {
      setAuthState(prev => ({ ...prev, isChecking: true }));
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: "Young Genius Scholar" })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Immediately double check if cookies actually set/passed correctly (detecting silent iframe cookie blocks)
        const checkRes = await fetch('/api/auth-status');
        const checkData = await checkRes.json();
        
        const testCookieSet = document.cookie.includes('session_token=');
        
        // If server says unauthorized but backend response said success, modern browser has blocked it silently inside the iframe
        const blocked = !checkData.authenticated && !testCookieSet;
        
        setAuthState({
          isAuthenticated: checkData.authenticated,
          isChecking: false,
          isCookieBlocked: blocked,
          message: blocked 
            ? "🔒 Iframe cookie block detected! Standard cookies are disabled in cross-origin iFrames. Use the Popup Fallback strategy to bypass."
            : "Successfully authenticated with SameSite=None secure cookies!",
          username: checkData.authenticated ? "Young Genius" : null
        });
      }
    } catch (err) {
      console.error(err);
      setAuthState(prev => ({ 
        ...prev, 
        isChecking: false, 
        message: "Offline demo session active." 
      }));
    }
  };

  // Secure top-level popup window strategy fallback (circumvents third-party cookie blocking)
  const handlePopupLoginFallback = () => {
    // Open the auth popup on the exact target origin of the app
    const width = 520;
    const height = 550;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '/api/auth-popup',
      'JesseRockMathAuthSync',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      alert("⚠️ Pop-up window was blocked by your browser! Please allow popups for this site to sync security cookies.");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {}
    document.cookie = "session_token=; path=/; max-age=0";
    setAuthState({
      isAuthenticated: false,
      isChecking: false,
      isCookieBlocked: false,
      message: "Successfully signed out. Cookies cleared.",
      username: null
    });
  };

  useEffect(() => {
    localStorage.setItem('math_rockstar_stats', JSON.stringify(stats));
  }, [stats]);

  const handleQuizFinish = (score: number, total: number, xpGained: number) => {
    const { weekKey } = getWeeklyData();
    setStats(prev => {
      const newXP = prev.xp + xpGained;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const currentStreak = score > 0 ? prev.streak + 1 : 0;
      
      // Update weekly progress tracking
      const prevWeekly = prev.weeklyProgress?.weekKey === weekKey 
        ? prev.weeklyProgress 
        : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };
      
      const newWeekly = {
        ...prevWeekly,
        solvedThisWeek: prevWeekly.solvedThisWeek + score, // only correct solves count
        xpThisWeek: prevWeekly.xpThisWeek + xpGained
      };
      
      return {
        ...prev,
        totalSolved: prev.totalSolved + total,
        correctAnswers: prev.correctAnswers + score,
        xp: newXP,
        level: newLevel,
        streak: currentStreak,
        bestStreak: Math.max(prev.bestStreak, currentStreak),
        history: [...prev.history, {
          date: new Date().toLocaleDateString(),
          score,
          total,
          difficulty: selectedDifficulty
        }],
        weeklyProgress: newWeekly
      };
    });
    setActiveTab('dashboard');
  };

  const handleClaimWeeklyBadge = () => {
    const { currentChallenge, weekKey } = getWeeklyData();
    setStats(prev => {
      const badges = prev.unlockedBadges || [];
      if (badges.includes(currentChallenge.id)) return prev;
      
      // Award 150 bonus XP to student instantly for claiming!
      const bonusXP = 150;
      const newXP = prev.xp + bonusXP;
      const newLevel = Math.floor(newXP / 1000) + 1;

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        unlockedBadges: [...badges, currentChallenge.id],
        weeklyProgress: {
          ...(prev.weeklyProgress || { weekKey, solvedThisWeek: 0, xpThisWeek: 0 }),
          weekKey,
          claimedWeeklyBadge: true
        }
      };
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hub', label: 'Learning Hub', icon: BookOpen },
    { id: 'quiz', label: 'The Arena', icon: Trophy },
    { id: 'badges', label: 'Badges & Quests', icon: Award },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50 font-sans selection:bg-brand-primary selection:text-white">
      {/* Mobile Nav Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 glass rounded-xl"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 glass border-r-0 transition-transform lg:translate-x-0 lg:static",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex flex-col gap-1 mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
                <Trophy className="text-white" size={22} />
              </div>
              <h1 className="text-2xl font-display font-black tracking-tight leading-tight">
                JESSE ROCK<br />
                <span className="text-brand-primary text-xl">MATH</span>
              </h1>
            </div>
            <p className="text-[11px] text-brand-accent font-medium tracking-wide italic mt-3 bg-white/5 py-1 px-2.5 rounded-lg border-l-2 border-brand-accent">
              ★ "We are young genius"
            </p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all",
                  activeTab === item.id 
                    ? "bg-brand-primary text-white rock-shadow" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <item.icon size={22} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Active Auth status & Cookie check */}
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Secure Sync</span>
              {authState.isAuthenticated ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-black">
                  <ShieldCheck size={12} className="animate-pulse" /> Secure
                </span>
              ) : authState.isCookieBlocked ? (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-black">
                  <ShieldAlert size={12} /> Blocked
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                  <Shield size={12} /> Local Mode
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 leading-normal font-medium">
                {authState.message}
              </p>
              
              {!authState.isAuthenticated ? (
                <div className="flex flex-col gap-1.5 pt-1">
                  <button 
                    onClick={handleStandardLogin}
                    className="w-full py-2 bg-brand-primary/20 hover:bg-brand-primary/35 text-brand-primary rounded-xl text-[11px] font-black tracking-wide transition-all text-center cursor-pointer"
                  >
                    Standard Login
                  </button>
                  <button 
                    onClick={handlePopupLoginFallback}
                    className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-[11px] font-black tracking-wide transition-all text-center flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-violet-600/10 hover:shadow-violet-600/20"
                  >
                    <ExternalLink size={11} /> Popup Fallback Sync
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleSignOut}
                  className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer"
                >
                  Clear Session
                </button>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 font-bold transition-all">
              <Settings size={20} /> Settings
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-bold transition-all">
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Active Iframe / Cookie Blocking Warning Banner */}
          {authState.isCookieBlocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md"
            >
              <div className="flex items-center gap-3.5 text-center md:text-left flex-col md:flex-row">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                  <ShieldAlert size={22} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-200">Cross-Site Cookie Blocked (Iframe Mode)</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-0.5">
                    Safari or Chrome is blocking third-party authentication cookies in this sandbox iframe. No worries—click Bypass & Sync to authorize.
                  </p>
                </div>
              </div>
              <button 
                onClick={handlePopupLoginFallback}
                className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer shadow-lg shadow-amber-500/15"
              >
                <ExternalLink size={13} /> Bypass & Sync via Popup
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Dashboard 
                  stats={stats} 
                  onStartQuiz={() => setActiveTab('quiz')} 
                />
              </motion.div>
            )}

            {activeTab === 'hub' && (
              <motion.div
                key="hub"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <LearningHub onStartLesson={(lesson) => {
                  setSelectedDifficulty(lesson.difficulty);
                  setActiveTab('quiz');
                }} />
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
              >
                <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
                  <h2 className="text-3xl font-display font-bold">The Arena</h2>
                  <div className="flex bg-white/5 p-1 rounded-2xl">
                    {(['easy', 'medium', 'hard', 'extreme'] as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                          selectedDifficulty === d ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-200"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <Quiz 
                  difficulty={selectedDifficulty} 
                  onFinish={handleQuizFinish}
                  onExit={() => setActiveTab('dashboard')}
                />
              </motion.div>
            )}

            {activeTab === 'badges' && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BadgesSection 
                  stats={stats}
                  onClaimWeeklyBadge={handleClaimWeeklyBadge}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
