import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SUPABASE_SQL_SCHEMA } from '../lib/schoolDb';
import PlayerSignIns from './PlayerSignIns';
import { 
  ShieldCheck, 
  Lock, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Sparkles,
  Trophy,
  Copy,
  Terminal,
  Database,
  Users
} from 'lucide-react';

export default function CreatorPanel() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedInput = password.trim();
    if (trimmedInput === '321jesserockstar') {
      setUnlocked(true);
      setSuccess("Creator verification code matches! Welcome Back, Jesse! Rock on.");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      console.warn("Unauthorised Access Attempt on Jesse's Desk.");
      setError("Incorrect Master Creator Code. Verification failed!");
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900/30 to-indigo-900/30 border border-violet-500/15 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Trophy size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-violet-400 tracking-wider bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10">Private Creator Room</span>
            <h1 className="text-2xl font-display font-black text-white mt-1">Jesse's Rockstar Control Panel</h1>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!unlocked ? (
          /* Password Gate Form */
          <motion.div 
            key="lock-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="flex justify-center py-12"
          >
            <div className="w-full max-w-md bg-slate-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-md space-y-6 shadow-2xl">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
                  <Lock size={24} />
                </div>
                <h2 className="text-lg font-black text-white">Private Rockstar Vault</h2>
                <p className="text-xs text-slate-400">Please verify your credentials to unlock creator dashboards and databases.</p>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Creator Master PIN</label>
                  <input
                    type="password"
                    placeholder="Enter Jesse's code..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white outline-none focus:border-rose-500 transition-all font-mono text-center text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-650 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/10 cursor-pointer"
                >
                  UNLOCK SYSTEM LEDGER ⚡
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* Main Dashboard Content for Jesse and Developers */
          <motion.div 
            key="dashboard-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl flex items-start gap-2.5">
                <Check size={16} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Quick Status grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-violet-400 flex items-center gap-2">
                  <Terminal size={16} /> Backend System State
                </h3>
                <div className="space-y-2 font-mono text-[11px] text-slate-300 bg-slate-950 border border-white/5 p-4 rounded-xl">
                  <div className="flex justify-between">
                    <span>Arena Host Version:</span>
                    <span className="text-emerald-400 font-bold">Live v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Session Storage:</span>
                    <span className="text-cyan-400">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Roster Schema Strategy:</span>
                    <span className="text-purple-400">Teacher-Managed</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Sparkles size={16} /> Database Topology
                </h3>
                <div className="space-y-2 font-mono text-[11px] text-slate-300 bg-slate-950 border border-white/5 p-4 rounded-xl">
                  <div className="flex justify-between">
                    <span>Workspace Engine:</span>
                    <span className="text-amber-400">Google Firestore</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Export Target:</span>
                    <span className="text-emerald-400">PostgreSQL / Supabase</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auth Decoupling:</span>
                    <span className="text-indigo-400">Fully Isolated</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SQL Export Box (Spec Targeted) */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
                    <Database size={16} />
                    Supabase SQL Schema Export Ledger
                  </h3>
                  <p className="text-xs text-slate-400">
                    Use this script directly in your Vercel/Supabase SQL editor to instantiate relational tables cleanly.
                  </p>
                </div>
                <button
                  onClick={handleCopySchema}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase rounded-xl transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer shadow-md"
                >
                  {copied ? (
                    <>
                      <Check size={13} /> COPIED!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> COPY SCHEMA
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 border border-white/5 p-5 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-300 max-h-72 overflow-y-auto block text-left">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>

            {/* Active Players & Gift Desk */}
            <div className="bg-slate-900/60 border border-amber-500/20 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-mono">
                    <Users size={16} />
                    Jesse's Active Players Desk
                  </h3>
                  <p className="text-xs text-slate-400">
                    See sign-in details, passwords, and send users a FREE STREAK bonus directly here.
                  </p>
                </div>
              </div>
              
              <PlayerSignIns />
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
