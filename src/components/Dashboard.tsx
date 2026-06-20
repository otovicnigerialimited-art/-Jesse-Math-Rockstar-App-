import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Award, 
  Flame, 
  Target, 
  Calendar,
  ChevronRight,
  Zap
} from 'lucide-react';
import { UserStats } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  stats: UserStats;
  onStartQuiz: () => void;
}

export default function Dashboard({ stats, onStartQuiz }: DashboardProps) {
  const accuracy = stats.totalSolved > 0 
    ? Math.round((stats.correctAnswers / stats.totalSolved) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden glass p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-brand-primary/20 via-brand-secondary/5 to-brand-accent/10 border border-white/10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-xs sm:text-sm font-bold text-brand-accent uppercase tracking-wider">
              <Award size={16} className="animate-spin-slow" /> Level {stats.level} Young Genius 👑
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none">
              JESSE ROCK <span className="text-brand-primary">MATH!</span>
            </h1>
            <p className="text-brand-accent text-lg sm:text-xl font-bold uppercase tracking-widest italic flex items-center md:justify-start justify-center gap-2">
              ✨ We are young genius ✨
            </p>
            <p className="text-slate-300 text-base sm:text-lg max-w-md font-medium">
              Ready to grow your brain muscles today? Solve math problems, unlock badges, and master math concepts step-by-step!
            </p>
            <div className="pt-2">
              <button 
                onClick={onStartQuiz}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/95 hover:to-brand-secondary/95 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl shadow-brand-primary/20 cursor-pointer"
              >
                <Zap fill="currentColor" size={24} /> Let's Play & Learn!
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <StatCard 
              icon={<Flame className="text-orange-400 animate-pulse" />} 
              label="Brain Streak" 
              value={stats.streak} 
              subValue={`Best: ${stats.bestStreak}`}
            />
            <StatCard 
              icon={<Target className="text-brand-primary" />} 
              label="Solves Accuracy" 
              value={`${accuracy}%`} 
              subValue={`${stats.correctAnswers} correct`}
            />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-brand-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-green-400" /> Progress
            </h3>
            <span className="text-xs text-slate-500">XP: {stats.xp}</span>
          </div>
          <div className="h-4 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(stats.xp % 1000) / 10}%` }}
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
            />
          </div>
          <p className="text-sm text-slate-400">
            {1000 - (stats.xp % 1000)} XP until Level {stats.level + 1}
          </p>
        </div>

        <div className="md:col-span-2 glass p-6 rounded-3xl">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Calendar size={18} className="text-brand-secondary" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {stats.history.length > 0 ? (
              stats.history.slice(-3).reverse().map((session, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center font-bold text-brand-primary">
                      {Math.round((session.score / session.total) * 100)}%
                    </div>
                    <div>
                      <p className="font-bold">Arena Session</p>
                      <p className="text-xs text-slate-500">{session.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{session.score}/{session.total}</p>
                    <p className="text-xs text-green-400">Completed</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-4 font-medium">No sessions yet. Time to show your genius! 🚀</p>
            )}
          </div>
        </div>
      </div>

      {/* Developer Spotlight & Vibe Coding Tribute */}
      <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-r from-violet-600/10 via-brand-primary/5 to-cyan-500/10 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/20 rounded-full text-xs font-bold text-violet-300 uppercase tracking-widest border border-violet-500/30">
              🚀 DEV SPOTLIGHT
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">
              Created by <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Jesse Otobo</span>
            </h3>
            <p className="text-slate-300 text-sm max-w-xl font-medium leading-relaxed">
              Jesse is a brilliant <span className="text-yellow-400 font-bold">11-year-old creator</span> who built this beautiful math academy using cutting-edge <span className="text-cyan-300 font-bold">Vibe Coding</span> technology! In Jesse's words: <span className="italic text-brand-accent font-bold">"We are young genius."</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-2 text-xs font-bold text-slate-300 backdrop-blur-sm">
              👑 11 Years Old
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-2 text-xs font-bold text-slate-300 backdrop-blur-sm">
              🌌 Vibe Coding Master
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-2 text-xs font-bold text-slate-300 backdrop-blur-sm animate-pulse">
              ✨ Young Genius Era
            </div>
          </div>
        </div>
      </div>

      {/* Styled Founder Story Section as requested */}
      <section 
        id="founder-story" 
        style={{
          backgroundColor: "#111", 
          color: "#fff", 
          padding: "40px 20px", 
          borderRadius: "15px", 
          marginTop: "30px", 
          marginBottom: "30px",
          maxWidth: "800px", 
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)", 
          border: "2px solid #333"
        }}
        className="mx-auto"
      >
        <style>{`
          .neon-text {
              font-size: 1.5rem;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #fff;
              text-shadow: 0 0 5px #fff, 0 0 10px #ff007f, 0 0 20px #ff007f, 0 0 40px #ff007f;
              animation: neon-pulse 1.5s infinite alternate;
              margin: 15px 0 0 0;
          }
          @keyframes neon-pulse {
              from { text-shadow: 0 0 5px #fff, 0 0 10px #ff007f, 0 0 20px #ff007f, 0 0 40px #ff007f; }
              to { text-shadow: 0 0 2px #fff, 0 0 5px #ff007f, 0 0 10px #ff007f, 0 0 20px #ff007f, 0 0 30px #ff007f; }
          }
        `}</style>
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2.5rem", color: "#FFD700", margin: "0 0 10px 0", fontWeight: "bold" }}>👑 Meet the Founder</h2>
          <p className="neon-text">"We Are Young Genius" 👑</p>
        </div>

        <div style={{ lineHeight: "1.8", fontSize: "1.1rem", color: "#e0e0e0" }} className="space-y-4">
          <p>Hello! I am <strong>Jesse</strong>, the founder and creator of <strong>Jesse Rock Math</strong>. This is my very first application published to the world to help kids everywhere fall in love with practicing maths.</p>
          
          <h3 style={{ color: "#00d2ff", marginTop: "25px", borderBottom: "1px solid #333", paddingBottom: "5px", fontWeight: "bold" }}>🎸 The Inspiration</h3>
          <p>My entire journey for this specific application was deeply inspired by the volume of fun in the game <em>Times Tables Rock Stars (TT Rockstars)</em>. I saw how powerful it was to turn learning into a rock star experience, and I wanted to build my own unique platform to help my peers sharpen their skills.</p>

          <h3 style={{ color: "#00d2ff", marginTop: "25px", borderBottom: "1px solid #333", paddingBottom: "5px", fontWeight: "bold" }}>🚀 The Evolution: From Scratch to Vibe Coding</h3>
          <p>My coding adventure started when I was just 8 years old. I began using Scratch to understand logic and learn how code works, and I instantly fell in love with it. I knew right then that I wished to be a professional programmer when I grew up.</p>
          <p>As the years went on, I graduated from simple block-building apps to exploring advanced technology. Eventually, I discovered <strong>vibe coding</strong>. I didn't learn it from courses or teachers—I completely self-explored it, figured it out on my own, and understood its logic. I truly believe vibe coding represents the next generation of software engineering.</p>

          <h3 style={{ color: "#00d2ff", marginTop: "25px", borderBottom: "1px solid #333", paddingBottom: "5px", fontWeight: "bold" }}>🛠️ The Developer Tech Stack</h3>
          <p>Before launching this game, I built and experimented with <strong>over 50 applications</strong> to master handling APIs, managing backend environments, and perfecting advanced AI prompting. For Jesse Rock Math, I engineered a highly professional stack:</p>
          <ul style={{ listStyleType: "square", marginLeft: "20px", color: "#fff" }} className="pl-4 space-y-1">
            <li><strong>AI Core:</strong> Powered by the highly advanced <em>Gemini family models</em> via Google AI Studio.</li>
            <li><strong>Version Control:</strong> Managed completely through a dedicated repository on <em>GitHub</em>.</li>
            <li><strong>Cloud Deployment:</strong> Hosted globally using <em>Vercel</em> as the primary domain handler.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue: string }) {
  return (
    <div className="glass p-6 rounded-3xl min-w-[140px] space-y-2">
      <div className="p-2 bg-white/5 w-fit rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-display font-black">{value}</p>
      </div>
      <p className="text-slate-500 text-[10px] font-bold">{subValue}</p>
    </div>
  );
}
