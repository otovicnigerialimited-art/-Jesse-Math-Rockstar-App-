import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SchoolStudent, addStudentToTeacher } from '../lib/schoolDb';
import { 
  Users, 
  Search, 
  Lock, 
  LogOut, 
  RefreshCw, 
  Award, 
  GraduationCap, 
  Sparkles,
  UserPlus,
  Coins,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherDashboardProps {
  teacher?: {
    id: string;
    teacher_name: string;
    email: string;
  };
  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;
  onSignOut: () => void;
}

export default function TeacherDashboard({ 
  teacher, 
  teacherId, 
  teacherName, 
  teacherEmail, 
  onSignOut 
}: TeacherDashboardProps) {
  // Resolve props cleanly supporting both nested teacher object and flat props
  const resolvedId = teacher?.id || teacherId || '';
  const resolvedName = teacher?.teacher_name || teacherName || 'Rockstar Educator';
  const resolvedEmail = teacher?.email || teacherEmail || '';

  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Adding Student
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // local UX feedbacks
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Live Firestore listener on students registered under this teacher
  useEffect(() => {
    if (!resolvedId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'school_students'),
      where('teacher_id', '==', resolvedId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsList: SchoolStudent[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        docsList.push({
          id: docSnap.id,
          ...data
        } as SchoolStudent);
      });
      setStudents(docsList);
      setLoading(false);
    }, (err) => {
      console.error("Firestore classroom roster sub failed:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [resolvedId]);

  // 2. Client-side Form Validation and Student Register Creation
  const handleRegisterStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanFirstName = firstName.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/\s/g, '');
    const cleanPassword = password.trim();

    // STRICT LOCAL VERIFICATION (Enforce browser-side checks to protect DB resources)
    if (!cleanFirstName) {
      setFormError("Error: Real first name is required.");
      return;
    }
    if (cleanFirstName.length < 2) {
      setFormError("Error: Real first name must be at least 2 characters long.");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(cleanFirstName)) {
      setFormError("Error: Real first name can only contain letters and spaces.");
      return;
    }

    if (!cleanUsername) {
      setFormError("Error: Username is required.");
      return;
    }
    if (cleanUsername.length < 3) {
      setFormError("Error: Username must be at least 3 characters long.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setFormError("Error: Username can only contain lowercase letters, numbers, and underscores.");
      return;
    }

    if (!cleanPassword) {
      setFormError("Error: Password is required.");
      return;
    }
    if (cleanPassword.length < 4) {
      setFormError("Error: Password PIN must be at least 4 characters long.");
      return;
    }

    // Pass validated state to database helper to save
    setIsSubmitting(true);
    try {
      const result = await addStudentToTeacher(cleanFirstName, cleanUsername, cleanPassword, resolvedId);
      if (result.success) {
        setFormSuccess(`Successfully registered rockstar student @${cleanUsername}!`);
        // Reset local form immediately
        setFirstName('');
        setUsername('');
        setPassword('');
      } else {
        setFormError(result.error || "Failed to create student account.");
      }
    } catch (err: any) {
      setFormError(err.message || "A network error occurred while writing to the registry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Search Filter Logic
  const filteredStudents = students.filter(s => {
    const fullName = s.real_first_name.toLowerCase();
    const queryStr = searchQuery.toLowerCase();
    return fullName.includes(queryStr) || s.username.includes(queryStr);
  });

  // 4. Computed stats
  const totalStudents = students.length;
  const totalClassXP = students.reduce((acc, current) => {
    const prog = current.school_math_progress || { xp: 0 };
    return acc + (prog.xp || 100);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Teacher Dashboard Master Panel */}
      <div id="teacher-header-panel" className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-xl relative overflow-hidden">
        {/* Colorful top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono text-xs font-black uppercase">
                Classroom Lead
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="text-violet-400" size={24} />
                Welcome, {resolvedName}!
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Your classroom control board. Manage your math rockstars and check real-time progress below.
            </p>
            <div className="text-xs font-mono text-indigo-400">
              Registered email: {resolvedEmail}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onSignOut}
              className="px-4 py-3 rounded-2xl bg-slate-950 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Stats Widget Row */}
      <div id="classroom-tracker-widgets" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-5 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Active Class Students</div>
            <div className="text-2xl font-black text-white">{totalStudents}</div>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-5 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Accumulated Class XP Points</div>
            <div className="text-2xl font-black text-white">{totalClassXP} XP</div>
          </div>
        </div>
      </div>

      {/* Dual Work Split: Left Setup Panel, Right live listing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Register New Student in Classroom */}
        <div id="card-student-register" className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 space-y-6 backdrop-blur-xl h-fit text-left">
          <div className="space-y-1">
            <h3 className="text-md font-black uppercase text-white flex items-center gap-2">
              <UserPlus size={18} className="text-emerald-400" />
              Register student
            </h3>
            <p className="text-xs text-slate-400">
              Instantly create a new credentials profile to onboard a student.
            </p>
          </div>

          <form onSubmit={handleRegisterStudentSubmit} className="space-y-4">
            {formError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-start gap-2 animate-bounce-short">
                <CheckCircle size={15} className="shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* First Name Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Real First Name</label>
              <input
                type="text"
                placeholder="e.g. Mason"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                disabled={isSubmitting}
              />
              <p className="text-[9px] text-slate-500">Real name is visible only to you on this roster.</p>
            </div>

            {/* Username Entry */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Game Username</label>
              <input
                type="text"
                placeholder="e.g. mason_star"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                disabled={isSubmitting}
              />
              <p className="text-[9px] text-slate-500">Must be alphanumeric. Must be unique in the database.</p>
            </div>

            {/* Password Entry */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Roster Login Password</label>
              <input
                type="text"
                placeholder="e.g. play777"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                disabled={isSubmitting}
              />
              <p className="text-[9px] text-slate-500">PIN or passcode used by the student to log in.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-950/15 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Creating Student...
                </>
              ) : (
                <>
                  <UserPlus size={13} />
                  Register Student Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Columns: Live Roster & Student Stats */}
        <div id="card-class-roster" className="lg:col-span-2 space-y-6 text-left">
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 space-y-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-md font-black uppercase text-white flex items-center gap-2">
                  <Users size={18} className="text-violet-400" />
                  Active Class Student Roster
                </h3>
                <p className="text-xs text-slate-400">Reference student passwords and track math scoreboard stats live.</p>
              </div>

              {/* Search filter input */}
              <div className="relative max-w-xs w-full sm:w-56">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-9 pr-4 py-2 text-xs outline-none focus:border-violet-500 font-medium transition-all text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                <RefreshCw size={16} className="animate-spin mx-auto mb-2 text-violet-400" />
                Loading live classroom roster...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="border border-dashed border-white/5 rounded-3xl p-12 text-center text-slate-450 text-xs mx-auto space-y-3">
                <p>No rockstars registered inside your classroom ledger yet.</p>
                <p className="text-[11px] text-slate-500">
                  Fill in the registration form on the left of this screen to instantly add students!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Game Logins</th>
                      <th className="p-4 text-center">Score 🏆</th>
                      <th className="p-4 text-center">XP Points ✨</th>
                      <th className="p-4 text-center">Math Coins 🪙</th>
                      <th className="p-4 text-center">Level ⭐</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filteredStudents.map((student) => {
                      const progress = student.school_math_progress || {
                        highScore: 0,
                        xp: 100,
                        coins: 100,
                        solved: 0,
                        correctAnswers: 0,
                        currentLevel: 1
                      };
                      return (
                        <tr key={student.id} className="hover:bg-white/[2%] transition-all">
                          <td className="p-4 text-white">
                            <span className="font-bold block text-sm">
                              {student.real_first_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono italic">ID: {student.id.substring(0, 8)}...</span>
                          </td>
                          <td className="p-4 space-y-1">
                            <div className="text-cyan-400 font-mono font-bold text-xs">
                              @{student.username}
                            </div>
                            <span className="px-2 py-0.5 bg-slate-950 rounded text-slate-400 font-bold font-mono border border-white/5 inline-flex items-center gap-1">
                              <Lock size={9} className="text-slate-600" /> {student.password}
                            </span>
                          </td>
                          <td className="p-4 text-center font-extrabold text-rose-400 text-sm">
                            {progress.highScore}
                          </td>
                          <td className="p-4 text-center font-black text-amber-400">
                            {progress.xp}
                          </td>
                          <td className="p-4 text-center font-black text-yellow-400 inline-flex items-center gap-1 justify-center pt-5">
                            <Coins size={12} className="text-yellow-500" />
                            {student.coins ?? progress.coins ?? 100}
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded-md font-mono text-xs font-bold">
                              Lvl {progress.currentLevel ?? 1}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
