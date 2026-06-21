import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Scale, Lock, RefreshCw, AppWindow } from 'lucide-react';

export default function TermsPage() {
  const policies = [
    {
      title: "1. Information Collection and Usage",
      icon: <Lock className="text-violet-400" size={18} />,
      content: "We are committed to protecting the privacy of our users, especially younger scholars. Jesse Rock Math Arena collects minimal required information to function, including automatically generated anonymous device identifiers, gameplay scores, time analytics, and self-selected display names. We do not require or ask for personal email addresses, phone numbers, exact geolocation, or real-life full names. The data collected is utilized exclusively for generating leaderboards, retaining user progress, authorizing accounts securely via token-based mechanics, and maintaining the structural integrity of the application platform. All data is processed using industry-standard secure pathways."
    },
    {
      title: "2. Data Retention and Deletion",
      icon: <ShieldCheck className="text-emerald-400" size={18} />,
      content: "All performance and identity metrics are stored on isolated, encrypted cloud databases (Google Firebase Firestore). User data is retained only for as long as necessary to provide the ongoing gaming and educational experience. Since our authentication mechanisms occasionally rely on local browser hardware state, users may lose their progress context if they deliberately clear their cache without explicitly linking their account credentials to a teacher namespace. We reserve the right to prune abandoned or inactive accounts to optimize database latency."
    },
    {
      title: "3. Compliance with COPPA and FERPA Standards",
      icon: <Shield className="text-cyan-400" size={18} />,
      content: "Given our primary demographic includes young genius scholars, this application is engineered to strictly comply with the Children's Online Privacy Protection Act (COPPA) and the Family Educational Rights and Privacy Act (FERPA). We do not run any targeted third-party advertising tracking pixels, and we absolutely do not sell user data to advertising brokers. Any analytical tools utilized are strictly for enhancing educational delivery and optimizing application performance."
    },
    {
      title: "4. Intellectual Property and Content",
      icon: <AppWindow className="text-amber-400" size={18} />,
      content: "All proprietary application content—including the core mathematics generation engine, the 'Jesse Rock' brand identity, visual assets, CSS frameworks, sound effects, and user interfaces—is the exclusive intellectual property of the Jesse Rock Math Arena developmental organization. Users are granted a limited, personal, non-exclusive, non-transferable license to access the application for educational and entertainment usage. Reproducing, reverse-engineering, or scraping the application is an explicit violation of these terms."
    },
    {
      title: "5. Platform Fair Play Guidelines",
      icon: <Scale className="text-indigo-400" size={18} />,
      content: "While detailed gameplay rules reside in the Rules & Guides tab, users are legally required to maintain fair play to use our services. Any attempts to manipulate the global ledger via automated scripts, SQL injection, packet replay attacks, malicious extensions, or coordinated disruption will result in an immediate, permanent device and IP ban. We enforce a zero-tolerance policy against cyber-harassment in any custom text fields, including the Developer Guestbook."
    }
  ];

  return (
    <div className="space-y-10 py-4">
      {/* Page Header */}
      <div className="text-center md:text-left space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-black uppercase text-emerald-400 tracking-wider">
          <Scale size={12} /> SECURE COMPLIANCE & LEGAL CODES
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
          Terms of Service & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Privacy Policy</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Welcome to our official legal and compliance guidelines. Please read carefully to understand our data usage, security commitments, and the legal framework that safeguards the Jesse Rock Math Arena community.
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
