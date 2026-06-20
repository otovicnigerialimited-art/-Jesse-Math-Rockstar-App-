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
  Lock,
  Loader2,
  Home,
  FileText,
  HelpCircle,
  Star,
  Globe,
  User
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import LearningHub from './components/LearningHub';
import BadgesSection, { getWeeklyData } from './components/BadgesSection';
import { UserStats, Difficulty, Lesson } from './types';
import { cn } from './lib/utils';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';
import AuthGate from './components/AuthGate';
import ArenaMatches from './components/ArenaMatches';
import HomeLanding from './components/HomeLanding';
import RulesPage from './components/RulesPage';
import TermsPage from './components/TermsPage';
import DeveloperPage from './components/DeveloperPage';


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
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'hub' | 'quiz' | 'badges' | 'rules' | 'terms' | 'seo' | 'developer'>('home');
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('math_rockstar_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');

  // Custom configurations (TTRS sound, avatars & speed)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [configSettings, setConfigSettings] = useState(() => {
    const saved = localStorage.getItem('math_rockstar_config');
    return saved ? JSON.parse(saved) : {
      soundEffects: true,
      rockMusic: true,
      selectedAvatar: '🎸 Math Rockstar',
      customSpeed: 'easy' as Difficulty
    };
  });

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

  const [userDeviceId, setUserDeviceId] = useState<string | null>(null);
  const [practiceLesson, setPracticeLesson] = useState<Lesson | null>(null);

  const fetchAndSyncProfile = async (uname: string, deviceId: string) => {
    const userDocRef = doc(db, "users", deviceId);
    let userDoc;
    try {
      userDoc = await getDoc(userDocRef);
    } catch (e) {
      console.warn("Failed to fetch user document from Firestore, falling back:", e);
    }

    try {
      if (userDoc && userDoc.exists()) {
        const profile = userDoc.data();
        setAuthState({
          isAuthenticated: true,
          isChecking: false,
          isCookieBlocked: false,
          message: `Logged in as ${profile.username}!`,
          username: profile.username
        });
        // Map stats from Database
        setStats({
          totalSolved: profile.totalSolved || 0,
          correctAnswers: profile.correctAnswers || 0,
          level: Math.floor((profile.xp || 100) / 1000) + 1,
          xp: profile.xp || 100,
          streak: profile.streak || 0,
          bestStreak: Math.max(profile.bestStreak || 0, profile.streak || 0),
          history: profile.history || [],
          unlockedBadges: profile.badges || ["Genius Debut"]
        });
      } else {
        // Save dynamically on Firestore if missing
        try {
          await setDoc(userDocRef, {
            uid: deviceId,
            username: uname,
            xp: 100,
            streak: 1,
            coins: 100,
            badges: ["Genius Debut"],
            createdAt: Date.now()
          });
        } catch (srvErr) {
          console.warn("Could not save profile record to database:", srvErr);
        }

        setAuthState({
          isAuthenticated: true,
          isChecking: false,
          isCookieBlocked: false,
          message: `Welcome to Jesse Rock, ${uname}!`,
          username: uname
        });
      }
    } catch (e) {
      console.error("Error loading user profile:", e);
      setAuthState({
        isAuthenticated: true,
        isChecking: false,
        isCookieBlocked: false,
        message: "Logged in",
        username: uname
      });
    }
  };

  useEffect(() => {
    // Check if there is an active logged-in math rockstar on this device
    const storedUsername = localStorage.getItem('jesse_rock_my_username');
    let storedDeviceId = localStorage.getItem('jesse_rock_device_id');
    
    if (!storedDeviceId) {
      storedDeviceId = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('jesse_rock_device_id', storedDeviceId);
    }
    
    setUserDeviceId(storedDeviceId);

    if (storedUsername) {
      fetchAndSyncProfile(storedUsername, storedDeviceId);
    } else {
      setAuthState({
        isAuthenticated: false,
        isChecking: false,
        isCookieBlocked: false,
        message: "Please register to begin.",
        username: null
      });
    }
  }, []);

  const handleStandardLogin = () => {};
  const handlePopupLoginFallback = () => {};

  const handleSignOut = async () => {
    localStorage.removeItem('jesse_rock_my_username');
    setAuthState({
      isAuthenticated: false,
      isChecking: false,
      isCookieBlocked: false,
      message: "Please enter your name to begin.",
      username: null
    });
  };

  useEffect(() => {
    localStorage.setItem('math_rockstar_stats', JSON.stringify(stats));
  }, [stats]);

  // Real-time online heartbeat hook for live player scanning
  useEffect(() => {
    if (!authState.isAuthenticated || !userDeviceId) return;

    const updateActivity = async () => {
      try {
        await updateDoc(doc(db, "users", userDeviceId), {
          lastActiveAt: Date.now(),
          username: authState.username || "Anonymous Hero"
        });
      } catch (err) {
        try {
          await setDoc(doc(db, "users", userDeviceId), {
            lastActiveAt: Date.now(),
            username: authState.username || "Anonymous Hero"
          }, { merge: true });
        } catch (subErr) {
          console.warn("Heartbeat update failed:", subErr);
        }
      }
    };

    updateActivity();

    // Check-in every 30 seconds
    const interval = setInterval(updateActivity, 30000);
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, userDeviceId, authState.username]);

  const handleQuizFinish = async (score: number, total: number, xpGained: number) => {
    const { weekKey } = getWeeklyData();
    let updatedStats: any = null;

    setStats(prev => {
      const newXP = prev.xp + xpGained;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const currentStreak = score > 0 ? prev.streak + 1 : 0;
      const best = Math.max(prev.bestStreak, currentStreak);
      
      const prevWeekly = prev.weeklyProgress?.weekKey === weekKey 
        ? prev.weeklyProgress 
        : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };
      
      const newWeekly = {
        ...prevWeekly,
        solvedThisWeek: (prevWeekly?.solvedThisWeek || 0) + score,
        xpThisWeek: (prevWeekly?.xpThisWeek || 0) + xpGained
      };
      
      const next = {
        ...prev,
        totalSolved: prev.totalSolved + total,
        correctAnswers: prev.correctAnswers + score,
        xp: newXP,
        level: newLevel,
        streak: currentStreak,
        bestStreak: best,
        weeklyProgress: newWeekly
      };
      updatedStats = next;
      return next;
    });

    if (userDeviceId) {
      try {
        await setDoc(doc(db, "users", userDeviceId), {
          totalSolved: (updatedStats?.totalSolved || stats.totalSolved) + total,
          correctAnswers: (updatedStats?.correctAnswers || stats.correctAnswers) + score,
          xp: updatedStats?.xp || (stats.xp + xpGained),
          streak: updatedStats?.streak || (score > 0 ? stats.streak + 1 : 0),
          bestStreak: Math.max(stats.bestStreak, updatedStats?.streak || 0),
          badges: updatedStats?.unlockedBadges || stats.unlockedBadges || []
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userDeviceId}`);
      }
    }
    
    setPracticeLesson(null);
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

  if (authState.isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-brand-primary w-12 h-12 mx-auto" strokeWidth={3} />
          <p className="text-sm font-black tracking-wider text-slate-400">CONNECTING TO JESSE ROCK MATH ARENA...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <AuthGate 
        onAuthSuccess={(uname, matchedUid) => {
          setUserDeviceId(matchedUid);
          fetchAndSyncProfile(uname, matchedUid);
        }} 
      />
    );
  }

  const navItems = [
    { id: 'home', label: 'Welcome Home', icon: Home },
    { id: 'dashboard', label: 'My Progress Stats', icon: Award },
    { id: 'hub', label: 'Learning Hub', icon: BookOpen },
    { id: 'quiz', label: 'Play Arena', icon: Trophy },
    { id: 'badges', label: 'Badges & Quests', icon: Star },
    { id: 'rules', label: 'How It Works & Rules', icon: HelpCircle },
    { id: 'terms', label: 'Terms & Policies', icon: FileText },
    { id: 'developer', label: 'Meet Developer', icon: User }
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50 font-sans selection:bg-brand-primary selection:text-white">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 glass border-r-0 transition-transform lg:translate-x-0 lg:static shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex flex-col gap-1 mb-10 px-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
                  <Trophy className="text-white" size={22} />
                </div>
                <h1 className="text-2xl font-display font-black tracking-tight leading-tight">
                  JESSE ROCK<br />
                  <span className="text-brand-primary text-xl">MATH</span>
                </h1>
              </div>

              {/* Mobile Close Button */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Close Menu"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-[11px] text-brand-accent font-medium tracking-wide italic mt-3 bg-white/5 py-1 px-2.5 rounded-lg border-l-2 border-brand-accent">
              ★ "We are young genius"
            </p>
            <div className="mt-3 flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/15 rounded-xl text-left">
              <div className="text-xl">🎸</div>
              <div className="min-w-0 font-sans">
                <p className="text-[11px] font-black text-slate-200 truncate">
                  {authState.isAuthenticated ? (authState.username || "Young Genius Scholar") : "Local Guest Player"}
                </p>
                <p className="text-[9px] text-brand-accent/90 font-extrabold uppercase tracking-wide truncate">
                  Star: {configSettings.selectedAvatar}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative",
                  activeTab === item.id 
                    ? "bg-brand-primary text-white rock-shadow" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Active Device sync details */}
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-450 font-black uppercase tracking-wider">Device Sync Status</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-black">
                <ShieldCheck size={11} className="animate-pulse" /> Secure
              </span>
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] text-slate-400 leading-normal font-medium">
                Signed in as: <strong className="text-white">{authState.username}</strong>
              </p>
              <button 
                onClick={handleSignOut}
                className="w-full py-2 bg-gradient-to-r from-rose-600/20 to-red-600/20 hover:from-rose-600/30 hover:to-red-600/30 text-rose-450 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                🔑 Switch / Log In
              </button>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-bold transition-all cursor-pointer"
            >
              <Settings size={20} /> Settings Configs
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Header / Toggle Bar */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900/90 border border-white/10 rounded-2xl mb-6 backdrop-blur-md sticky top-0 z-30 shadow-lg shadow-black/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-md shadow-brand-primary/20 shrink-0">
                <Trophy className="text-white" size={16} />
              </div>
              <span className="text-xs font-display font-black tracking-tight leading-none text-white">
                JESSE ROCK<br />
                <span className="text-brand-primary text-xs">MATH 👑</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sign Out / Log Out Button on Mobile */}
              <button 
                onClick={handleSignOut}
                className="p-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                title="Sign Out / Switch Player Account"
              >
                <Lock size={14} className="shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wider hidden xs:inline">Sign Out</span>
              </button>

              {/* Settings Action on Mobile Toggle Bar */}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1"
                title="Settings Configs"
              >
                <Settings size={14} />
                <span className="text-[9px] font-bold hidden sm:inline">Settings</span>
              </button>

              {/* Sidebar Menu Toggle */}
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl shadow-md cursor-pointer flex items-center justify-center transition-all"
                title="Toggle Menu"
              >
                {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {/* Top Persistent Header on Desktop & Tablet */}
          <div className="mb-6 hidden md:flex items-center justify-between p-5 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/10 flex items-center justify-center text-sm border border-violet-500/10">
                👑
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider leading-none">Logged In Player</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black text-white">{authState.username}</span>
                  <span className="flex items-center gap-1 text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping animate-duration-1000" />
                    Verified Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('developer')}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'developer' 
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/35 shadow-md shadow-violet-500/10' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-transparent'
                }`}
              >
                <User size={13} /> Meet Developer
              </button>

              <button
                onClick={handleSignOut}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-650 hover:from-rose-500 hover:to-red-650 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Lock size={12} /> Sign Out / Switch Login
              </button>
            </div>
          </div>

          {/* Active Iframe / Cookie Blocking Warning Block */}
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
                  <h4 className="text-sm font-black text-amber-200">Cross-Site Cookie Blocked (Iframe Sandbox)</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-0.5">
                    Your browser limits third-party storage access inside iframes. No worries—click Bypass & Sync to authorize.
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
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <HomeLanding 
                  username={authState.username || "Young Genius"} 
                  stats={{
                    level: stats.level,
                    streak: stats.streak,
                    correctAnswers: stats.correctAnswers,
                    totalSolved: stats.totalSolved
                  }}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onNavigateToLesson={(lessonId) => {
                    const lessonsReference = [
                      { id: '1', difficulty: 'easy', title: 'Multiplication Mastery' },
                      { id: '2', difficulty: 'medium', title: 'Division Decoded' },
                      { id: '4', difficulty: 'hard', title: 'Long Division Arena' },
                      { id: '5', difficulty: 'extreme', title: 'Fraction Fusion' },
                      { id: '3', difficulty: 'hard', title: 'Algebraic Basics' }
                    ];
                    const selected = lessonsReference.find(l => l.id === lessonId);
                    if (selected) {
                      setSelectedDifficulty(selected.difficulty as Difficulty);
                      setPracticeLesson(selected as any);
                      setActiveTab('quiz');
                    }
                  }}
                />
              </motion.div>
            )}

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
                  setPracticeLesson(lesson);
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
                {practiceLesson ? (
                  <div>
                    <div className="mb-6 flex gap-3 items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Practice mode 🎓</span>
                        <h2 className="text-2xl font-display font-black text-white">{practiceLesson.title} Practice</h2>
                      </div>
                      <button 
                        onClick={() => setPracticeLesson(null)} 
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold font-mono cursor-pointer animate-pulse"
                      >
                        ← Back to HUB
                      </button>
                    </div>
                    <Quiz 
                      difficulty={selectedDifficulty} 
                      onFinish={(score, total, xpGained) => {
                        handleQuizFinish(score, total, xpGained);
                        setPracticeLesson(null);
                      }}
                      onExit={() => {
                        setPracticeLesson(null);
                        setActiveTab('hub');
                      }}
                    />
                  </div>
                ) : (
                  <ArenaMatches 
                    currentUser={{ uid: userDeviceId || "dev", username: authState.username || "Human Player" }}
                    onExit={() => setActiveTab('home')}
                    soundEffectsEnabled={configSettings.soundEffects}
                  />
                )}
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

            {activeTab === 'rules' && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RulesPage onNavigateToTab={(tab) => setActiveTab(tab)} />
              </motion.div>
            )}

            {activeTab === 'terms' && (
              <motion.div
                key="terms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <TermsPage />
              </motion.div>
            )}

            {activeTab === 'developer' && (
              <motion.div
                key="developer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <DeveloperPage currentUser={{ uid: userDeviceId || 'guest', username: authState.username || 'Genius Scholar' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Settings Modal (TTRS Style) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/10 p-6 md:p-8 shadow-2xl z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-primary/20 text-brand-primary rounded-xl">
                    <Settings size={22} className="animate-spin-slow text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-black tracking-tight text-white leading-none">ROCK CONFIGS</h3>
                    <p className="text-[10px] text-brand-accent tracking-wider font-extrabold uppercase bg-white/5 px-2 py-0.5 rounded mt-1.5 inline-block">TT Rockstars Tweak Config</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6">
                {/* Sounds Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Music size={14} className="text-violet-400" /> Sound & Music Toggles
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setConfigSettings(prev => {
                        const next = { ...prev, soundEffects: !prev.soundEffects };
                        localStorage.setItem('math_rockstar_config', JSON.stringify(next));
                        return next;
                      })}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer",
                        configSettings.soundEffects 
                          ? "bg-brand-primary/15 border-brand-primary/40 text-white" 
                          : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <span className="text-[11px] font-bold text-slate-400">Game SFX Sounds</span>
                      <span className="text-sm font-black mt-2">{configSettings.soundEffects ? "🔊 Beeps: ON" : "🔇 Beeps: OFF"}</span>
                    </button>

                    <button 
                      onClick={() => setConfigSettings(prev => {
                        const next = { ...prev, rockMusic: !prev.rockMusic };
                        localStorage.setItem('math_rockstar_config', JSON.stringify(next));
                        return next;
                      })}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer",
                        configSettings.rockMusic 
                          ? "bg-violet-600/15 border-violet-500/40 text-white" 
                          : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <span className="text-[11px] font-bold text-slate-400">Rock Beats Music</span>
                      <span className="text-sm font-black mt-2">{configSettings.rockMusic ? "🎸 Beats: ON" : "🔇 Beats: OFF"}</span>
                    </button>
                  </div>
                </div>

                {/* Avatar Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={14} className="text-amber-400" /> Choose Rock Star Avatar
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: '🎸 Math Rockstar', emoji: '🎸' },
                      { name: '👑 Young Genius', emoji: '👑' },
                      { name: '⚡ Scratch Ninja', emoji: '⚡' },
                      { name: '🔥 Table Titan', emoji: '🔥' },
                      { name: '🔮 Science Wiz', emoji: '🔮' },
                      { name: '🚀 Orbit Cadet', emoji: '🚀' }
                    ].map((av) => (
                      <button
                        key={av.name}
                        onClick={() => setConfigSettings(prev => {
                          const next = { ...prev, selectedAvatar: av.name };
                          localStorage.setItem('math_rockstar_config', JSON.stringify(next));
                          return next;
                        })}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer",
                          configSettings.selectedAvatar === av.name
                            ? "bg-gradient-to-br from-violet-600 to-indigo-600 border-violet-500/40 scale-105 shadow-lg shadow-violet-600/20 text-white font-black"
                            : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200"
                        )}
                      >
                        <span className="text-2xl">{av.emoji}</span>
                        <span className="text-[10px] font-bold tracking-tight leading-tight">{av.name.replace(/^[^\s]+\s/, '')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Tweak Section (Difficulty) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Award size={14} className="text-cyan-400" /> TTRS Speed / Difficulty
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {(['easy', 'medium', 'hard', 'extreme'] as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setSelectedDifficulty(d);
                          setConfigSettings(prev => {
                            const next = { ...prev, customSpeed: d };
                            localStorage.setItem('math_rockstar_config', JSON.stringify(next));
                            return next;
                          });
                        }}
                        className={cn(
                          "py-2 px-1 rounded-xl border text-center font-black text-[10px] capitalize transition-all cursor-pointer",
                          selectedDifficulty === d
                            ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                            : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-black text-xs rounded-xl tracking-wider transition-all cursor-pointer shadow-md shadow-brand-primary/20"
                >
                  ✓ SAVE CONFIGS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
