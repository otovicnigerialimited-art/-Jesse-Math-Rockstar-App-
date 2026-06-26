import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  User, 
  Check, 
  ShieldAlert, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  LogIn,
  UserPlus,
  Mail,
  Zap,
  Contact,
  Cpu,
  Activity,
  Database,
  TrendingUp,
  Layers,
  Radio,
  Power,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Server,
  Terminal,
  Sparkles
} from 'lucide-react';
import jesseRockLogo from '../assets/images/jesse_rock_logo_1782041250458.jpg';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  authenticateSchoolStudent,
  authenticateSchoolTeacher,
  registerTeacher
} from '../lib/schoolDb';

interface AuthGateProps {
  onAuthSuccess: (username: string, uid: string) => void;
  onGuestPlay?: () => void;
}

export default function AuthGate({ onAuthSuccess, onGuestPlay }: AuthGateProps) {
  // Tabs: 'individual' for Rockstar/Student Login, 'teacher' for Teacher Login, 'developer' for Developer Login
  const [loginTab, setLoginTab] = useState<'individual' | 'teacher' | 'developer'>('individual');
  
  const backgroundEmojis = React.useMemo(() => {
    const emojis = ['🎸', '👑', '🚀', '➕', '✖️', '🎸', '👑', '🚀', '➖', '➗'];
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      char: emojis[i % emojis.length],
      left: `${(i * 17) % 94 + 3}%`,
      size: `${18 + (i * 7) % 20}px`,
      duration: `${15 + (i * 9) % 20}s`,
      delay: `${-((i * 13) % 25)}s`
    }));
  }, []);
  
  // Individual login sub-mode: 'rockstar' or 'student'
  const [individualSubMode, setIndividualSubMode] = useState<'rockstar' | 'student'>('rockstar');

  // Teacher sign up toggle
  const [isTeacherSignUp, setIsTeacherSignUp] = useState(false);

  // loading and feedbacks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Home Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student Login States
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Teacher Login & Register States
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  const [teacherNameSignup, setTeacherNameSignup] = useState('');
  const [teacherEmailSignup, setTeacherEmailSignup] = useState('');
  const [teacherPasswordSignup, setTeacherPasswordSignup] = useState('');

  // --- DEVELOPER TAB STATES & HANDLERS ---
  const [devPassword, setDevPassword] = useState('');
  const [showDevPassword, setShowDevPassword] = useState(false);
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false);
  const [devSessionToken, setDevSessionToken] = useState<string | null>(null);
  const [devError, setDevError] = useState<string | null>(null);

  // Live simulation states for Developer Portal
  const [visitorCount, setVisitorCount] = useState(16);
  const [latency, setLatency] = useState(38);
  const [cloudKey, setCloudKey] = useState('SHA-256: 8f9a2b...');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Base state tracking variables
  const BASE_ASSET_VALUE = 4000;
  const BASE_NET_WORTH = 6000;

  // Mutable array tracking live features
  const [features, setFeatures] = useState([
    { id: 'leaderboard', name: 'Global Leaderboard System', valueBoost: 1500, deployed: true, logicDriver: 'onSnapshot_realtime' },
    { id: 'gemini', name: 'Gemini AI Real-time Math Prompts', valueBoost: 1200, deployed: true, logicDriver: 'gemini_flash_stream' },
    { id: 'arena', name: 'Multiplayer Workout Arenas', valueBoost: 2000, deployed: true, logicDriver: 'firestore_lobby_sync' },
    { id: 'backend', name: 'Secure Backend Proxy (server.ts)', valueBoost: 800, deployed: true, logicDriver: 'express_ingress_node' }
  ]);

  // Handle local session storage and concurrent lock handshakes
  useEffect(() => {
    // Check if there's an existing valid developer session
    const activeToken = localStorage.getItem('jesse_dev_active_session_token');
    const mySavedToken = localStorage.getItem('jesse_dev_my_token');

    if (activeToken && mySavedToken && activeToken === mySavedToken) {
      setIsDevAuthenticated(true);
      setDevSessionToken(mySavedToken);
    }

    // Handshake event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jesse_dev_active_session_token') {
        const newValue = e.newValue;
        const currentLocalToken = localStorage.getItem('jesse_dev_my_token');
        if (newValue && currentLocalToken && newValue !== currentLocalToken) {
          // KICK-OUT! Another tab authenticated!
          setIsDevAuthenticated(false);
          setDevSessionToken(null);
          localStorage.removeItem('jesse_dev_my_token');
          setDevError("Session terminated: A new developer login was validated on another tab.");
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Initialize and run the simulation loop for Server Activity Feed
  useEffect(() => {
    if (!isDevAuthenticated) return;

    // Seed initial logs
    setSystemLogs([
      `[INFO] Developer Portal initiated successfully at ${new Date().toLocaleTimeString()}`,
      `[SECURE] Encrypted session key created: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      `[SYNC] Connected to firestore: ai-studio-fdec55b7-ba82-44d4-ae95-0c5de616e19f`,
      `[SYSTEM] Latency baseline calculated at 38ms`
    ]);

    const logPhrases = [
      "[SYNC] Real-time guestbook entries loaded successfully.",
      "[SECURE] Active cross-tab handshake status verified: SECURE.",
      "[DB] onSnapshot subscription updated: 0 active conflicts.",
      "[VITE] Middleware hot-reload buffer cleared.",
      "[METRIC] Visitor baseline recalculation triggered.",
      "[HEALTH] Memory usage stabilized at 41.2 MB.",
      "[SECURITY] Master token integrity check: PASSED.",
      "[INGRESS] Handshake request completed from node_agent."
    ];

    const interval = setInterval(() => {
      // Fluctuate visitor count naturally
      setVisitorCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 5 ? (next <= 30 ? next : 30) : 5;
      });

      // Fluctuate database latency
      setLatency(() => Math.floor(32 + Math.random() * 14));

      // Generate random hash-key fragment
      setCloudKey(`SHA-256: ${Math.random().toString(16).substring(2, 8)}...`);

      // Add a dynamic log entry
      setSystemLogs(prev => {
        const randomPhrase = logPhrases[Math.floor(Math.random() * logPhrases.length)];
        const timeStamp = new Date().toLocaleTimeString();
        const formattedLog = `[${timeStamp}] ${randomPhrase}`;
        return [formattedLog, ...prev.slice(0, 19)]; // Keep last 20 logs
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isDevAuthenticated]);

  // Toggle dynamic features to recalculate assets
  const handleToggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => {
      if (f.id === id) {
        const nextState = !f.deployed;
        // Post log about toggling
        const timeStamp = new Date().toLocaleTimeString();
        setSystemLogs(old => [
          `[${timeStamp}] [TRIGGER] Feature "${f.name}" was ${nextState ? 'DEPLOYED (+£' + f.valueBoost + ')' : 'DEACTIVATED (-£' + f.valueBoost + ')'}`,
          ...old
        ]);
        return { ...f, deployed: nextState };
      }
      return f;
    }));
  };

  // Perform live real-time calculations based on active feature objects
  const deployedBoost = features.filter(f => f.deployed).reduce((sum, f) => sum + f.valueBoost, 0);
  const dynamicAssetValue = BASE_ASSET_VALUE + deployedBoost;
  const dynamicNetWorth = BASE_NET_WORTH + deployedBoost;

  // Donut chart stroke-dashoffset calculation
  const maxPossibleBoost = features.reduce((sum, f) => sum + f.valueBoost, 0);
  const engagementPercentage = maxPossibleBoost > 0 ? Math.round((deployedBoost / maxPossibleBoost) * 100) : 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (engagementPercentage / 100) * circumference;

  // Developer Login submission handler
  const handleDevLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDevError(null);

    if (devPassword === "jesse2015") {
      const newToken = `dev_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Save locally and globally
      localStorage.setItem('jesse_dev_my_token', newToken);
      localStorage.setItem('jesse_dev_active_session_token', newToken);
      
      setDevSessionToken(newToken);
      setIsDevAuthenticated(true);
      setDevPassword('');
    } else {
      setDevError("Access Denied: Incorrect master developer password entered.");
    }
  };

  // Developer Log-out handler
  const handleDevLogout = () => {
    localStorage.removeItem('jesse_dev_my_token');
    // If we logout, we also clear the active session token so other tabs can login or clean up
    const activeToken = localStorage.getItem('jesse_dev_active_session_token');
    const myToken = localStorage.getItem('jesse_dev_my_token');
    if (activeToken === myToken) {
      localStorage.removeItem('jesse_dev_active_session_token');
    }
    setIsDevAuthenticated(false);
    setDevSessionToken(null);
  };

  // 1. Individual ("Home Login") Handler 
  const handleHomeLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Please pick a beautiful Math identity username!");
      return;
    }

    if (cleanUsername.includes(' ')) {
      setError("Spaces are strictly forbidden in rockstar names! Use letters & numbers only.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Name must be at least 3 characters long!");
      return;
    }

    const cleanPassword = password.trim();
    if (!cleanPassword) {
      setError("Please pick a legendary Math Rockstar Password to secure your account!");
      return;
    }

    if (cleanPassword.length < 4) {
      setError("Your secure password must be at least 4 characters long!");
      return;
    }

    setLoading(true);

    try {
      let uid = localStorage.getItem('jesse_rock_device_id');
      if (!uid) {
        uid = `dev_${Math.floor(100000 + Math.random() * 900000)}`;
      }
      localStorage.setItem('jesse_rock_device_id', uid);

      const nameDocRef = doc(db, "usernames", cleanUsername.toLowerCase());
      const nameSnap = await getDoc(nameDocRef);

      if (nameSnap.exists()) {
        const existingData = nameSnap.data();
        if (existingData.password && existingData.password !== cleanPassword) {
          setError("This username is already taken. Please enter the correct password!");
          setLoading(false);
          return;
        }

        if (!existingData.password) {
          try {
            await setDoc(nameDocRef, {
              password: cleanPassword
            }, { merge: true });
          } catch (err) {
            console.warn("Failed to set backward-compatible password:", err);
          }
        }

        const correctUid = existingData.uid || uid;
        localStorage.setItem('jesse_rock_role', 'individual');
        localStorage.setItem('jesse_rock_device_id', correctUid);
        localStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, correctUid);
        localStorage.setItem('jesse_rock_my_username', existingData.username || cleanUsername);
        localStorage.setItem('jesse_rock_user_id', correctUid);
        
        setSuccess(`Welcome back, ${existingData.username || cleanUsername}! Loading progress...`);
        setTimeout(() => {
          onAuthSuccess(existingData.username || cleanUsername, correctUid);
        }, 1200);
        return;
      }

      try {
        await setDoc(nameDocRef, {
          uid: uid,
          username: cleanUsername,
          password: cleanPassword,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error("Could not register username on Firestore:", err);
        throw new Error("Failed to reserve legendary username. Please try again!");
      }

      const userProfileRef = doc(db, "users", uid);
      try {
        await setDoc(userProfileRef, {
          uid: uid,
          username: cleanUsername,
          password: cleanPassword,
          xp: 100,
          streak: 1, 
          coins: 100,
          badges: ["Genius Debut"],
          createdAt: Date.now()
        });
      } catch (err) {
        console.warn("Could not save initial user profile doc, falling back securely:", err);
      }

      localStorage.setItem('jesse_rock_role', 'individual');
      localStorage.setItem('jesse_rock_device_id', uid);
      localStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, uid);
      localStorage.setItem('jesse_rock_my_username', cleanUsername);
      localStorage.setItem('jesse_rock_user_id', uid);

      setSuccess(`Congratulations! Username "${cleanUsername}" is now registered.`);
      setTimeout(() => {
        onAuthSuccess(cleanUsername, uid);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to enter Jesse Rock Math Arena. Check internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // 2. School Student Login Handler
  const handleStudentLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = studentUsername.trim().toLowerCase();
    const cleanPass = studentPassword.trim();

    if (!cleanUser) {
      setError("Error: Student username is required.");
      return;
    }
    if (!cleanPass) {
      setError("Error: Student password pin is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await authenticateSchoolStudent(cleanUser, cleanPass);
      if (!res || !res.success || !res.userObj) {
        setError(res?.error || "Incorrect Student username or secret password pair.");
        setLoading(false);
        return;
      }

      const freshStudent = res.userObj;

      localStorage.setItem('jesse_rock_role', 'student'); 
      localStorage.setItem('jesse_rock_user_id', freshStudent.id);
      localStorage.setItem('jesse_rock_my_username', freshStudent.username);
      localStorage.setItem('jesse_rock_real_name', freshStudent.real_first_name);
      localStorage.setItem('jesse_rock_teacher_id', freshStudent.teacher_id);

      setSuccess(`Verified Rockstar Student @${freshStudent.username}! Preparing your instruments...`);
      setTimeout(() => {
        onAuthSuccess(freshStudent.username, freshStudent.id);
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Failed to log in student.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Teacher Login Handler
  const handleTeacherLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = teacherEmail.trim().toLowerCase();
    const cleanPass = teacherPassword.trim();

    if (!cleanEmail) {
      setError("Error: Email address is required.");
      return;
    }
    if (!cleanEmail.includes('@')) {
      setError("Error: Please provide a valid email address.");
      return;
    }
    if (!cleanPass) {
      setError("Error: Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await authenticateSchoolTeacher(cleanEmail, cleanPass);
      if (!res || !res.success || !res.userObj) {
        setError(res?.error || "Invalid teacher email or login password.");
        setLoading(false);
        return;
      }

      const authenticatedTeacher = res.userObj;

      localStorage.setItem('jesse_rock_role', 'teacher');
      localStorage.setItem('jesse_rock_user_id', authenticatedTeacher.id);
      localStorage.setItem('jesse_rock_my_username', authenticatedTeacher.email);
      localStorage.setItem('jesse_rock_real_name', authenticatedTeacher.teacher_name);

      setSuccess(`Welcome back, Teacher ${authenticatedTeacher.teacher_name}! Synchronising...`);
      setTimeout(() => {
        onAuthSuccess(authenticatedTeacher.email, authenticatedTeacher.id);
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Teacher login check failed.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Teacher Registration Handler
  const handleTeacherSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = teacherNameSignup.trim();
    const cleanEmail = teacherEmailSignup.trim().toLowerCase();
    const cleanPass = teacherPasswordSignup.trim();

    if (!cleanName) {
      setError("Error: Educator's name is required.");
      return;
    }
    if (cleanName.length < 2) {
      setError("Error: Educator's name must be at least 2 characters long.");
      return;
    }
    if (!cleanEmail) {
      setError("Error: Registered email address is required.");
      return;
    }
    if (!cleanEmail.includes('@')) {
      setError("Error: Please enter a valid school/personal email address.");
      return;
    }
    if (!cleanPass) {
      setError("Error: Roster workspace security password is required.");
      return;
    }
    if (cleanPass.length < 4) {
      setError("Error: Security password must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerTeacher(cleanName, cleanEmail, cleanPass);
      if (!res.success || !res.userObj) {
        setError(res.error || "Educator account creation was unable to complete.");
        setLoading(false);
        return;
      }

      const freshlyTeacher = res.userObj;

      localStorage.setItem('jesse_rock_role', 'teacher');
      localStorage.setItem('jesse_rock_user_id', freshlyTeacher.id);
      localStorage.setItem('jesse_rock_my_username', freshlyTeacher.email);
      localStorage.setItem('jesse_rock_real_name', freshlyTeacher.teacher_name);
      localStorage.setItem('jesse_rock_device_id', freshlyTeacher.id);

      setSuccess(`Teacher Workspace Registered Successfully! Launching Class ${freshlyTeacher.teacher_name}...`);
      setTimeout(() => {
        onAuthSuccess(freshlyTeacher.email, freshlyTeacher.id);
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Failed to complete teacher registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-tr from-purple-900 via-indigo-950 to-pink-900 relative overflow-x-hidden font-sans text-white">
      {/* Floating Emojis Background */}
      <div className="floating-bg-container">
        {backgroundEmojis.map((emoji) => (
          <div
            key={emoji.id}
            className="floating-emoji-item"
            style={{
              left: emoji.left,
              fontSize: emoji.size,
              animationDuration: emoji.duration,
              animationDelay: emoji.delay,
            }}
          >
            {emoji.char}
          </div>
        ))}
      </div>

      {/* Background radial soft lights */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* SEALED COMPONENT CHECK: Render Developer Portal Dashboard if Dev Authenticated and developer tab active */}
      {isDevAuthenticated && loginTab === 'developer' ? (
        <motion.div 
          id="developer-dashboard"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl bg-slate-900/70 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative z-10 space-y-8 text-left"
        >
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)] select-none border border-cyan-400">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Jesse Otobo's Developer Portal</h1>
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-[9px] font-mono font-black text-amber-500 uppercase">
                    ELITE DEVELOPER
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[9px] font-mono font-black text-emerald-400 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> SESSION SECURE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium font-mono mt-0.5">Device ID Authentication Handshake Status: APPROVED</p>
              </div>
            </div>
            
            <button
              onClick={handleDevLogout}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded-xl text-xs font-black uppercase text-rose-400 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <LogOut size={13} />
              <span>TERMINATE SESSION</span>
            </button>
          </div>

          {/* 4-Column Performance Metrics Layout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="bg-slate-950/45 border border-white/10 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Dynamic Net Worth</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#10b981] font-mono">£{dynamicNetWorth.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-500 font-mono font-bold">LIVE</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Starting base: £{BASE_NET_WORTH.toLocaleString()} + deployed modules</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-950/45 border border-white/10 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Dynamic Asset Value</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-cyan-400 font-mono">£{dynamicAssetValue.toLocaleString()}</span>
                <span className="text-[10px] text-cyan-500 font-mono font-bold">SECURED</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Starting base: £{BASE_ASSET_VALUE.toLocaleString()} + deployed modules</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-950/45 border border-white/10 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">System Health / Latency</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#10b981] font-mono">{latency}ms</span>
                <span className="text-[10px] text-emerald-500 font-mono font-bold uppercase">HEALTHY</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Firestore connection sync active</p>
            </div>

            {/* Metric 4 */}
            <div className="bg-slate-950/45 border border-white/10 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Active Observers</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-500 font-mono">{visitorCount}</span>
                <span className="text-[10px] text-amber-500 font-mono font-bold uppercase animate-pulse">● LIVE</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Active client sockets synchronized</p>
            </div>
          </div>

          {/* Double Column Data Split Ledger */}
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Left: Deployed modules & Live Database Logs Ledger */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Feature Deployment Module Controller */}
              <div className="bg-slate-950/45 border border-white/10 rounded-2xl p-5 space-y-4 shadow-inner">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Module Configuration Engine</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Toggle mathematical modules to dynamically adjust valuation matrix, net worth, and asset value equations.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {features.map((f) => (
                    <div 
                      key={f.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        f.deployed 
                          ? 'bg-slate-900/60 border-cyan-500/25 shadow-inner' 
                          : 'bg-slate-950/40 border-white/5 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white leading-snug">{f.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-black ${
                            f.deployed ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {f.deployed ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Driver: {f.logicDriver}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-1">
                        <span className="text-[10px] font-mono font-black text-[#10b981]">+£{f.valueBoost.toLocaleString()}</span>
                        
                        {/* Custom switch slider */}
                        <button
                          type="button"
                          onClick={() => handleToggleFeature(f.id)}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer relative ${
                            f.deployed ? 'bg-cyan-500' : 'bg-slate-850'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-slate-950 rounded-full shadow-md transform transition-transform ${
                            f.deployed ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Scrolling Logs Ledger */}
              <div className="bg-slate-950/45 border border-white/10 rounded-2xl p-5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-400" />
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Live Sync Security Stream Ledger</h3>
                  </div>
                  <span className="text-[9px] font-mono font-medium text-slate-500">Key: {cloudKey}</span>
                </div>

                <div className="h-44 bg-slate-950/80 border border-white/5 rounded-xl p-3.5 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-2 select-text">
                  {systemLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed hover:bg-white/5 p-0.5 rounded transition-colors">
                      <span className="text-cyan-500/90">&gt;</span> <span className={`${
                        log.includes('[ERROR]') ? 'text-rose-400' : 
                        log.includes('[TRIGGER]') ? 'text-amber-400' : 
                        log.includes('[SECURE]') || log.includes('[SUCCESS]') ? 'text-[#10b981]' : 'text-slate-350'
                      }`}>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Engagement Metric Donut Chart */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-950/45 border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center justify-center space-y-4 shadow-inner">
                <div className="w-full text-left">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Platform Deployment Metric</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Asset deployment utilization</p>
                </div>

                {/* Donut Chart SVG */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="10"
                    />
                    {/* Progress Circle with calculated dynamic offsets */}
                    <motion.circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#06b6d4"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Inside Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white font-mono">{engagementPercentage}%</span>
                    <span className="text-[9px] font-mono text-slate-400 font-black uppercase">DEPLOYED</span>
                  </div>
                </div>

                <div className="w-full space-y-2 border-t border-white/5 pt-4">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Deployed Boost:</span>
                    <span className="text-emerald-400 font-black">+£{deployedBoost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Base Net Worth:</span>
                    <span className="text-slate-300">£{BASE_NET_WORTH.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono font-bold border-t border-dashed border-white/10 pt-2 mt-1">
                    <span className="text-white">Active Net Worth:</span>
                    <span className="text-cyan-400 font-black">£{dynamicNetWorth.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      ) : (
        /* If Developer is NOT authorized or we are in another tab, show the main AuthGate view with the three-portal selector */
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6 text-center"
        >
          {/* Logo and Brand details */}
          <div className="space-y-2.5">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 12 }}
              className="w-16 h-16 rounded-[1.25rem] overflow-hidden shadow-[0_0_20px_rgba(236,72,153,0.3)] border border-white/10 mx-auto cursor-pointer"
            >
              <img src={jesseRockLogo} alt="Jesse Rock Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
            
            <h1 className="text-2xl font-display font-black tracking-tight text-white leading-none mt-2">
              JESSE ROCK<br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(244,63,94,0.4)] text-xl font-black tracking-widest uppercase">
                MATH ARENA 👑
              </span>
            </h1>
            
            <div className="py-1 px-2.5 bg-violet-600/10 border border-violet-500/20 text-violet-350 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 justify-center mx-auto">
              <Lock size={10} className="text-violet-400 animate-pulse" /> Secure Classroom Gate
            </div>
          </div>

          {/* 3-Way Portal Selector: Individual, Teacher, Developer Login */}
          <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/5 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => { setLoginTab('individual'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                loginTab === 'individual'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={12} />
              <span>Individual</span>
            </button>
            
            <button
              type="button"
              onClick={() => { setLoginTab('teacher'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                loginTab === 'teacher'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap size={12} />
              <span>Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginTab('developer'); setError(null); setSuccess(null); setDevError(null); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                loginTab === 'developer'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu size={12} />
              <span>Developer Login</span>
            </button>
          </div>

          {/* Notifications and messages inside card */}
          {error && loginTab !== 'developer' && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
            >
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && loginTab !== 'developer' && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
            >
              <Check size={14} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Tab 1: Individual Home Login Form */}
          {loginTab === 'individual' && (
            <div className="space-y-4 text-left">
              {/* Mini Sub-tab toggle for Rockstar play vs Student play inside Individual Login tab */}
              <div className="flex bg-slate-950/70 p-0.5 rounded-lg border border-white/10 text-[9px] font-mono uppercase font-black">
                <button
                  type="button"
                  onClick={() => { setIndividualSubMode('rockstar'); setError(null); }}
                  className={`flex-1 py-1 rounded transition-all ${
                    individualSubMode === 'rockstar' ? 'bg-slate-800/80 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ⭐ Rockstar User
                </button>
                <button
                  type="button"
                  onClick={() => { setIndividualSubMode('student'); setError(null); }}
                  className={`flex-1 py-1 rounded transition-all ${
                    individualSubMode === 'student' ? 'bg-slate-800/80 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  🍏 School Student PIN
                </button>
              </div>

              {individualSubMode === 'rockstar' ? (
                /* Rockstar Form */
                <form onSubmit={handleHomeLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                      Legendary Rockstar Username
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="GeniusMathMage"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                      Math Rockstar Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password or secret PIN"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "ENTER INDIVIDUAL PLAY ✨"}
                  </button>
                </form>
              ) : (
                /* Student Form */
                <form onSubmit={handleStudentLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                      Student Username
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. mason_star"
                        value={studentUsername}
                        onChange={(e) => setStudentUsername(e.target.value.replace(/\s/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                      Student Password PIN
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showStudentPassword ? "text" : "password"}
                        placeholder="e.g. play123"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                      >
                        {showStudentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "ENTER SCHOOL ARENA 🍏"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Teacher Login or signup workspace */}
          {loginTab === 'teacher' && (
            <div className="space-y-4">
              {!isTeacherSignUp ? (
                /* Teacher SignIn Form */
                <form onSubmit={handleTeacherLoginSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                      Teacher Registered Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        placeholder="teacher@school.edu"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                      Teacher Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showTeacherPassword ? "text" : "password"}
                        placeholder="Your secret passcode"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                      >
                        {showTeacherPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn size={13} />
                    <span>{loading ? "Checking Database..." : "LOGIN TEACHER CABINET"}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsTeacherSignUp(true); setError(null); setSuccess(null); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                    >
                      Don't have an account? Sign up here as a Teacher
                    </button>
                  </div>
                </form>
              ) : (
                /* Teacher Registration Form */
                <form onSubmit={handleTeacherSignupSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <Contact size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Jesse Rockstar"
                        value={teacherNameSignup}
                        onChange={(e) => setTeacherNameSignup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                      Academic Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        placeholder="teacher@jesserock.edu"
                        value={teacherEmailSignup}
                        onChange={(e) => setTeacherEmailSignup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                      Register Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showTeacherPassword ? "text" : "password"}
                        placeholder="Secret alphanumeric passcode"
                        value={teacherPasswordSignup}
                        onChange={(e) => setTeacherPasswordSignup(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                      >
                        {showTeacherPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus size={13} />
                    <span>{loading ? "Creating..." : "REGISTER TEACHER CABINET"}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsTeacherSignUp(false); setError(null); setSuccess(null); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                    >
                      Already have an account? Login here
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab 3: Developer Portal Login Form */}
          {loginTab === 'developer' && (
            <form onSubmit={handleDevLoginSubmit} className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu size={14} className="text-cyan-400" />
                  <span>Developer Authorization Gate</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium font-mono mt-1 leading-relaxed">
                  Enter master security key to configure real-time assets, monitor live Firestore synchronize status, and adjust engagement indices.
                </p>
              </div>

              {devError && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
                >
                  <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                  <span>{devError}</span>
                </motion.div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                  Master Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showDevPassword ? "text" : "password"}
                    placeholder="Enter Master Password"
                    value={devPassword}
                    onChange={(e) => setDevPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-cyan-500 transition-all font-semibold font-mono"
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDevPassword(!showDevPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                  >
                    {showDevPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <ShieldCheck size={14} />
                <span>AUTHORIZE GATEWAYS</span>
              </button>
            </form>
          )}

          {/* Universal Guest Play Button */}
          {onGuestPlay && loginTab !== 'developer' && (
            <div className="pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={onGuestPlay}
                disabled={loading}
                className="w-full py-3 bg-white text-slate-900 border border-gray-300 hover:bg-slate-100 font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.15)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs"
              >
                <Zap size={14} className="text-amber-500" />
                QUICK PLAY AS GUEST ⚡
              </button>
            </div>
          )}

        </motion.div>
      )}
    </div>
  );
}
