import React, { useState, useEffect } from 'react';
import { 
  fetchStudentsByClass, 
  fetchAllStudentsForSchool, 
  fetchAllTeachersForSchool,
  addStudent, 
  addTeacher, 
  Student, 
  Teacher,
  SUPABASE_SQL_SCHEMA,
  StudentActivityLog,
  fetchStudentActivitiesByClass
} from '../lib/schoolDb';
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Lock, 
  LogOut, 
  Database,
  Search,
  BookOpen,
  Check,
  Copy,
  Activity,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SchoolDashboardsProps {
  authState: {
    isAuthenticated: boolean;
    username: string | null;
    role?: 'student' | 'teacher' | 'admin' | 'individual';
    schoolId?: string | null;
    schoolName?: string | null;
    className?: string | null;
    realName?: string | null;
    userId?: string | null;
  };
  onSignOut: () => void;
}

export default function SchoolDashboards({ authState, onSignOut }: SchoolDashboardsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for Admin
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'sql'>('students');
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    className: ''
  });
  const [teacherForm, setTeacherForm] = useState({
    teacherName: '',
    username: '',
    password: '',
    assignedClass: ''
  });

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Activity Tracker State for Teachers
  const [activityLogs, setActivityLogs] = useState<StudentActivityLog[]>([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  const loadLogs = async () => {
    if (!authState.schoolId || !authState.className) return;
    setFetchingLogs(true);
    try {
      const logs = await fetchStudentActivitiesByClass(authState.schoolId, authState.className);
      setActivityLogs(logs);
    } catch (err) {
      console.warn("Failed fetching student tracking logs:", err);
    } finally {
      setFetchingLogs(false);
    }
  };

  // Fetch data depending on role
  const loadDashboardData = async () => {
    if (!authState.schoolId) return;
    setLoading(true);
    setError(null);
    try {
      if (authState.role === 'teacher') {
        // Teacher class view
        const classStudents = await fetchStudentsByClass(
          authState.schoolId, 
          authState.className || ''
        );
        setStudents(classStudents);
      } else if (authState.role === 'admin') {
        // School Admin master view
        const allStudents = await fetchAllStudentsForSchool(authState.schoolId);
        const allTeachers = await fetchAllTeachersForSchool(authState.schoolId);
        setStudents(allStudents);
        setTeachers(allTeachers);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch live database records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    if (authState.role === 'teacher') {
      loadLogs();
    }
  }, [authState.schoolId, authState.role, authState.className]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add new student (LIVE INSERT)
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { firstName, lastName, username, password, className } = studentForm;

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !password.trim() || !className.trim()) {
      setError("All fields are strictly required!");
      return;
    }

    if (username.includes(' ')) {
      setError("Spaces are not permitted in usernames!");
      return;
    }

    try {
      const studentId = await addStudent({
        real_first_name: firstName.trim(),
        real_last_name: lastName.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim(),
        school_id: authState.schoolId || '',
        class_name: className.trim()
      });

      setSuccess(`Awesome! student ${firstName} has been added instantly with ID: ${studentId}`);
      setStudentForm({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        className: className // keep class name for adding multiple
      });
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || "Failed to insert new student.");
    }
  };

  // Add new teacher (LIVE INSERT)
  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { teacherName, username, password, assignedClass } = teacherForm;

    if (!teacherName.trim() || !username.trim() || !password.trim() || !assignedClass.trim()) {
      setError("All fields are strictly required!");
      return;
    }

    if (username.includes(' ')) {
      setError("Spaces are not permitted in teacher usernames!");
      return;
    }

    try {
      const teacherId = await addTeacher({
        teacher_name: teacherName.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim(),
        school_id: authState.schoolId || '',
        assigned_class: assignedClass.trim()
      });

      setSuccess(`Fantastic! Teacher ${teacherName} has been enrolled successfully!`);
      setTeacherForm({
        teacherName: '',
        username: '',
        password: '',
        assignedClass: ''
      });
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || "Failed to insert new teacher.");
    }
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.real_first_name} ${s.real_last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.class_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-6 text-white relative overflow-hidden font-sans pt-24">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#ff0055]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#00d2ff]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Container */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="text-[#00d2ff]" size={28} />
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {authState.schoolName || "Jesse Math School Gate"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
              ROLE: {authState.role?.toUpperCase()}
            </span>
            {authState.role === 'teacher' && (
              <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
                CLASS: {authState.className}
              </span>
            )}
            <span>• Active Admin Identity: {authState.username}</span>
          </p>
        </div>

        <button
          onClick={onSignOut}
          className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-rose-500/15 border border-white/5 hover:border-rose-500/20 transition-all text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer text-slate-300 hover:text-rose-400"
        >
          <LogOut size={14} /> Exit System Panel
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* ======================================================= */}
        {/* TEACHER DASHBOARD - CLASS SPECIFIC VIEW */}
        {/* ======================================================= */}
        {authState.role === 'teacher' && (
          <>
            <div className="bg-slate-900/65 border border-white/5 rounded-[2.5rem] p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                  <Users size={18} className="text-[#00d2ff]" /> 
                  Class Enrollment: {authState.className}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Below is the database records of students assigned to your class. Review their real-identity details and real-time Math progress live.
                </p>
              </div>

              {/* Search bar */}
              <div className="relative max-w-xs w-full">
                <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#00d2ff] transition-all font-semibold"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs font-mono">
                Querying students from class {authState.className}...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center text-slate-400 text-xs max-w-md mx-auto">
                No active students matching criteria inside class {authState.className}. Add a student via Master School Admin to get started!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] font-black uppercase text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="p-4 font-mono">Student Real Name</th>
                      <th className="p-4 font-mono">Username</th>
                      <th className="p-4 font-mono">Security Password</th>
                      <th className="p-4 font-mono text-center">Class</th>
                      <th className="p-4 font-mono text-center">High Score 🏆</th>
                      <th className="p-4 font-mono text-center">Current XP ✨</th>
                      <th className="p-4 font-mono text-center">Correct / Solved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map((student) => {
                      const prog = student.math_progress_data || { highScore: 0, xp: 100, solved: 0, correctAnswers: 0 };
                      return (
                        <tr key={student.id} className="hover:bg-white/[2%] transition-all">
                          <td className="p-4 font-black text-white">
                            {student.real_first_name} {student.real_last_name}
                          </td>
                          <td className="p-4 text-[#00d2ff] font-bold font-mono">
                            {student.username}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-slate-950 rounded-lg text-slate-400 font-bold font-mono border border-white/5 flex items-center gap-1.5 w-fit">
                              <Lock size={10} className="text-slate-650" /> {student.password}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-1 bg-[#00d2ff]/10 text-[#00d2ff] rounded-md font-bold text-[10px] uppercase">
                              {student.class_name}
                            </span>
                          </td>
                          <td className="p-4 text-center font-black text-rose-400">
                            {prog.highScore}
                          </td>
                          <td className="p-4 text-center font-black text-amber-400">
                            {prog.xp} xp
                          </td>
                          <td className="p-4 text-center font-mono">
                            {prog.correctAnswers} / {prog.solved}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* New Live Tracking logs Panel */}
          <div className="bg-slate-900/65 border border-white/5 rounded-[2.5rem] p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-md font-black uppercase tracking-wider flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400 animate-pulse" />
                  Live Classroom Activity & Answer Tracker Feed
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time updates of student sessions, math milestones, battle progress, and logins currently active.
                </p>
              </div>

              <button
                onClick={loadLogs}
                disabled={fetchingLogs}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-white rounded-2xl transition-all text-xs font-bold flex items-center gap-1.5 border border-indigo-500/10 cursor-pointer disabled:opacity-50"
              >
                {fetchingLogs ? "Syncing..." : "🔄 Refresh Action Logs"}
              </button>
            </div>

            {fetchingLogs && activityLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-mono">
                Running real-time sync with database logs...
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-3xl p-10 text-center text-slate-450 text-xs max-w-sm mx-auto">
                No tracking logs recorded yet inside class {authState.className}. Activities are saved automatically as students answer questions!
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {activityLogs.map((log) => {
                  const isLogin = log.action_type === 'login';
                  const isQuiz = log.action_type === 'math_quiz';
                  const isBadge = log.action_type === 'badge_claimed';
                  return (
                    <div 
                      key={log.id} 
                      className="p-3 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-2xl flex items-start gap-3 transition-colors text-xs text-left"
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isLogin ? 'bg-blue-500/10 text-blue-400' :
                        isQuiz ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {isLogin ? <ArrowRightLeft size={13} /> : isQuiz ? <CheckCircle2 size={13} /> : <Award size={13} />}
                      </div>

                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-200">{log.student_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold">{log.description}</p>
                        <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                          <span>User: <strong className="text-indigo-400">@{log.student_id}</strong></span>
                          <span>•</span>
                          <span>Logs Type: <strong className="uppercase text-slate-400">{log.action_type}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

        {/* ======================================================= */}
        {/* MASTER SCHOOL ADMIN DASHBOARD */}
        {/* ======================================================= */}
        {authState.role === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Management Forms (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Add New Student Card */}
              <div className="bg-slate-900/65 border border-white/5 rounded-[2rem] p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-md font-black uppercase text-white flex items-center gap-2">
                    <UserPlus className="text-[#00d2ff]" size={16} /> Add New Student
                  </h3>
                  <p className="text-xs text-slate-400">
                    Submit teacher-managed student entries. Automatically writes to your live Firestore database collection.
                  </p>
                </div>

                <form onSubmit={handleAddStudentSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">First Name</label>
                      <input
                        type="text"
                        placeholder="John"
                        value={studentForm.firstName}
                        onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#00d2ff]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Last Name</label>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={studentForm.lastName}
                        onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#00d2ff]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">School Username</label>
                    <input
                      type="text"
                      placeholder="johndoe_math"
                      value={studentForm.username}
                      onChange={(e) => setStudentForm({...studentForm, username: e.target.value.replace(/\s/g, '')})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#00d2ff]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password PIN</label>
                      <input
                        type="text"
                        placeholder="math123"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#00d2ff]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Class (e.g. Year 5B)</label>
                      <input
                        type="text"
                        placeholder="Year 5B"
                        value={studentForm.className}
                        onChange={(e) => setStudentForm({...studentForm, className: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#00d2ff]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all mt-2"
                  >
                    <Plus size={12} /> Create Student Account
                  </button>
                </form>
              </div>

              {/* Add New Teacher Card */}
              <div className="bg-slate-900/65 border border-white/5 rounded-[2rem] p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-md font-black uppercase text-white flex items-center gap-2">
                    <GraduationCap className="text-[#ff0055]" size={16} /> Add New Teacher
                  </h3>
                  <p className="text-xs text-slate-400">
                    Create dynamic classroom portals. Enrolled teachers can access class lists & student credential panels live.
                  </p>
                </div>

                <form onSubmit={handleAddTeacherSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Teacher Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Vance"
                      value={teacherForm.teacherName}
                      onChange={(e) => setTeacherForm({...teacherForm, teacherName: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#ff0055]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Teacher Login Username</label>
                    <input
                      type="text"
                      placeholder="jane_teach"
                      value={teacherForm.username}
                      onChange={(e) => setTeacherForm({...teacherForm, username: e.target.value.replace(/\s/g, '')})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#ff0055]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password</label>
                      <input
                        type="text"
                        placeholder="teachPIN"
                        value={teacherForm.password}
                        onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#ff0055]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Assigned Class Room</label>
                      <input
                        type="text"
                        placeholder="Year 5B"
                        value={teacherForm.assignedClass}
                        onChange={(e) => setTeacherForm({...teacherForm, assignedClass: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#ff0055]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all mt-2"
                  >
                    <Plus size={12} /> Enroll Teacher Portal
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Master Directory Grid (7 cols) */}
            <div className="lg:col-span-7 flex flex-col bg-slate-900/65 border border-white/5 rounded-[2.5rem] p-6 md:p-8 space-y-6">
              {/* Directory Tabs */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                    activeTab === 'students' 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users size={12} /> Master Students ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('teachers')}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                    activeTab === 'teachers' 
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap size={12} /> Teachers Registry ({teachers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sql')}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                    activeTab === 'sql' 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Database size={12} /> Supabase SQL Setup
                </button>
              </div>

              {activeTab === 'students' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black uppercase">Directory Feed: School Students</h4>
                      <p className="text-[11px] text-slate-400">All student databases indexed by assignment groups</p>
                    </div>

                    <div className="relative max-w-xs w-full sm:w-56">
                      <Search size={12} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search genius database..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-[#00d2ff]"
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                      Retrieving Master Firestore records...
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-slate-400 text-xs">
                      No matching students located in database registers.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-white/5 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-[9px] font-black uppercase text-slate-400 border-b border-white/5">
                          <tr>
                            <th className="p-3">Real Name</th>
                            <th className="p-3">Username</th>
                            <th className="p-3">Password PIN</th>
                            <th className="p-3 text-center">Class Assigned</th>
                            <th className="p-3 text-center">Live Score</th>
                            <th className="p-3 text-center">EP XP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-sans">
                          {filteredStudents.map((student) => {
                            const prog = student.math_progress_data || { highScore: 0, xp: 100, solved: 0, correctAnswers: 0 };
                            return (
                              <tr key={student.id} className="hover:bg-white/[1%] transition-all">
                                <td className="p-3 font-bold text-white">
                                  {student.real_first_name} {student.real_last_name}
                                </td>
                                <td className="p-3 text-[#00d2ff] font-bold font-mono">
                                  {student.username}
                                </td>
                                <td className="p-3 font-mono">
                                  <span className="flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/5 w-fit">
                                    <Lock size={8} /> {student.password}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase rounded">
                                    {student.class_name}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-black text-rose-400">
                                  {prog.highScore}
                                </td>
                                <td className="p-3 text-center font-bold text-amber-300">
                                  {prog.xp} xp
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'teachers' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-black uppercase">Directory Feed: School Class Teachers</h4>
                    <p className="text-[11px] text-slate-400">Approved portals mapped to active academic schedules</p>
                  </div>

                  {loading ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                      Retrieving Teacher database...
                    </div>
                  ) : teachers.length === 0 ? (
                    <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-slate-400 text-xs">
                      No active teachers registered for your school.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-white/5 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-300 font-sans">
                        <thead className="bg-slate-950 text-[9px] font-black uppercase text-slate-400 border-b border-white/5">
                          <tr>
                            <th className="p-3">Teacher ID</th>
                            <th className="p-3">Sign Name</th>
                            <th className="p-3">Username</th>
                            <th className="p-3">Class Assigned</th>
                            <th className="p-3">Secure Pin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {teachers.map((t) => (
                            <tr key={t.id} className="hover:bg-white/[1%] transition-all">
                              <td className="p-3 font-mono text-[10px] text-slate-500">
                                {t.id}
                              </td>
                              <td className="p-3 font-bold text-white">
                                {t.teacher_name}
                              </td>
                              <td className="p-3 text-rose-450 font-bold font-mono">
                                {t.username}
                              </td>
                              <td className="p-3">
                                <span className="px-1.5 py-0.5 bg-[#ff0055]/15 text-[#ff0055] text-[9px] font-bold rounded">
                                  {t.assigned_class}
                                </span>
                              </td>
                              <td className="p-3 font-mono">
                                <span className="flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/5 w-fit">
                                  <Lock size={8} /> {t.password}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sql' && (
                <div className="space-y-4 flex flex-col flex-1 h-full font-sans">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black uppercase">Supabase Relational Database Script</h4>
                      <p className="text-[11px] text-slate-400">
                        Copy & Run this exact PostgreSQL DDL code inside your Supabase or SQL Editor to mirror this setup on your Vercel deployment!
                      </p>
                    </div>

                    <button
                      onClick={handleCopySql}
                      className="px-3 py-1.5 rounded-xl bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/20 text-[#fbbf24] text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      {copied ? <Check size={11} /> : <Copy size={11} />}
                      {copied ? 'Copied code!' : 'Copy SQL'}
                    </button>
                  </div>

                  <div className="flex-1 min-h-[300px] bg-slate-950 border border-white/5 p-4 rounded-xl overflow-y-auto max-h-[500px]">
                    <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap select-all">
                      {SUPABASE_SQL_SCHEMA}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
