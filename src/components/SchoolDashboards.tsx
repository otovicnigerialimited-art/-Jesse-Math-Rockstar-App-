import React from 'react';
import { motion } from 'motion/react';
import TeacherDashboard from './TeacherDashboard';

interface SchoolDashboardsProps {
  authState: {
    isAuthenticated: boolean;
    username: string | null;
    role?: 'student' | 'teacher' | 'admin' | 'individual';
    userId?: string | null;
    realName?: string | null;
    email?: string | null;
  };
  onSignOut: () => void;
}

export default function SchoolDashboards({ authState, onSignOut }: SchoolDashboardsProps) {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-white relative overflow-hidden font-sans pt-24 animate-fade-in">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-violet-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        {authState.role === 'teacher' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <TeacherDashboard 
              teacherId={authState.userId || ''}
              teacherEmail={authState.email || authState.username || ''}
              teacherName={authState.realName || 'Teacher'}
              onSignOut={onSignOut}
            />
          </motion.div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-sm font-mono text-slate-500">Unauthorised access role state.</p>
          </div>
        )}
      </div>
    </div>
  );
}
