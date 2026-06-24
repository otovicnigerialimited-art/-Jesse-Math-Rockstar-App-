import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Crown, Flame, Award, Shield, User, Star, Search, ArrowUp, Clock, Gift, Share2, Check } from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  increment, 
  setDoc, 
  writeBatch 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { cn } from '../lib/utils';

interface LeaderboardProps {
  currentUser: {
    uid: string | null;
    username: string | null;
    role?: string;
  };
  currentStreak: number;
}

interface LeaderboardUser {
  id: string;
  username: string;
  streakScore?: number;
  streak?: number;
  bestStreak?: number;
  xp?: number;
  level?: number;
  badges?: string[];
  role?: string;
  collection?: string;
}

function getWeekIdentifier(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

function getNextResetTime() {
  const now = new Date();
  const nextSunday = new Date();
  const currentDay = now.getUTCDay();
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  
  nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
  nextSunday.setUTCHours(23, 59, 59, 999);
  
  if (nextSunday.getTime() <= now.getTime()) {
    nextSunday.setUTCDate(nextSunday.getUTCDate() + 7);
  }
  return nextSunday;
}

export default function Leaderboard({ currentUser, currentStreak }: LeaderboardProps) {
  const [topPlayers, setTopPlayers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number>(currentStreak);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});
  const [flashUsers, setFlashUsers] = useState<Record<string, 'up' | 'down'>>({});
  const [weeklyStatus, setWeeklyStatus] = useState<{
    currentWeek: string;
    lastResetTime: number;
    lastWeekWinner: string;
    lastWeekWinnerStreak?: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleShareRank = () => {
    const rankText = userRank ? `${userRank}` : "Unranked";
    const shareText = `🎯 I am currently ranked #${rankText} globally on Jesse Rock Math with a streak of ${userScore}! Can you beat my high score? Play here: https://jesse-math-rockstar-app.vercel.app/`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        fallbackCopyText(shareText);
      });
    } else {
      fallbackCopyText(shareText);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const checkAndRunWeeklyReset = async () => {
    try {
      const sysRef = doc(db, 'system_state', 'leaderboard');
      const sysSnap = await getDoc(sysRef);
      const actualWeek = getWeekIdentifier(new Date());

      if (!sysSnap.exists()) {
        const initialState = {
          currentWeek: actualWeek,
          lastResetTime: Date.now(),
          lastWeekWinner: 'None',
          lastWeekWinnerId: '',
          lastWeekWinnerStreak: 0
        };
        await setDoc(sysRef, initialState);
        setWeeklyStatus(initialState);
      } else {
        const sysData = sysSnap.data();
        setWeeklyStatus({
          currentWeek: sysData.currentWeek || actualWeek,
          lastResetTime: sysData.lastResetTime || Date.now(),
          lastWeekWinner: sysData.lastWeekWinner || 'None',
          lastWeekWinnerStreak: sysData.lastWeekWinnerStreak || 0
        });

        if (sysData.currentWeek !== actualWeek) {
          // Time to reset! Mark immediately to avoid race condition
          await setDoc(sysRef, {
            ...sysData,
            currentWeek: actualWeek,
            lastResetTime: Date.now(),
            lastWeekWinner: 'Synchronising...',
            lastWeekWinnerId: 'processing'
          }, { merge: true });

          // Fetch all players from both collections
          const allPlayers: any[] = [];
          
          const usersSnap = await getDocs(collection(db, 'users'));
          usersSnap.forEach(d => {
            const data = d.data();
            const uname = data.username || '';
            const isGuest = uname.toLowerCase().includes('guest') || uname === 'Anonymous Hero' || d.id.startsWith('guest_');
            if (!isGuest && uname) {
              allPlayers.push({
                id: d.id,
                username: uname,
                collection: 'users',
                streakScore: data.streakScore ?? data.streak ?? data.bestStreak ?? 0,
                level: data.level ?? 1
              });
            }
          });

          const studentsSnap = await getDocs(collection(db, 'school_students'));
          studentsSnap.forEach(d => {
            const data = d.data();
            const uname = data.username || '';
            const isGuest = uname.toLowerCase().includes('guest') || uname === 'Anonymous Hero' || d.id.startsWith('guest_');
            if (!isGuest && uname) {
              const progress = data.school_math_progress || {};
              allPlayers.push({
                id: d.id,
                username: uname,
                collection: 'school_students',
                streakScore: data.streakScore ?? progress.highScore ?? data.streak ?? 0,
                level: data.level ?? progress.currentLevel ?? 1
              });
            }
          });

          // Sort to find #1 winner
          allPlayers.sort((a, b) => {
            if (b.streakScore !== a.streakScore) return b.streakScore - a.streakScore;
            return b.level - a.level;
          });

          const winner = allPlayers[0];
          let winnerName = 'None';
          let winnerId = '';
          let winnerStreak = 0;
          
          if (winner && winner.streakScore > 0) {
            winnerName = winner.username;
            winnerId = winner.id;
            winnerStreak = winner.streakScore;

            // Reward winner with 1,000 streak!
            const winnerDocRef = doc(db, winner.collection, winner.id);
            if (winner.collection === 'users') {
              await updateDoc(winnerDocRef, {
                streak: increment(1000),
                bestStreak: increment(1000),
                streakScore: increment(1000),
                coins: increment(1000),
                jesse_gift: { id: `weekly_winner_${actualWeek}`, amount: 1000, type: 'streak', description: 'Weekly Leaderboard Champion Reward!' }
              });
            } else {
              const snap = await getDoc(winnerDocRef);
              const p = snap.data()?.school_math_progress || {};
              await updateDoc(winnerDocRef, {
                streak: increment(1000),
                bestStreak: increment(1000),
                streakScore: increment(1000),
                coins: increment(1000),
                school_math_progress: {
                  ...p,
                  highScore: (p.highScore || 0) + 1000,
                  coins: (p.coins || 100) + 1000
                },
                jesse_gift: { id: `weekly_winner_${actualWeek}`, amount: 1000, type: 'streak', description: 'Weekly Leaderboard Champion Reward!' }
              });
            }
          }

          // Reset all players' current active streak and streakScore to 0
          const batch = writeBatch(db);
          let count = 0;

          for (const uDoc of usersSnap.docs) {
            const uRef = doc(db, 'users', uDoc.id);
            batch.update(uRef, {
              streak: 0,
              streakScore: 0
            });
            count++;
            if (count >= 400) {
              await batch.commit();
              count = 0;
            }
          }

          for (const sDoc of studentsSnap.docs) {
            const sRef = doc(db, 'school_students', sDoc.id);
            const p = sDoc.data()?.school_math_progress || {};
            batch.update(sRef, {
              streak: 0,
              streakScore: 0,
              school_math_progress: {
                ...p,
                highScore: 0
              }
            });
            count++;
            if (count >= 400) {
              await batch.commit();
              count = 0;
            }
          }

          if (count > 0) {
            await batch.commit();
          }

          // Final update
          const finalState = {
            currentWeek: actualWeek,
            lastResetTime: Date.now(),
            lastWeekWinner: winnerName,
            lastWeekWinnerId: winnerId,
            lastWeekWinnerStreak: winnerStreak
          };
          await setDoc(sysRef, finalState, { merge: true });
          setWeeklyStatus(finalState);
        }
      }
    } catch (err) {
      console.warn('Failed to run weekly reset check:', err);
    }
  };

  // Run weekly status checks on load and periodically
  useEffect(() => {
    checkAndRunWeeklyReset();
  }, []);

  // Update Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const resetTime = getNextResetTime();
      const diff = resetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Resetting now...');
        checkAndRunWeeklyReset();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [weeklyStatus?.currentWeek]);

  // 1. Fetch Top 50 real players from BOTH collections in real-time
  useEffect(() => {
    setLoading(true);

    // Subscribe to users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (usersSnap) => {
      // Subscribe to school students
      const unsubscribeStudents = onSnapshot(collection(db, 'school_students'), (studentsSnap) => {
        const fetched: LeaderboardUser[] = [];

        // Parse individual users
        usersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const uname = data.username || '';
          const isGuest = uname.toLowerCase().includes('guest') || 
                          uname === 'Anonymous Hero' || 
                          docSnap.id.startsWith('guest_') ||
                          data.role === 'guest';
          
          if (!isGuest && uname) {
            fetched.push({
              id: docSnap.id,
              username: uname,
              streakScore: data.streakScore ?? data.bestStreak ?? data.streak ?? 0,
              streak: data.streak ?? 0,
              bestStreak: data.bestStreak ?? 0,
              xp: data.xp ?? 0,
              level: data.level ?? 1,
              badges: data.badges ?? [],
              role: data.role || 'individual',
              collection: 'users'
            });
          }
        });

        // Parse school students
        studentsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const uname = data.username || '';
          const isGuest = uname.toLowerCase().includes('guest') || 
                          uname === 'Anonymous Hero' || 
                          docSnap.id.startsWith('guest_') ||
                          data.role === 'guest';
          
          if (!isGuest && uname) {
            const progress = data.school_math_progress || {};
            fetched.push({
              id: docSnap.id,
              username: uname,
              streakScore: data.streakScore ?? progress.highScore ?? data.bestStreak ?? data.streak ?? progress.streakScore ?? 0,
              streak: data.streak ?? progress.streak ?? 0,
              bestStreak: data.bestStreak ?? progress.highScore ?? 0,
              xp: data.xp ?? progress.xp ?? 0,
              level: data.level ?? progress.currentLevel ?? 1,
              badges: data.badges ?? [],
              role: 'student',
              collection: 'school_students'
            });
          }
        });

        // Sort strictly by streakScore descending, and then by level descending
        fetched.sort((a, b) => {
          const sA = a.streakScore ?? 0;
          const sB = b.streakScore ?? 0;
          if (sB !== sA) {
            return sB - sA;
          }
          const lA = a.level ?? 1;
          const lB = b.level ?? 1;
          return lB - lA;
        });

        // Calculate any ranking changes for visual flash effect
        const newRanks: Record<string, number> = {};
        const newFlashes: Record<string, 'up' | 'down'> = {};

        fetched.forEach((player, idx) => {
          const rank = idx + 1;
          newRanks[player.id] = rank;
          const prev = prevRanks[player.id];
          if (prev !== undefined && prev !== rank) {
            newFlashes[player.id] = rank < prev ? 'up' : 'down';
          }
        });

        setPrevRanks(newRanks);
        if (Object.keys(newFlashes).length > 0) {
          setFlashUsers(newFlashes);
          const timer = setTimeout(() => setFlashUsers({}), 2500);
          return () => clearTimeout(timer);
        }

        setTopPlayers(fetched.slice(0, 50));
        setLoading(false);
      }, (err) => {
        console.error('Error fetching school_students for leaderboard:', err);
        // Fallback to users only
        const fetchedUsersOnly: LeaderboardUser[] = [];
        usersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const uname = data.username || '';
          const isGuest = uname.toLowerCase().includes('guest') || 
                          uname === 'Anonymous Hero' || 
                          docSnap.id.startsWith('guest_') ||
                          data.role === 'guest';
          
          if (!isGuest && uname) {
            fetchedUsersOnly.push({
              id: docSnap.id,
              username: uname,
              streakScore: data.streakScore ?? data.bestStreak ?? data.streak ?? 0,
              streak: data.streak ?? 0,
              bestStreak: data.bestStreak ?? 0,
              xp: data.xp ?? 0,
              level: data.level ?? 1,
              badges: data.badges ?? []
            });
          }
        });
        fetchedUsersOnly.sort((a, b) => {
          const sA = a.streakScore ?? 0;
          const sB = b.streakScore ?? 0;
          if (sB !== sA) return sB - sA;
          return (b.level ?? 1) - (a.level ?? 1);
        });
        setTopPlayers(fetchedUsersOnly.slice(0, 50));
        setLoading(false);
      });

      return () => unsubscribeStudents();
    }, (error) => {
      console.error('Error fetching users for leaderboard:', error);
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => unsubscribeUsers();
  }, []);

  // 2. Calculate logged-in student's live rank and stats dynamically
  useEffect(() => {
    if (!currentUser.uid || topPlayers.length === 0) return;

    const myIndex = topPlayers.findIndex(p => p.id === currentUser.uid);
    if (myIndex !== -1) {
      setUserRank(myIndex + 1);
      setUserScore(topPlayers[myIndex].streakScore || 0);
      setUserLevel(topPlayers[myIndex].level || 1);
    } else {
      // If not in top players, fetch current user's score to estimate
      const fetchMyScore = async () => {
        try {
          const colName = currentUser.role === 'student' ? 'school_students' : 'users';
          const ref = doc(db, colName, currentUser.uid!);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            const score = currentUser.role === 'student' 
              ? (data.school_math_progress?.highScore ?? 0)
              : (data.streakScore ?? data.streak ?? 0);
            setUserScore(score);
            
            const levelVal = currentUser.role === 'student'
              ? (data.level ?? data.school_math_progress?.currentLevel ?? 1)
              : (data.level ?? 1);
            setUserLevel(levelVal);
            
            // Find how many players in topPlayers have a higher score
            const higherCount = topPlayers.filter(p => (p.streakScore || 0) > score).length;
            setUserRank(higherCount + 1);
          }
        } catch (err) {
          console.warn('Error fetching active score:', err);
        }
      };
      fetchMyScore();
    }
  }, [currentUser.uid, topPlayers]);

  const filteredPlayers = topPlayers.filter(p => 
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSearching = searchQuery.trim() !== '';
  const top3 = isSearching ? [] : filteredPlayers.slice(0, 3);
  const displayedInTable = isSearching ? filteredPlayers : filteredPlayers.slice(3);

  // Append logged-in user at the end of the table if they are not on the board, but match search query
  const isMeOnBoard = filteredPlayers.some(p => p.id === currentUser.uid);
  let finalTablePlayers = [...displayedInTable];
  if (!isMeOnBoard && currentUser.uid && currentUser.username) {
    const matchesSearch = !isSearching || currentUser.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (matchesSearch) {
      finalTablePlayers.push({
        id: currentUser.uid,
        username: currentUser.username,
        streakScore: userScore,
        streak: userScore,
        bestStreak: userScore,
        xp: 0,
        level: userLevel,
        badges: [],
        role: currentUser.role,
        collection: currentUser.role === 'student' ? 'school_students' : 'users',
        isPlaceholderMe: true
      } as any);
    }
  }

  // Position top 3 as: [Silver (2), Gold (1), Bronze (3)] for the podium display
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ player: top3[1], rank: 2, color: 'border-slate-300 bg-slate-900/80', text: 'text-slate-300', label: 'Silver', height: 'h-40 sm:h-48' });
  if (top3[0]) podiumOrder.push({ player: top3[0], rank: 1, color: 'border-amber-400 bg-slate-900/90', text: 'text-amber-400', label: 'Gold', height: 'h-48 sm:h-56' });
  if (top3[2]) podiumOrder.push({ player: top3[2], rank: 3, color: 'border-amber-700 bg-slate-900/80', text: 'text-amber-700', label: 'Bronze', height: 'h-32 sm:h-40' });

  return (
    <div className="space-y-8 pb-24 relative">
      {/* Header Banner */}
      <div className="relative overflow-hidden glass p-8 rounded-[3rem] bg-gradient-to-br from-brand-primary/20 via-brand-secondary/5 to-brand-accent/10 border border-white/10 shadow-2xl text-center">
        <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-secondary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/20 border border-brand-primary/30 rounded-full text-xs font-bold text-brand-primary uppercase tracking-wider animate-bounce">
            <Trophy size={16} /> Global Arena Rankings
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-none text-white">
            ROCK <span className="text-brand-primary">LEADERBOARD</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-md max-w-xl mx-auto font-medium">
            Climb the ranks, sharpen your mathematics, and claim your place among the world's elite young geniuses!
          </p>
        </div>
      </div>

      {/* Weekly Event Status Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
        {/* Weekly Countdown Card */}
        <div className="glass p-6 rounded-3xl border border-white/10 bg-slate-900/40 relative overflow-hidden flex items-center justify-between shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Clock size={24} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-orange-400 uppercase font-black tracking-widest block">Leaderboard Reset</span>
              <p className="text-xl font-display font-black text-white mt-1">
                {timeLeft || 'Calculating...'}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Weekly reset & prize distribution
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Weekly Prize</span>
            <span className="text-sm font-black text-amber-400 flex items-center gap-1 mt-1 justify-end">
              <Flame size={14} className="fill-orange-500 text-orange-500" /> +1,000 Streak
            </span>
          </div>
        </div>

        {/* Weekly Champion Card */}
        <div className="glass p-6 rounded-3xl border border-white/10 bg-slate-900/40 relative overflow-hidden flex items-center justify-between shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Crown size={24} className="animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-black tracking-widest block">Last Week's Champion</span>
              <p className="text-lg font-display font-black text-white mt-1 truncate max-w-[180px]">
                {weeklyStatus?.lastWeekWinner && weeklyStatus.lastWeekWinner !== 'None' ? weeklyStatus.lastWeekWinner : 'Awaiting King...'}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {weeklyStatus?.lastWeekWinner && weeklyStatus.lastWeekWinner !== 'None' ? `Won with ${weeklyStatus.lastWeekWinnerStreak || 0} Streak!` : 'Be the first to claim #1!'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Status</span>
            <span className="text-xs font-black text-green-400 bg-green-500/10 px-2 py-1 rounded-full mt-1.5 inline-block border border-green-500/20">
              {weeklyStatus?.lastWeekWinner && weeklyStatus.lastWeekWinner !== 'None' ? 'Rewarded ✓' : 'Competing'}
            </span>
          </div>
        </div>
      </div>

      {/* Podium Block (Top 3 Players) */}
      {!loading && top3.length > 0 && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-end justify-center gap-2 sm:gap-6 w-full max-w-2xl px-4 pt-12 pb-6">
            {podiumOrder.map(({ player, rank, color, text, label, height }) => {
              const hasFlashed = flashUsers[player.id];
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: rank * 0.15 }}
                  className={cn(
                    "flex flex-col items-center justify-end w-1/3 rounded-t-3xl border-2 border-b-0 relative p-2 sm:p-4 text-center transition-all duration-500",
                    color,
                    hasFlashed === 'up' && 'shadow-[0_0_20px_rgba(34,197,94,0.6)] border-green-400 bg-green-950/20',
                    hasFlashed === 'down' && 'shadow-[0_0_20px_rgba(239,68,68,0.6)] border-red-500 bg-red-950/20'
                  )}
                >
                  {/* Rank Indicator Badge */}
                  <div className="absolute -top-12 flex flex-col items-center">
                    {rank === 1 && (
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                      >
                        <Crown size={32} className="text-amber-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                      </motion.div>
                    )}
                    {rank === 2 && <Crown size={24} className="text-slate-300" />}
                    {rank === 3 && <Crown size={24} className="text-amber-700" />}
                    
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm mt-1 shadow-lg",
                      rank === 1 ? "bg-amber-400 text-slate-950 border-amber-300" :
                      rank === 2 ? "bg-slate-300 text-slate-950 border-slate-200" :
                      "bg-amber-700 text-white border-amber-600"
                    )}>
                      {rank}
                    </div>
                  </div>

                  {/* Player Details */}
                  <div className="space-y-1 sm:space-y-2 mt-4 z-10">
                    <p className="font-display font-black text-xs sm:text-base text-white truncate max-w-[95px] sm:max-w-[150px]">
                      {player.username}
                    </p>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full text-[10px] sm:text-xs text-brand-primary font-bold">
                      <Flame size={12} className="text-orange-500" />
                      <span>{player.streakScore}</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono font-medium block">
                      Level {player.level}
                    </div>
                  </div>

                  {/* 3D Visual Podium Stage */}
                  <div className={cn("w-full mt-4 rounded-t-2xl flex flex-col items-center justify-center", height, "bg-gradient-to-t from-slate-950/50 to-slate-900/20 border-t border-white/5")}>
                    <span className={cn("font-display font-black text-2xl sm:text-4xl tracking-tighter block", text)}>
                      {label}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block mt-1">
                      TOP {rank}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Ranking Table (Ranks 4 - 50) */}
      <div className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-xl max-w-4xl mx-auto">
        {/* Search & Statistics Filter */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Award className="text-brand-primary" /> Player Standings
          </h2>
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search scholar name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-white placeholder-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Scrollable Ranks Container */}
        <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
          {loading ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 border-4 border-t-brand-primary border-white/10 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold tracking-widest uppercase">Streaming database records...</p>
            </div>
          ) : finalTablePlayers.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <Trophy size={48} className="mx-auto mb-4 stroke-1" />
              <p className="font-medium text-lg">No scholars found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-600 mt-1">Keep practice high to climb the ranks!</p>
            </div>
          ) : (
            finalTablePlayers.map((player, idx) => {
              const globalIdx = topPlayers.findIndex(p => p.id === player.id);
              const currentRank = globalIdx !== -1 ? globalIdx + 1 : (userRank || '--');
              const isMe = player.id === currentUser.uid;
              const hasFlashed = flashUsers[player.id];
              const isPlaceholder = (player as any).isPlaceholderMe;

              return (
                <React.Fragment key={player.id}>
                  {isPlaceholder && (
                    <div className="py-3 bg-slate-950/40 text-center text-[10px] font-black tracking-widest text-slate-400 border-y border-white/5">
                      ••• CURRENT PLAYER RANKING STATUS •••
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex items-center justify-between p-4 px-6 hover:bg-white/5 transition-all duration-300",
                      isMe ? "bg-brand-primary/10 border-l-4 border-brand-primary" : "",
                      hasFlashed === 'up' && 'animate-flash bg-green-500/10',
                      hasFlashed === 'down' && 'animate-flash bg-red-500/10'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Number */}
                      <div className="w-8 font-mono font-black text-base text-slate-500 text-center">
                        #{currentRank}
                      </div>

                      {/* Avatar Badge */}
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-md",
                        isMe ? "bg-gradient-to-br from-brand-primary to-brand-secondary text-white border-brand-primary/50" : "bg-white/5 text-slate-300 border-white/10"
                      )}>
                        {player.username.substring(0, 2).toUpperCase()}
                      </div>

                      {/* Username & Level */}
                      <div>
                        <p className={cn("font-bold text-sm sm:text-base flex items-center gap-1.5", isMe ? "text-brand-primary" : "text-white")}>
                          {player.username}
                          {isMe && <span className="text-[10px] bg-brand-primary/20 text-brand-primary font-black uppercase px-2 py-0.5 rounded">You</span>}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          Level {player.level} Scholar
                        </p>
                      </div>
                    </div>

                    {/* Streak & XP Metric */}
                    <div className="text-right space-y-1">
                      <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full text-xs font-black text-orange-400">
                        <Flame size={14} className="fill-orange-500" />
                        <span>{player.streakScore}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Streak Score
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* MODULE 4: Fixed/Sticky Bottom "Your Current Status" Banner */}
      <AnimatePresence>
        {currentUser.username && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-0 left-0 w-full bg-slate-950/95 border-t border-brand-accent/20 backdrop-blur-md shadow-2xl z-50 p-3 sm:p-4 px-4 sm:px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-4">
                {/* Animated Live Badge */}
                <div className="relative">
                  <span className="absolute top-0 right-0 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 sm:h-3.5 w-3 sm:w-3.5 bg-green-500"></span>
                  </span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-red-600 to-blue-600 flex items-center justify-center font-black text-sm sm:text-lg text-white border-2 border-white/10 shadow-lg shadow-brand-primary/20">
                    {userRank ? `#${userRank}` : '--'}
                  </div>
                </div>
                
                <div>
                  <span className="text-[9px] sm:text-[10px] text-brand-accent uppercase font-black tracking-wider block">Live Student Status</span>
                  <p className="font-display font-black text-sm sm:text-lg text-white leading-none mt-1">
                    {currentUser.username}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 sm:mt-1">
                    Active in arena matching pool
                  </p>
                </div>
              </div>

              {/* Mobile Streak score shown on the right of name block on mobile */}
              <div className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl">
                <Flame size={15} className="text-orange-400 animate-pulse fill-orange-500" />
                <span className="font-display font-black text-xs text-orange-400">{userScore}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-white/5 pt-2 sm:pt-0 sm:border-none">
              <div className="text-right sm:block hidden">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Math Balance</span>
                <p className="text-xs text-slate-300 font-bold mt-1">
                  Streak and coin values sync'd
                </p>
              </div>

              {/* Desktop Streak count */}
              <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl">
                <Flame size={18} className="text-orange-400 animate-pulse fill-orange-500" />
                <span className="font-display font-black text-md sm:text-xl text-orange-400">{userScore}</span>
              </div>

              {/* Share My Rank Button */}
              <button
                onClick={handleShareRank}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-300 animate-bounce" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>Share My Rank</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Copy Alert */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed bottom-28 sm:bottom-24 right-6 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/20 z-[100] flex items-center gap-2"
          >
            <Check size={14} className="stroke-[3px]" />
            <span>Copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
