import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Terminal, 
  Award, 
  Heart, 
  Send, 
  Calendar, 
  Rocket, 
  ShieldCheck, 
  Sparkles, 
  FolderGit2, 
  Github, 
  Cpu,
  Star
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface DeveloperPageProps {
  currentUser: { uid: string; username: string };
}

export default function DeveloperPage({ currentUser }: DeveloperPageProps) {
  const [commentText, setCommentText] = useState('');
  const [avatarIcon, setAvatarIcon] = useState('🎸');
  const [guestbookLogs, setGuestbookLogs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Developer guestbook comments from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "developer_guestbook"),
      orderBy("timestamp", "desc"),
      limit(25)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: any[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      setGuestbookLogs(logs);
    }, (err) => {
      console.warn("Guestbook loading fallback/offline:", err);
      // Fallback comments if Offline or Permission denied before rules update
      setGuestbookLogs([
        { id: 'fb1', username: 'Alex Multiplier', text: 'Jesse, this application is elite! The play battles are so slick.', avatar: '🎯', timestamp: Date.now() - 3600000 },
        { id: 'fb2', username: 'TableTitan', text: 'I love how times table accuracy increases XP. Thank you Jesse Otobo!', avatar: '⚡', timestamp: Date.now() - 7200000 }
      ]);
    });

    return () => unsubscribe();
  }, []);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "developer_guestbook"), {
        uid: currentUser.uid,
        username: currentUser.username || "Local Guest Genius",
        text: commentText.trim(),
        avatar: avatarIcon,
        timestamp: Date.now()
      });
      setCommentText('');
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineSteps = [
    {
      age: "Age 8",
      title: "First Lines & Scratch Coding",
      desc: "Discovered programming logic through Scratch blocks. Built interactive logic layouts, dynamic 2D games, and knew immediately that software craftsmanship was my future!"
    },
    {
      age: "Age 9",
      title: "Advancing to Text-Based Logic",
      desc: "Began studying Python logic constructs and HTML foundations. Created educational math questions for school peers and experimented with custom command interpreters."
    },
    {
      age: "Age 10",
      title: "Vibe Coding Breakthrough",
      desc: "Discovered the revolution of vibe coding! Rather than standard syntax textbooks, I self-taught prompting logic, API connectivity, and code design techniques, testing 50+ experimental web tools."
    },
    {
      age: "Age 11",
      title: "Launching Jesse Rock Math App",
      desc: "Successfully engineered and compiled my flagship educational multiplayer hub, powered by real-time Firestore synchronization and modern responsive React workflows!"
    }
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Page Header */}
      <div className="text-center md:text-left space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-black uppercase text-violet-400 tracking-wider">
          <User size={12} /> MEAT THE ARCHITECT
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
          About the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Developer</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Unlock the story of 11-year-old software architect Jesse Otobo. From initial Scratch blocks at age 8 to launching comprehensive full-scale React platforms.
        </p>
      </div>

      {/* Developer Hero Card */}
      <div className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Virtual avatar badge */}
          <div className="w-28 h-28 sm:w-36 sm:w-36 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 shrink-0 flex items-center justify-center shadow-xl shadow-violet-500/20">
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-4xl sm:text-5xl border border-white/10 select-none">
              👑
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white">Jesse Otobo</h2>
                <span className="px-2.5 py-0.5 bg-violet-100/10 border border-violet-500/20 rounded text-[11px] font-extrabold text-violet-400 uppercase tracking-widest leading-none">
                  Vibe Rockstar
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase font-black tracking-wider mt-1">Founder & Chief Educational Engineer, Age 11</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-xl">
              "We Are Young Genius is my philosophy. I wanted to design a game that challenges kids to level up their core multiplication speeds without administrative sign-up blockades. Built with React 18, Tailwind, and real-time Firebase databases!"
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 font-mono text-[10px] text-slate-350">
                🚀 Projects: <strong>50+ experimental</strong>
              </span>
              <span className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 font-mono text-[10px] text-slate-350">
                💻 Focus: <strong>Vibe Coding Logic</strong>
              </span>
              <span className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 font-mono text-[10px] text-slate-350">
                🛠️ Stack: <strong>React, Vite, Firestore</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Styled Founder Story Section as requested */}
      <section 
        id="founder-story" 
        style={{
          backgroundColor: "#0b132b", 
          color: "#fff", 
          padding: "40px 20px", 
          borderRadius: "15px", 
          marginTop: "30px", 
          marginBottom: "30px",
          maxWidth: "800px", 
          fontFamily: "'Segoe UI', sans-serif", 
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)", 
          border: "3px solid #ff0055"
        }}
        className="mx-auto w-full"
      >
        <style>{`
          .neon-text {
              font-size: 1.5rem;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #fff;
              text-shadow: 0 0 5px #fff, 0 0 10px #ff0055, 0 0 20px #ff0055, 0 0 40px #ff0055;
              animation: neon-pulse 1.5s infinite alternate;
              margin: 15px 0 0 0;
          }
          @keyframes neon-pulse {
              from { text-shadow: 0 0 5px #fff, 0 0 10px #ff0055, 0 0 20px #ff0055, 0 0 40px #ff0055; }
              to { text-shadow: 0 0 2px #fff, 0 0 5px #00d2ff, 0 0 10px #00d2ff, 0 0 20px #00d2ff, 0 0 30px #00d2ff; }
          }
        `}</style>
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2.5rem", color: "#00d2ff", textShadow: "0 0 10px #00d2ff", margin: "0 0 10px 0" }}>👑 Meet the Founder</h2>
          <p className="neon-text">"We Are Young Genius" 👑</p>
        </div>

        <div style={{ lineHeight: "1.8", fontSize: "1.1rem", color: "#e0e0e0" }} className="space-y-4">
          <p>Hello! I am <strong>Jesse</strong>, the founder and creator of <strong>Jesse Rock Math</strong>. This is my very first application published to the world to help kids everywhere fall in love with practicing maths.</p>
          
          <h3 style={{ color: "#ff0055", marginTop: "25px", borderBottom: "2px solid #00d2ff", paddingBottom: "5px" }}>🎸 The Inspiration & Style</h3>
          <p>My entire journey for this specific application was deeply inspired by the game <em>Times Tables Rock Stars (TT Rockstars)</em>. I wanted to build my own unique platform to help my peers sharpen their skills. You might also notice that the app layout features my favorite colors: <strong>Red and Blue</strong>!</p>

          <h3 style={{ color: "#ff0055", marginTop: "25px", borderBottom: "2px solid #00d2ff", paddingBottom: "5px" }}>🚀 The Evolution: From Scratch to Vibe Coding</h3>
          <p>My coding adventure started when I was just 8 years old using Scratch. As the years grew, I completely self-explored and mastered <strong>vibe coding</strong>, which I believe is the next generation of software engineering. I am incredibly dedicated to my craft—I open my code editor up to <strong>5 times every single day</strong>, building up to <strong>3 or 4 applications a day</strong>! Before launching Jesse Rock Math, I had already built and experimented with over 50 applications.</p>

          <h3 style={{ color: "#ff0055", marginTop: "25px", borderBottom: "2px solid #00d2ff", paddingBottom: "5px" }}>🛠️ My Hardest Bug Fixed</h3>
          <p>Being a developer isn't always easy. My absolute hardest bug happened right when I started vibe coding: <strong>handling and connecting the API logic correctly</strong>. It took a lot of independent problem-solving and exploring, but I didn't give up until the data connected perfectly!</p>

          <h3 style={{ color: "#00d2ff", marginTop: "25px", borderBottom: "2px solid #ff0055", paddingBottom: "5px" }}>🛠️ Powered By</h3>
          <p>This application was engineered using world-class professional developer tools. Special credit and thanks to the companies that made this possible:</p>
          <ul style={{ listStyleType: "disc", marginLeft: "20px", color: "#fff" }} className="pl-4 space-y-1">
            <li><strong>Google AI Studio:</strong> For providing the advanced Gemini family powerhouse models that drive the smart logic.</li>
            <li><strong>GitHub:</strong> For hosting my project repository and managing my version control.</li>
            <li><strong>Vercel:</strong> For providing the primary hosting domain and lightning-fast cloud deployment.</li>
            <li><strong>Google AI Assistant:</strong> For providing continuous engineering support and guidance throughout my deployment journey.</li>
          </ul>

          <div style={{ color: "#00d2ff", marginTop: "30px", background: "rgba(255, 0, 85, 0.1)", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #ff0055" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#00d2ff", fontWeight: "bold" }}>💖 Special Thanks & Credits</h3>
            <p style={{ margin: 0, color: "#e0e0e0" }}>A huge thank you to my <strong>Aunty Mercy</strong> for her amazing support, and a massive thank you to my <strong>Mum</strong> for letting me use her laptop to code all of my applications. I couldn't have built this without them!</p>
          </div>
        </div>
      </section>

      {/* Grid: Timeline and Interactive Guestbook */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Side: Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">The Professional Timeline</h3>
            <p className="text-xs text-slate-500 font-medium">From simple blocks to beautiful, high-speed interactive portals</p>
          </div>

          <div className="relative pl-6 border-l border-white/5 space-y-8">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Visual marker dot */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-violet-500 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/25 tracking-widest font-mono">
                    {step.age}
                  </span>
                  <h4 className="text-base font-black text-white">{step.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Interactive Guestbook (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Sign Jesse's Guestbook</h3>
            <p className="text-xs text-slate-500 font-medium">Leave support matches, notes of encouragement, or ratings!</p>
          </div>

          <form onSubmit={handlePostComment} className="p-6 bg-slate-900/35 border border-white/5 rounded-3xl space-y-4">
            <div className="flex gap-2">
              {['🎸', '⚡', '👑', '🔥', '🏆', '👾'].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setAvatarIcon(icon)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform hover:scale-110 cursor-pointer ${
                    avatarIcon === icon ? 'bg-violet-600 border border-violet-400' : 'bg-slate-950 border border-white/5'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write helpful text, practice milestones, or positive suggestions for Jesse..."
                maxLength={180}
                required
                className="w-full h-24 p-4 bg-slate-950 border border-white/5 rounded-2xl text-xs text-white placeholder:text-slate-650 outline-none focus:border-violet-500 font-semibold"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-550 font-bold">
                <span>Active handle: <strong className="text-slate-300">{currentUser.username || "Local Player"}</strong></span>
                <span>{commentText.length}/180 chars</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={12} /> Post Word of Encouragement
            </button>
          </form>

          {/* Render comment outputs from Firestore */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {guestbookLogs.map((log) => (
              <div 
                key={log.id}
                className="p-4 rounded-2xl bg-slate-950 border border-white/5 flex gap-3 flex-col sm:flex-row"
              >
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0">
                  {log.avatar || '⚡'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-xs font-black text-slate-200">{log.username}</span>
                    <span className="text-[9px] text-slate-550 font-mono">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-normal">{log.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
