import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Contact
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
  // Tabs: 'individual' for Home Login, 'student' for Student Login, 'teacher' for Teacher Login
  const [loginTab, setLoginTab] = useState<'individual' | 'student' | 'teacher'>('individual');
  
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

  // 1. Individual ("Home Login") Handler 
  const handleHomeLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
      // Create session Device ID
      let uid = localStorage.getItem('jesse_rock_device_id');
      if (!uid) {
        uid = `dev_${Math.floor(100000 + Math.random() * 900000)}`;
      }

      const nameDocRef = doc(db, "usernames", cleanUsername.toLowerCase());
      const nameSnap = await getDoc(nameDocRef);

      if (nameSnap.exists()) {
        const existingData = nameSnap.data();
        if (existingData.password && existingData.password !== cleanPassword) {
          setError("This username is already taken. Please enter the correct password!");
          setLoading(false);
          return;
        }

        // Backward compatibility fix
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

      // Claim brand-new username!
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
    setSuccess(null);

    const cleanUser = studentUsername.trim().toLowerCase();
    const cleanPass = studentPassword.trim();

    // Browser validation first to protect DB resources
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

      // Save credentials locally
      localStorage.setItem('jesse_rock_role', 'student'); // keep 'student' role string for flawless game module compatibility
      localStorage.setItem('jesse_rock_user_id', freshStudent.id);
      localStorage.setItem('jesse_rock_my_username', freshStudent.username);
      localStorage.setItem('jesse_rock_real_name', freshStudent.real_first_name);
      localStorage.setItem('jesse_rock_device_id', freshStudent.id);
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
    setSuccess(null);

    const cleanEmail = teacherEmail.trim().toLowerCase();
    const cleanPass = teacherPassword.trim();

    // Browser local validation
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
      localStorage.setItem('jesse_rock_device_id', authenticatedTeacher.id);

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
    setSuccess(null);

    const cleanName = teacherNameSignup.trim();
    const cleanEmail = teacherEmailSignup.trim().toLowerCase();
    const cleanPass = teacherPasswordSignup.trim();

    // Browser checks to avoid wasting Supabase project tier
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-tr from-purple-900 via-indigo-950 to-pink-900 relative overflow-hidden font-sans">
      {/* Background radial soft lights */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-pink-500/30 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/30 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-900/80 backdrop-blur-2xl border-2 border-pink-500/50 p-6 md:p-8 rounded-[2.5rem] shadow-neon relative z-10 space-y-6"
      >
        {/* Logo and Brand details */}
        <div className="text-center space-y-2.5">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 12 }}
            className="w-16 h-16 rounded-[1.25rem] overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.6)] border border-cyan-400 mx-auto cursor-pointer"
          >
            <img src={jesseRockLogo} alt="Jesse Rock Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
          
          <h1 className="text-2xl font-display font-black tracking-tight text-white leading-none mt-2">
            JESSE ROCK<br />
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(244,63,94,0.4)] text-xl font-black tracking-widest uppercase">
              MATH ARENA 👑
            </span>
          </h1>
          
          <div className="py-1 px-2 bg-violet-600/10 border border-violet-500/20 text-violet-300 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 justify-center mx-auto">
            <Lock size={10} className="text-violet-400 animate-pulse" /> Secure Classroom Gate
          </div>
        </div>

        {/* 3-Way Portal Selector */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5 gap-1 shadow-inner">
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
            <span>Home</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setLoginTab('student'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
              loginTab === 'student'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LogIn size={11} />
            <span>Student</span>
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
        </div>

        {/* Notifications and messages inside card */}
        {error && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
          >
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
          >
            <Check size={14} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Tab 1: Individual Home Login Form */}
        {loginTab === 'individual' && (
          <form onSubmit={handleHomeLoginSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Legendary Username
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="GeniusMathMage"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Math Rockstar Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password or secret PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
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
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.5)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verifying..." : "ENTER INDIVIDUAL PLAY ✨"}
            </button>
          </form>
        )}

        {/* Tab 2: School Student Login Form */}
        {loginTab === 'student' && (
          <form onSubmit={handleStudentLoginSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Student Username
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. mason_star"
                  value={studentUsername}
                  onChange={(e) => setStudentUsername(e.target.value.replace(/\s/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Student Password PIN
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type={showStudentPassword ? "text" : "password"}
                  placeholder="e.g. play123"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
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
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.5)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Authenticating Student..." : "ENTER SCHOOL ARENA 🍏"}
            </button>
          </form>
        )}

        {/* Tab 3: Teacher Login or signup workspace */}
        {loginTab === 'teacher' && (
          <div className="space-y-4">
            {!isTeacherSignUp ? (
              /* Teacher SignIn Form */
              <form onSubmit={handleTeacherLoginSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Teacher Registered Email
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="teacher@school.edu"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Teacher Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type={showTeacherPassword ? "text" : "password"}
                      placeholder="Your secret passcode"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
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
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.5)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <Contact size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Jesse Rockstar"
                      value={teacherNameSignup}
                      onChange={(e) => setTeacherNameSignup(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Academic Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="teacher@jesserock.edu"
                      value={teacherEmailSignup}
                      onChange={(e) => setTeacherEmailSignup(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Register Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type={showTeacherPassword ? "text" : "password"}
                      placeholder="Secret alphanumeric passcode"
                      value={teacherPasswordSignup}
                      onChange={(e) => setTeacherPasswordSignup(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
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
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.5)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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

        {/* Universal Guest Play Button */}
        {onGuestPlay && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onGuestPlay}
              disabled={loading}
              className="w-full py-3 bg-white text-slate-900 border-2 border-indigo-500/30 hover:bg-slate-100 font-extrabold uppercase tracking-widest transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap size={14} className="text-amber-500" />
              QUICK PLAY AS GUEST ⚡
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}
