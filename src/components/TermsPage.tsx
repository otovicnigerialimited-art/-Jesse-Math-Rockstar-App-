import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Scale, Lock, RefreshCw, AppWindow } from 'lucide-react';

export default function TermsPage() {
  const policies = [
    {
      title: "1. Device-Bound Identity Mechanism",
      icon: <Lock className="text-violet-400" size={18} />,
      content: "Since we do not request personal emails, usernames are tied to a unique device key stored on your local browser. If you clear cookies or browser data, you may need to register a new unique name if ownership caches are lost. Always write down your legendary math tag!"
    },
    {
      title: "2. Unique Namespace Principle & Claiming Rules",
      icon: <ShieldCheck className="text-emerald-400" size={18} />,
      content: "No two players can have the same username. Each claimed username is globally unique and recorded on our dynamic Firestore ledger. If another young scholar tries to use your identical name, they will be blocked with an 'already taken' alert."
    },
    {
      title: "3. Absolute Privacy Covenant",
      icon: <Shield className="text-cyan-400" size={18} />,
      content: "Your data is safe with us. We never request private details like credit cards, telephone numbers, emails, or real-life family names. We only store your chosen public math identity and game performance metrics to construct our global leaderboards."
    },
    {
      title: "4. Intellectual Ownership and Assets",
      icon: <AppWindow className="text-amber-400" size={18} />,
      content: "All Jesse Rock math questions, core layout parameters, multiplication multipliers, music tracks, and graphical assets are copyright under the Jesse Rock Math Arena educational initiative. Student achievements and badges are owned collectively."
    },
    {
      title: "5. Fair Play and Honor Code",
      icon: <Scale className="text-indigo-400" size={18} />,
      content: "Jesse Rock relies heavily on student brainpower. Use of calculators, screen scripts, bot answers, or outer automation tools inside the multiplayer arena is strictly forbidden. We preserve a clean sanctuary for genius mathematical minds to flourish!"
    }
  ];

  return (
    <div className="space-y-10 py-4">
      {/* Page Header */}
      <div className="text-center md:text-left space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-black uppercase text-emerald-400 tracking-wider">
          <Scale size={12} /> SECURE COMPLIANCE & PRIVACY CODES
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
          Terms of Service & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Policies</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Welcome to our official compliance guidelines. Read how we protect you, enforce fair play regulations, and build a trusted space for players.
        </p>
      </div>

      {/* Policies Grid */}
      <div className="space-y-6">
        {policies.map((p, idx) => (
          <div 
            key={idx}
            className="p-6 md:p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-emerald-500/20 transition-all space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl text-slate-300">
                {p.icon}
              </div>
              <h3 className="text-lg font-black text-white">{p.title}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium pl-1">
              {p.content}
            </p>
          </div>
        ))}
      </div>

      {/* Disclaimers Panel */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
          <ShieldAlert size={14} /> Critical Platform Disclaimer
        </div>
        <p className="text-[11px] text-slate-450 leading-relaxed font-medium">
          THIS SOFTWARE IS PROVIDED "AS IS" BY THE JESSE ROCK TEAM WITHOUT ANY EXPRESSED OR IMPLIED WARRANTIES. WE ARE NOT LIABLE FOR TRANSITIONAL DATA DROPS OR LOCAL REGISTRY EXPIRES. MATCH RECORDS ARE KEPT ON SECURE MULTI-REGION REALTIME FIREBASE REPOSITORIES TO PRESERVE MAXIMUM STRETCHES OF HISTORY.
        </p>
        <p className="text-[10px] text-slate-600 font-mono">
          Last Revision: June 2026. Approved under Young Genius Educational Standard Code.
        </p>
      </div>
    </div>
  );
}
