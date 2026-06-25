import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, MessageSquare, Flame, HelpCircle, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface AiCoachWidgetProps {
  currentProblem?: string;
}

export default function AiCoachWidget({ currentProblem }: AiCoachWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hey there, Math Rockstar! 🎸 I'm Axel, your AI Math Coach! Got a tricky number puzzle, or want a cool math tip? Just type it here, or click below for a step-by-step hint. Let's jam! ⚡"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string, isAutoProblemHint = false) => {
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user', text: textToSend } as Message];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: isAutoProblemHint ? undefined : textToSend,
          currentProblem: isAutoProblemHint ? textToSend : undefined,
          // Exclude the first welcome message to keep payload clean, map roles correctly
          history: messages.slice(1).map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            text: data.reply || "⚡ Oh no! My rock amp got unplugged! Let's try that again in a second. Rock on! 🎸" 
          }
        ]);
      }
    } catch (error) {
      console.error("AI Coach widget error:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          text: "🎸 Axel has hit a feedback loop on stage! Please check your internet connection or make sure your GEMINI_API_KEY is configured in Vercel. ⚡" 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHintClick = () => {
    if (!currentProblem) return;
    handleSend(currentProblem, true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      <AnimatePresence>
        {/* Expanded Chat Box */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            className="w-[340px] sm:w-[380px] h-[500px] bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-violet-500/50 rounded-3xl shadow-[0_0_35px_rgba(139,92,246,0.3)] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-lg shadow-md animate-pulse">
                  🎸
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    Axel AI Coach <Flame size={14} className="text-amber-400 animate-bounce" />
                  </h3>
                  <span className="text-[10px] text-violet-200 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live & Rocking
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-full text-violet-100 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-white/5 border border-white/5 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className={lIdx > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider">Axel is tuning his guitar...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Hint Suggestion Panel if active math problem */}
            {currentProblem && (
              <div className="px-4 py-2 bg-slate-950/80 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <HelpCircle size={14} className="text-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400 truncate">
                    Stuck? Hint for: <strong className="text-slate-200">{currentProblem}</strong>
                  </span>
                </div>
                <button
                  onClick={handleHintClick}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-450 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
                >
                  ⚡ Get Hint
                </button>
              </div>
            )}

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 bg-slate-950 border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Axel a math question..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-14 px-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center gap-2.5 cursor-pointer border border-violet-400/20"
      >
        <div className="w-7 h-7 rounded-full bg-slate-950 border border-amber-400 flex items-center justify-center text-sm shadow-sm">
          🎸
        </div>
        <span className="text-xs uppercase tracking-wider font-black flex items-center gap-1">
          AI Math Coach <Sparkles size={13} className="text-amber-300 animate-pulse" />
        </span>
      </motion.button>
    </div>
  );
}
