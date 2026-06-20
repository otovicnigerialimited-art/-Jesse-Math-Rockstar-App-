import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  User, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  BookOpen, 
  FileText, 
  X, 
  ShieldAlert, 
  HelpCircle, 
  Activity, 
  Crown,
  Scale,
  Award,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthGateProps {
  onAuthSuccess: (username: string, uid: string) => void;
}

export default function AuthGate({ onAuthSuccess }: AuthGateProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Please pick a beautiful Math identity!");
      return;
    }

    if (cleanUsername.includes(' ')) {
      setError("Spaces are strictly forbidden in rockstar names! Use alphabets & numbers only.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Name must be at least 3 characters long!");
      return;
    }

    if (cleanUsername.length > 20) {
      setError("Rockstar names cannot exceed 20 characters!");
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
      // 1. Retrieve or generate a stable device ID for the session
      let deviceId = localStorage.getItem('jesse_rock_device_id');
      if (!deviceId) {
        deviceId = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem('jesse_rock_device_id', deviceId);
      }
      const uid = deviceId;

      // 2. Check if username is already claimed in Firestore global registry
      const nameDocRef = doc(db, "usernames", cleanUsername.toLowerCase());
      let nameDoc;
      try {
        nameDoc = await getDoc(nameDocRef);
      } catch (err) {
        console.warn("Firestore not reachable or offline - falling back:", err);
      }

      if (nameDoc && nameDoc.exists()) {
        const existingData = nameDoc.data();
        
        // Match secure identity password
        if (existingData.password) {
          if (existingData.password !== cleanPassword) {
            setError(`Security Block: The username "${cleanUsername}" is protected with a Math Rockstar Password. Enter the correct password or pick another name.`);
            setLoading(false);
            return;
          }
        } else {
          // Backward compatibility: secure the old user account with this password
          try {
            await setDoc(nameDocRef, {
              password: cleanPassword
            }, { merge: true });
          } catch (err) {
            console.warn("Failed to set backward-compatible password:", err);
          }
        }

        const correctUid = existingData.uid || uid;
        localStorage.setItem('jesse_rock_device_id', correctUid);
        localStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, correctUid);
        localStorage.setItem('jesse_rock_my_username', existingData.username || cleanUsername);
        
        setSuccess(`Welcome back, ${existingData.username || cleanUsername}! Loading progress...`);
        setTimeout(() => {
          onAuthSuccess(existingData.username || cleanUsername, correctUid);
        }, 1200);
        return;
      }

      // 3. Username is free! Claim it with password protection
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

      // Store identity mapping locally
      localStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, uid);
      localStorage.setItem('jesse_rock_my_username', cleanUsername);

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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden font-sans">
      {/* Dynamic Animated BG Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative z-10 space-y-8"
      >
        {/* Brand/Game Logo */}
        <div className="text-center space-y-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 12 }}
            className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-violet-500/30 mx-auto cursor-pointer"
          >
            <Trophy className="text-white" size={28} />
          </motion.div>
          
          <h1 className="text-3xl font-display font-black tracking-tight text-white leading-none">
            JESSE ROCK<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 text-2xl font-black tracking-widest uppercase">
              MATH ARENA 👑
            </span>
          </h1>
          
          <div className="py-2 px-3 bg-violet-600/10 border border-violet-500/20 text-violet-300 rounded-xl text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 justify-center mx-auto">
            <Lock size={12} className="text-violet-400 animate-pulse" /> Unified Log In & Register Center
          </div>

          <p className="text-slate-400 text-xs px-2 leading-relaxed">
            Specify your legendary Username and Math Rockstar Password below. New players will have their account registered instantly!
          </p>
        </div>

        {/* Claim Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl flex items-start gap-2.5"
            >
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl flex items-start gap-2.5"
            >
              <Check size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
              Legendary Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-4 text-slate-400" />
              <input
                id="username-entry"
                type="text"
                placeholder="GeniusMathMage"
                value={username}
                onChange={(e) => {
                  const val = e.target.value.replace(/\s/g, ''); // instantly remove spacing typos
                  setUsername(val);
                }}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-white/10 rounded-2xl text-white text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all font-semibold placeholder:text-slate-600"
                autoComplete="off"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
              Math Rockstar Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-4 text-slate-400" />
              <input
                id="password-entry"
                type={showPassword ? "text" : "password"}
                placeholder="Secure numeric PIN or text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 bg-slate-950 border border-white/10 rounded-2xl text-white text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all font-semibold placeholder:text-slate-600"
                autoComplete="off"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="btn-claim-identity"
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-600/30 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">Checking Ledger...</span>
            ) : (
              <>
                <Sparkles size={14} />
                ENTER THE ARENA
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Tabs for Terms, Rules */}
        <div className="flex items-center justify-center gap-4 text-xs pt-4 border-t border-white/5">
          <button 
            type="button"
            onClick={() => setShowTerms(true)}
            className="text-slate-500 hover:text-violet-400 transition-colors cursor-pointer font-bold tracking-tight inline-flex items-center gap-1.5"
          >
            <FileText size={13} /> Terms & Policies
          </button>
          <span className="text-slate-800">•</span>
          <button 
            type="button"
            onClick={() => setShowRules(true)}
            className="text-slate-500 hover:text-violet-400 transition-colors cursor-pointer font-bold tracking-tight inline-flex items-center gap-1.5"
          >
            <BookOpen size={13} /> How It Works & Rules
          </button>
        </div>
      </motion.div>

      {/* OVERLAY MODAL: Terms & Policies */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowTerms(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-400">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Terms & Policies</h3>
                  <p className="text-slate-500 text-xs">Official rules for Jesse Rock Math Arena players</p>
                </div>
              </div>

              <div className="space-y-4 text-slate-300 text-xs leading-relaxed font-sans">
                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400">1. Fair Play Covenant</h4>
                  <p>
                    All math duelists must rely solely on their brainpower. Use of calculators, scripts, or auto-solvers inside the Arena is strictly forbidden. We want to preserve the honor and fun of Jesse Rock.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400">2. Device Identity & Credentials</h4>
                  <p>
                    Since we don't ask you for any secret passwords, your exclusive username is claimed dynamically using secure anonymous Firebase Auth. A tracking record is registered to your device's browser local storage. Cleared storage may require choosing a new unique name if ownership logs are lost.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400">3. Ownership & Trademarks</h4>
                  <p>
                    All Math Arena problems, designs, logic systems, and graphical features are copyright of Jesse Rock Math Arena. Player-authored scores and badges are owned collectively under free game engagement.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400">4. Privacy Guarantee</h4>
                  <p>
                    We value your absolute data safety. We never request private details like your contact numbers, real names, or secret emails. We store solely your public math identity to construct global leaderboard states.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setShowTerms(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Close & Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY MODAL: How It Works & Rules */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-400">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">How It Works & Rules</h3>
                  <p className="text-slate-500 text-xs">Learn how to dominate the leaderboards</p>
                </div>
              </div>

              <div className="space-y-4 text-slate-300 text-xs leading-relaxed font-sans">
                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400 flex items-center gap-1.5">
                    <Activity size={12} /> Real-Time Quick Play Matchmaking
                  </h4>
                  <p>
                    Click <strong>"Find Match"</strong> in the Arena to start searching for active math duelists online. Once an opponent joins, the game starts instantly!
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400 flex items-center gap-1.5">
                    <Crown size={12} /> Objective & Game Scoring
                  </h4>
                  <p>
                    Both players represent themselves against the same math equations. Answer correctly as fast as possible to build multiplier speeds and gain higher progressive points!
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400 flex items-center gap-1.5">
                    <Award size={12} /> Sticking to the Streaks
                  </h4>
                  <p>
                    Winning sequential match duels builds a mighty multiplayer streak factor. If you exit or give a wrong response sheet, the streak resets to zero. Keep your active focus!
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400 flex items-center gap-1.5">
                    <Sparkles size={12} /> Levelling Up & Elite Badges
                  </h4>
                  <p>
                    Earning math XP expands your level rank. Build the ultimate trophy wall by unlocking elite badges like the <strong>Genius Debut</strong> to confirm your intellectual supremacy.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setShowRules(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Got It, Let's Play!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
