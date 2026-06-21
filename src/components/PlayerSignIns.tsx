import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, Clock, User, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function PlayerSignIns() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [streakAmounts, setStreakAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // We fetch from both users and school_students
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, collection: 'users', ...doc.data() });
      });
      
      const unsubscribeStudents = onSnapshot(collection(db, 'school_students'), (snap2) => {
        const studentsData: any[] = [];
        snap2.forEach((doc) => {
          studentsData.push({ id: doc.id, collection: 'school_students', ...doc.data() });
        });
        
        const allPlayers = [...usersData, ...studentsData].sort((a, b) => b.createdAt - a.createdAt);
        setPlayers(allPlayers);
        setLoading(false);
      }, (err) => {
         console.warn(err);
         setPlayers(usersData.sort((a, b) => b.createdAt - a.createdAt));
         setLoading(false);
      });
      
      return () => unsubscribeStudents();
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribeUsers();
  }, []);

  const handleSendStreak = async (playerId: string, colName: string) => {
    const amount = streakAmounts[playerId] || 10;
    try {
      if (amount <= 0) return;
      await updateDoc(doc(db, colName, playerId), {
        streak: increment(amount),
        bestStreak: increment(amount)
      }); // Real-time listener will pick this up
      
      // Clear input
      setStreakAmounts(prev => ({...prev, [playerId]: 0}));
    } catch (err) {
      console.error("Error sending streak", err);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 shadow-xl">
      {loading ? (
        <div className="text-center text-slate-400 py-4 font-bold">Loading player registry...</div>
      ) : (
        <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((p) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={p.id} 
                className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col justify-between shadow-inner"
              >
                <div>
                  <h4 className="text-white font-black flex items-center gap-2 text-sm leading-tight">
                    <User size={14} className="text-brand-primary shrink-0" /> 
                    <span className="truncate">{p.username || 'Unknown'}</span>
                    <span className="text-[9px] text-slate-500 uppercase shrink-0 border border-slate-700 px-1.5 py-0.5 rounded-md">
                      {p.collection === 'users' ? 'Home' : 'School'}
                    </span>
                  </h4>
                  <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1.5 font-mono uppercase tracking-wider bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Clock size={10} /> 
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'No Date Found'}
                  </p>
                  <div className="flex items-center gap-3 mt-3 px-2 py-1.5 bg-white/5 inline-flex rounded-lg border border-white/5">
                    <p className="text-xs text-amber-400 font-bold inline-flex items-center gap-1">
                      <Zap size={12} className="text-amber-500" /> Current Streak: {p.streak || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 pt-3 border-t border-white/5">
                  <input 
                    type="number" 
                    placeholder="Amt" 
                    value={streakAmounts[p.id] || ''}
                    onChange={(e) => setStreakAmounts(prev => ({...prev, [p.id]: parseInt(e.target.value) || 0}))}
                    className="w-16 bg-slate-900 border border-white/10 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-center"
                  />
                  <button 
                    onClick={() => handleSendStreak(p.id, p.collection)}
                    disabled={!streakAmounts[p.id] || streakAmounts[p.id] <= 0}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-neon-amber rounded-lg py-2 px-2 text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:grayscale"
                  >
                    <Send size={12} /> Send Free Streak
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {players.length === 0 && (
            <div className="text-center text-slate-500 text-sm font-bold py-8">
              No players registered in the database yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
