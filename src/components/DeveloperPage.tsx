import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Heart, 
  Send, 
  Rocket, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  GraduationCap
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface DeveloperPageProps {
  currentUser: { uid: string; username: string; role?: string };
}

export default function DeveloperPage({ currentUser }: DeveloperPageProps) {
  // Guestbook states
  const [commentText, setCommentText] = useState('');
  const [avatarIcon, setAvatarIcon] = useState('👑');
  const [guestbookLogs, setGuestbookLogs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load real-time guestbook comments on mount
  useEffect(() => {
    const q = query(
      collection(db, "developer_guestbook"),
      orderBy("timestamp", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: any[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      setGuestbookLogs(logs);
    }, (err) => {
      console.warn("[GUESTBOOK] Loading offline/mock sync:", err);
      // Fallback fallback mock comments
      setGuestbookLogs([
        { id: 'mock1', username: 'Alex Multiplier', text: 'Jesse, this application is elite! The play battles are so slick.', avatar: '🎯', role: 'kid', timestamp: Date.now() - 3600000 },
        { id: 'mock2', username: 'TableTitan', text: 'I love how times table accuracy increases XP. Thank you Jesse Otobo!', avatar: '⚡', role: 'adult', timestamp: Date.now() - 7200000 }
      ]);
    });

    return () => unsubscribe();
  }, []);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const isGuest = !currentUser || currentUser.uid === 'guest' || currentUser.username === 'Genius Scholar';
    if (isGuest) {
      setErrorMessage("Please log in with a registered account to sign Jesse's guestbook!");
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "developer_guestbook"), {
        username: currentUser.username || "Verified Rockstar",
        text: commentText.trim(),
        avatar: avatarIcon,
        role: currentUser.role === 'teacher' || currentUser.role === 'admin' ? 'adult' : 'kid',
        timestamp: Date.now()
      });
      setCommentText('');
    } catch (err: any) {
      console.error("Error writing comment to database:", err);
      setErrorMessage("Could not post comment. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGuest = !currentUser || currentUser.uid === 'guest' || currentUser.username === 'Genius Scholar';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-white space-y-12">
      
      {/* 1. HERO HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-xs font-black uppercase text-pink-400 tracking-wider">
          <Sparkles size={13} className="animate-spin-slow" /> MEET THE BRAIN BEHIND THE GAME
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight leading-none mt-2">
          MEET THE <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent">DEVELOPER</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-350 max-w-2xl mx-auto font-medium leading-relaxed">
          Jesse Rock Math Arena was designed, coded, and deployed by an 11-year-old coding rockstar. Learn about Jesse's journey and leave an encouraging word below!
        </p>
      </motion.div>

      {/* 2. FEATURED ARTICLE CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-8 md:p-10 rounded-[2.5rem] bg-[#14171c] border border-emerald-500/30 shadow-lg shadow-emerald-500/5 relative overflow-hidden max-w-4xl mx-auto"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-400 tracking-wider animate-pulse">
              <Sparkles size={11} /> FEATURED ON DEV.TO COMMUNITY
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight leading-snug">
              How I Built, Deployed, and Google-Indexed a Full-Stack AI App in Under 24 Hours
            </h3>
            <p className="text-xs sm:text-sm text-slate-350 leading-relaxed max-w-2xl">
              In this acclaimed article, 11-year-old software pioneer Jesse Otobo explains how he designed high-speed client lobbies, integrated firestore real-time state, and achieved top Google indexation in less than 24 hours!
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 font-mono text-[9px] text-emerald-300 font-bold uppercase">
                ⚡ 24-Hour Challenge
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10 font-mono text-[9px] text-indigo-300 font-bold uppercase">
                🌐 Real-Time Sync
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-violet-500/5 border border-violet-500/10 font-mono text-[9px] text-violet-300 font-bold uppercase">
                🏆 Search Engine Indexing
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <a 
              href="https://dev.to/jesse_otobo_/how-i-built-deployed-and-google-indexed-a-full-stack-ai-app-in-under-24-hourspublished-true-h5g"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider text-xs rounded-2xl shadow-xl hover:shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer"
            >
              <Rocket size={14} /> Read Full Article
            </a>
          </div>
        </div>
      </motion.div>

      {/* 3. FOUNDER BIOGRAPHY SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-auto w-full max-w-4xl p-8 rounded-[2.5rem] bg-[#0b132b] border-2 border-pink-500 shadow-xl shadow-pink-500/10 text-white relative"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-pink-600/20 border border-pink-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            👑
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#00d2ff] tracking-tight">Meet the Founder</h2>
          <div className="text-sm font-bold uppercase tracking-widest text-pink-400 font-mono mt-2 animate-pulse">
            "We Are Young Genius" 👑
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-200 font-sans">
          <p className="text-base font-medium">Hello! I am Jesse, the founder of Jesse Rock Math, an application designed to help children enjoy practicing mathematics.</p>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black text-pink-500 border-b border-[#00d2ff] pb-1 flex items-center gap-1.5">
              🎸 The Inspiration
            </h3>
            <p>
              I got inspired to create a unique platform that makes education extremely engaging and fun. By combining gaming elements with mathematics, my friends and peers can practice math and naturally improve their speed and accuracy.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-pink-500 border-b border-[#00d2ff] pb-1 flex items-center gap-1.5">
              🚀 The Evolution: From Blocks to Advanced Coding
            </h3>
            <p>
              I started coding at age 8, using visual, block-based tools like Scratch to understand logical statements, loops, and conditions. Over time, I grew passionate about building software and transitioned to full text-based coding, mastering responsive frontends, Firestore real-time databases, and full-stack integrations.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-[#00d2ff] border-b border-pink-500 pb-1 flex items-center gap-1.5">
              🛠️ The Developer Tech Stack
            </h3>
            <p>After creating and testing over 50 applications, I mastered advanced web structures, real-time sync systems, and hosting deployments. For this project, I utilize:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300 font-medium">
              <li><strong>UI Framework:</strong> Modern React with TypeScript and Vite.</li>
              <li><strong>Styling engine:</strong> Tailwind CSS utility classes with native animation support.</li>
              <li><strong>Database Layer:</strong> Firestore real-time state listeners.</li>
              <li><strong>Cloud Deployment:</strong> Secure server routing with CORS supervision.</li>
            </ul>
          </div>

          <div className="bg-pink-500/10 p-5 rounded-2xl border-l-4 border-pink-500 text-slate-100">
            <h3 className="text-sm font-bold text-[#00d2ff] mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Heart size={14} className="text-pink-500 animate-pulse" /> Special Thanks & Credits
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              A huge thank you to my <strong>Aunty Mercy</strong> for her amazing support, and a massive thank you to my <strong>Mum</strong> for letting me use her laptop to code all of my applications. I couldn't have built this without them!
            </p>
          </div>
        </div>
      </motion.section>

      {/* 4. TIMELINE AND GUESTBOOK GRID */}
      <div className="grid lg:grid-cols-12 gap-8 max-w-4xl mx-auto">
        
        {/* Left: Timeline */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-mono font-black text-white uppercase tracking-wider">Jesse's Timeline</h3>
            <p className="text-xs text-slate-400">From block foundations to full-stack applications</p>
          </div>

          <div className="relative pl-5 border-l border-pink-500/30 space-y-6 font-sans">
            {[
              { age: "Age 8", title: "First Lines & Block Coding", desc: "Discovered programming logic through visual layouts, building 2D logic games." },
              { age: "Age 9", title: "Advancing to Text-Based Logic", desc: "Studied HTML/CSS constructs, creating educational mini-challenges for peers." },
              { age: "Age 10", title: "Vibe Coding Breakthrough", desc: "Mastered conversational prompting and API hooks, generating over 50+ experimental tools." },
              { age: "Age 11", title: "Launching Jesse Rock Math App", desc: "Designed, synchronized, and compiled this flagship multiplayer hub!" }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#0d0f12] border-2 border-[#00d2ff] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-[#00d2ff] rounded-full" />
                </div>
                <div className="space-y-1 pl-2">
                  <span className="text-[9px] font-mono font-black uppercase text-[#00d2ff] bg-[#00d2ff]/10 border border-[#00d2ff]/20 px-1.5 py-0.5 rounded leading-none">
                    {step.age}
                  </span>
                  <h4 className="text-sm font-black text-white mt-1">{step.title}</h4>
                  <p className="text-xs text-slate-350 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Guestbook */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-mono font-black text-white uppercase tracking-wider">Jesse's Guestbook</h3>
            <p className="text-xs text-slate-400">Leave encouraging notes or feedback for Jesse!</p>
          </div>

          {isGuest ? (
            <div className="p-5 bg-[#14171c] border border-gray-800 rounded-2xl text-center space-y-2 font-sans">
              <Lock className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
              <h4 className="text-xs font-black text-white uppercase">Guestbook Locked</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                To protect Jesse's guestbook, signing is locked for guests. Please log in with a registered Rockstar, Student, or Teacher account to leave feedback!
              </p>
            </div>
          ) : (
            <form onSubmit={handlePostComment} className="p-5 bg-[#14171c] border border-gray-800 rounded-2xl space-y-4 font-sans">
              <div className="flex gap-2 justify-center">
                {['👑', '⚡', '🎸', '🏆', '🔥', '👾'].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setAvatarIcon(icon)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-transform hover:scale-110 cursor-pointer ${
                      avatarIcon === icon ? 'bg-pink-600 border border-pink-400' : 'bg-[#0d0f12] border border-gray-850'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave helpful feedback or words of support for Jesse..."
                  maxLength={180}
                  required
                  className="w-full h-20 p-3 bg-[#0d0f12] border border-gray-800 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-pink-500 font-sans leading-relaxed"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Logged as: <strong>{currentUser.username}</strong></span>
                  <span>{commentText.length}/180</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-[10px] text-red-400 font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-mono font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Send size={11} /> Send Support Message
              </button>
            </form>
          )}

          {/* Comment Stream */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {guestbookLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center italic py-4">Be the first to leave a message!</p>
            ) : (
              guestbookLogs.map((log) => (
                <div 
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#14171c] border border-gray-850 flex gap-2 flex-col font-sans"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-gray-850 pb-1.5">
                    <span className="text-[11px] font-black text-slate-200 flex items-center gap-1.5">
                      <span className="text-sm">{log.avatar || '👑'}</span>
                      <span>{log.username}</span>
                      {log.role === 'adult' ? (
                        <span className="px-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[7px] font-mono font-black rounded uppercase py-0.5 leading-none">
                          TEACHER
                        </span>
                      ) : (
                        <span className="px-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[7px] font-mono font-black rounded uppercase py-0.5 leading-none">
                          ROCKSTAR
                        </span>
                      )}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-350 font-medium leading-relaxed">{log.text}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
