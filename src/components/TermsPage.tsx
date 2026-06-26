import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Scale, 
  Lock, 
  RefreshCw, 
  AppWindow, 
  FileText, 
  Eye, 
  Sparkles, 
  Ban, 
  Server, 
  Database, 
  Heart,
  Layers,
  Fingerprint,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<'dual' | 'terms' | 'privacy'>('dual');

  const termsSections = [
    {
      id: "t1",
      title: "1. Description of Service",
      icon: <AppWindow className="text-pink-400" size={16} />,
      content: "Jesse Rock Math is an interactive, gamified educational software application designed to provide math practice tools. The platform utilizes real-time database synchronization and integrated artificial intelligence (AI) engines to dynamically generate learning materials."
    },
    {
      id: "t2",
      title: "2. Intellectual Property",
      icon: <Scale className="text-violet-400" size={16} />,
      content: "All software code, user interface designs, branding, logos, algorithms, and simulated valuation matrices displayed on the platform are the sole intellectual property of Jesse Otobo and protected under global copyright laws. You may not reverse-engineer, scrape, copy, or redistribute any source code or assets without explicit written permission."
    },
    {
      id: "t3",
      title: "3. Simulated Financial Metrics & Virtual Systems",
      icon: <Sparkles className="text-amber-400" size={16} />,
      content: "Any metrics, scores, badges, net worth displays, or asset values shown on the developer portal or game panels are strictly virtual, simulated tracking tokens. They carry zero real-world monetary value, cannot be redeemed for legal currency, and do not represent a real financial instrument."
    },
    {
      id: "t4",
      title: "4. Prohibited User Conduct",
      icon: <Ban className="text-red-400" size={16} />,
      content: "Users agree not to: Deploy automated bots, scrapers, or scripts to manipulate the real-time leaderboard data; Exploit any software bugs or inject unauthorized data streams into the Firestore infrastructure; Attempt to bypass Vercel serverless execution limits, API routing boundaries, or security handshake keys."
    },
    {
      id: "t5",
      title: "5. Limitation of Liability",
      icon: <ShieldAlert className="text-cyan-400" size={16} />,
      content: "The platform is provided on an 'as-is' and 'as-available' basis. We do not guarantee that the AI engine will always generate flawless problems, or that real-time database latency will remain completely uninterrupted. In no event shall the developer be liable for server timeouts, Vercel Hobby tier runtime disruptions, or minor system latency anomalies."
    }
  ];

  const privacySections = [
    {
      id: "p1",
      title: "1. Information We Collect",
      icon: <Lock className="text-emerald-400" size={16} />,
      content: "We prioritize minimal data collection to maximize user privacy. Leaderboard Data: If you participate in our live game, we store a self-chosen, public username and your verified math score. System Telemetry: We monitor standard runtime metrics, including function latency (e.g., millisecond baseline response rates) and active browser socket counts, to maintain server health."
    },
    {
      id: "p2",
      title: "2. Third-Party Data Processing",
      icon: <Server className="text-blue-400" size={16} />,
      content: "Our professional tech stack integrates trusted third-party cloud infrastructure components: Hosting & Edge Routing: Your web requests are processed through Vercel's global serverless network infrastructure. Real-Time Synchronisation: Username and leaderboard documents are safely synchronized live using Google Firebase / Firestore. Artificial Intelligence Engine: Input parameters are evaluated using Google Gemini AI models to stream tailored mathematical equations dynamically. No personally identifiable tracking data is shared with the AI models."
    },
    {
      id: "p3",
      title: "3. Security Framework",
      icon: <ShieldCheck className="text-indigo-400" size={16} />,
      content: "We utilize security rules directly within our Firebase framework to isolate variables and block client-side injection attacks. All sensitive operational secrets, including secure API credentials, are fully masked via hidden serverless backend variables."
    },
    {
      id: "p4",
      title: "4. Children's Privacy & Safety",
      icon: <Heart className="text-rose-400" size={16} />,
      content: "Jesse Rock Math is dedicated to offering a secure educational sandbox environment. We do not solicit, track, or collect persistent offline personal information from student users. Leaderboards require only a temporary display nickname, ensuring complete anonymity and safe interactions."
    }
  ];

  const trustBadges = [
    { title: "Minimal Data", desc: "No PII Collected", color: "from-teal-500/10 to-emerald-500/10 border-teal-500/20 text-teal-400" },
    { title: "Zero Ads", desc: "No Ad Trackers", color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400" },
    { title: "No Data Brokers", desc: "No Data Sold", color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400" },
    { title: "Firebase Secured", desc: "Encrypted Handshakes", color: "from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-400" }
  ];

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-850 pb-8">
        <div className="space-y-3 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-400 tracking-wider font-mono">
            <Shield size={12} /> SECURE COMPLIANCE CENTER
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-none">
            Legal & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">Compliance Hub</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Review our revised June 2026 guidelines. Below you can inspect our comprehensive, dual-pane layout showing both the Terms of Service and our high-performance, decentralised Privacy Policy side-by-side.
          </p>
        </div>

        {/* Quick Trust Summary badges */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className={`px-3 py-2 rounded-xl bg-gradient-to-b ${badge.color} border text-left min-w-[130px]`}>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={10} className="shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider font-mono">{badge.title}</span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* View Switcher / Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d0f12] p-2 border border-gray-850 rounded-2xl">
        <div className="flex p-1 bg-slate-950 border border-white/5 rounded-xl w-full sm:w-auto gap-1">
          <button
            onClick={() => setActiveTab('dual')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'dual'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={12} />
            Dual-Pane (See All)
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-pink-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText size={12} />
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye size={12} />
            Privacy Policy
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 px-2">
          <Fingerprint size={12} className="text-emerald-500 animate-pulse" />
          <span>Encryption Protocol Active</span>
        </div>
      </div>

      {/* Content Viewer with professional layout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {activeTab === 'dual' && (
            <div className="grid lg:grid-cols-2 gap-8 text-left">
              
              {/* Left Column: Terms of Service */}
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-500/5 via-violet-500/5 to-transparent border border-white/5 space-y-1">
                  <span className="text-[9px] font-mono text-pink-400 font-black tracking-widest uppercase">REGULATORY CODE A-102</span>
                  <h2 className="text-lg font-black text-white font-mono flex items-center gap-2">
                    <FileText size={16} className="text-pink-500" />
                    Terms of Service
                  </h2>
                  <p className="text-[10px] text-slate-400">Last Revised: June 2026 • Legally binding guidelines for platform interaction and simulated asset tokens.</p>
                </div>

                <div className="space-y-4">
                  {termsSections.map((sec) => (
                    <div 
                      key={sec.id}
                      className="p-5 rounded-2xl bg-[#111317]/80 border border-gray-800/60 hover:border-pink-500/20 transition-all space-y-2.5 text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-950 rounded-lg group-hover:scale-110 transition-transform">
                          {sec.icon}
                        </div>
                        <h3 className="text-xs font-black text-white font-mono tracking-tight uppercase">{sec.title}</h3>
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed font-medium font-sans">
                        {sec.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Privacy Policy */}
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent border border-white/5 space-y-1">
                  <span className="text-[9px] font-mono text-emerald-400 font-black tracking-widest uppercase">PRIVACY DIRECTIVE P-205</span>
                  <h2 className="text-lg font-black text-white font-mono flex items-center gap-2">
                    <Eye size={16} className="text-emerald-500" />
                    Privacy Policy
                  </h2>
                  <p className="text-[10px] text-slate-400">Last Revised: June 2026 • Full children's protection guidelines and privacy safeguards.</p>
                </div>

                <div className="space-y-4">
                  {privacySections.map((sec) => (
                    <div 
                      key={sec.id}
                      className="p-5 rounded-2xl bg-[#111317]/80 border border-gray-800/60 hover:border-emerald-500/20 transition-all space-y-2.5 text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-950 rounded-lg group-hover:scale-110 transition-transform">
                          {sec.icon}
                        </div>
                        <h3 className="text-xs font-black text-white font-mono tracking-tight uppercase flex items-center gap-1.5">
                          {sec.title}
                        </h3>
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed font-medium font-sans">
                        {sec.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6 max-w-4xl mx-auto text-left">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-500/10 via-violet-500/5 to-transparent border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-pink-400 font-bold">REVISED REQUISITE DOCUMENT</span>
                <h2 className="text-2xl font-black text-white font-mono">Terms of Service</h2>
                <p className="text-xs text-slate-400">Last Updated: June 2026 • By accessing or using our website, you agree to comply with and be bound by these Terms of Service.</p>
              </div>

              <div className="space-y-4">
                {termsSections.map((sec) => (
                  <div 
                    key={sec.id}
                    className="p-6 rounded-2xl bg-[#111317]/80 border border-gray-800/60 hover:border-pink-500/20 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-xl">
                        {sec.icon}
                      </div>
                      <h3 className="text-sm font-black text-white font-mono">{sec.title}</h3>
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed font-medium font-sans pl-1">
                      {sec.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 max-w-4xl mx-auto text-left">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold font-mono">REVISED REQUISITE DOCUMENT</span>
                <h2 className="text-2xl font-black text-white font-mono">Privacy & Safety Policy</h2>
                <p className="text-xs text-slate-400">Last Updated: June 2026 • Detailed safeguards and child safety specifications.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {privacySections.map((sec) => (
                  <div 
                    key={sec.id}
                    className="p-6 rounded-2xl bg-[#111317]/80 border border-gray-800/60 hover:border-emerald-500/20 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-xl">
                        {sec.icon}
                      </div>
                      <h3 className="text-sm font-black text-white font-mono flex items-center gap-2">
                        {sec.title}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed font-medium font-sans pl-1">
                      {sec.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Disclaimers Panel */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-white/5 space-y-4 text-left">
        <div className="flex items-center gap-2 text-rose-450 font-black text-xs uppercase tracking-wider font-mono">
          <ShieldAlert size={14} className="text-rose-500" />
          Critical Platform Disclaimer
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
          THIS SOFTWARE IS PROVIDED "AS IS" BY THE JESSE ROCK TEAM WITHOUT ANY EXPRESSED OR IMPLIED WARRANTIES. WE ARE NOT LIABLE FOR TRANSITIONAL DATA DROPS OR LOCAL REGISTRY EXPIRES. MATCH RECORDS ARE KEPT ON SECURE MULTI-REGION REALTIME FIREBASE REPOSITORIES TO PRESERVE MAXIMUM STRETCHES OF HISTORY.
        </p>
        <p className="text-[10px] text-slate-600 font-mono">
          Last Revision: June 2026. Approved under Young Genius Educational Standard Code. Authorized by Lead Architect Jesse Otobo.
        </p>
      </div>
    </div>
  );
}

