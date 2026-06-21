import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy,
  updateDoc
} from 'firebase/firestore';

// ==========================================
// 1. DATABASE SCHEMA TYPES (Relational & Firestore equivalent)
// ==========================================

export interface School {
  id: string; // docId
  school_name: string;
  admin_password?: string; // used for school registration/admin entry
}

export interface SchoolAdmin {
  id: string; // docId
  username: string;
  password?: string;
  school_id: string;
}

export interface Teacher {
  id: string; // docId
  teacher_name: string;
  username: string;
  password?: string;
  school_id: string;
  assigned_class: string; // e.g. 'Year 5B'
}

export interface MathProgressData {
  highScore: number;
  xp: number;
  solved: number;
  correctAnswers: number;
}

export interface Student {
  id: string; // docId
  real_first_name: string;
  real_last_name: string;
  username: string;
  password?: string;
  school_id: string;
  class_name: string;
  math_progress_data: MathProgressData;
}

// ==========================================
// SQL SETUP CODE FOR SUPABASE (For User Reference)
// ==========================================
export const SUPABASE_SQL_SCHEMA = `-- Jesse Math Rockstar SQL Schema (Supabase / Postgres)
-- Run this in your Supabase SQL Editor to create the correct tables & relationships!

-- 1. Schools Table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name VARCHAR(100) NOT NULL UNIQUE,
  admin_password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. School Admins Table
CREATE TABLE IF NOT EXISTS school_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  assigned_class VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_first_name VARCHAR(100) NOT NULL,
  real_last_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_name VARCHAR(50) NOT NULL,
  math_progress_data JSONB NOT NULL DEFAULT '{"highScore": 0, "xp": 100, "solved": 0, "correctAnswers": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for rapid teacher and student school_id grouping
CREATE INDEX IF NOT EXISTS idx_students_school_class ON students(school_id, class_name);
CREATE INDEX IF NOT EXISTS idx_teachers_school_class ON teachers(school_id, assigned_class);
`;

// ==========================================
// 2. LIVE SEED SCRIPT (Ensures active database records exist)
// ==========================================

export async function seedSchoolsDb() {
  try {
    const schoolsCol = collection(db, 'schools');
    const snap = await getDocs(schoolsCol);
    
    if (snap.empty) {
      console.log('✏️ Seeding default schools data to firestore...');
      
      // Seed School
      const schoolId = 'jesse_academy';
      await setDoc(doc(db, 'schools', schoolId), {
        id: schoolId,
        school_name: 'Jesse Math Academy',
        admin_password: 'admin123'
      });

      // Seed School Admin
      const adminId = 'admin_jesse';
      await setDoc(doc(db, 'school_admins', adminId), {
        id: adminId,
        username: 'jesse_admin',
        password: 'admin123',
        school_id: schoolId
      });

      // Seed Teacher
      const teacherId = 'teacher_sarah';
      await setDoc(doc(db, 'teachers', teacherId), {
        id: teacherId,
        teacher_name: 'Sarah Fletcher',
        username: 'sarah_teach',
        password: 'teach123',
        school_id: schoolId,
        assigned_class: 'Year 5B'
      });

      // Seed Student 1
      const student1Id = 'student_leo';
      await setDoc(doc(db, 'students', student1Id), {
        id: student1Id,
        real_first_name: 'Leo',
        real_last_name: 'Pratt',
        username: 'leo_rockstar',
        password: 'star123',
        school_id: schoolId,
        class_name: 'Year 5B',
        math_progress_data: {
          highScore: 420,
          xp: 1250,
          solved: 120,
          correctAnswers: 98
        }
      });

      // Seed Student 2
      const student2Id = 'student_emma';
      await setDoc(doc(db, 'students', student2Id), {
        id: student2Id,
        real_first_name: 'Emma',
        real_last_name: 'Watson',
        username: 'emma_calc',
        password: 'star123',
        school_id: schoolId,
        class_name: 'Year 5B',
        math_progress_data: {
          highScore: 680,
          xp: 1850,
          solved: 150,
          correctAnswers: 135
        }
      });

      // Seed Student 3 (Different Class)
      const student3Id = 'student_ron';
      await setDoc(doc(db, 'students', student3Id), {
        id: student3Id,
        real_first_name: 'Ron',
        real_last_name: 'Weasley',
        username: 'ron_wizard',
        password: 'star123',
        school_id: schoolId,
        class_name: 'Year 4A',
        math_progress_data: {
          highScore: 190,
          xp: 450,
          solved: 80,
          correctAnswers: 44
        }
      });

      console.log('✅ Seeding complete.');
    }
  } catch (error) {
    console.error('Failed to seed schools DB database:', error);
  }
}

// ==========================================
// 3. QUERIES AND TRANSACTIONS
// ==========================================

// Get all schools for dropdown
export async function fetchAllSchools(): Promise<School[]> {
  // Ensure we have some default data seeded
  await seedSchoolsDb();
  
  const q = collection(db, 'schools');
  const snap = await getDocs(q);
  const schools: School[] = [];
  snap.forEach((d) => {
    schools.push({ id: d.id, ...d.data() } as School);
  });
  return schools;
}

// Verify credentials across 3 roles: student, teacher, admin
export async function authenticateSchoolUser(
  schoolId: string,
  className: string,
  username: string,
  passwordEntered: string
): Promise<{
  success: boolean;
  role: 'student' | 'teacher' | 'admin';
  userObj: any;
} | null> {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = passwordEntered.trim();

  // 1. Try Authenticating Admin
  const adminQuery = query(
    collection(db, 'school_admins'),
    where('school_id', '==', schoolId),
    where('username', '==', cleanUser)
  );
  const adminSnap = await getDocs(adminQuery);
  if (!adminSnap.empty) {
    const adminDoc = adminSnap.docs[0];
    const data = adminDoc.data();
    if (data.password === cleanPass) {
      return {
        success: true,
        role: 'admin',
        userObj: { id: adminDoc.id, ...data }
      };
    }
  }

  // 2. Try Authenticating Teacher
  const teacherQuery = query(
    collection(db, 'teachers'),
    where('school_id', '==', schoolId),
    where('username', '==', cleanUser)
  );
  const teacherSnap = await getDocs(teacherQuery);
  if (!teacherSnap.empty) {
    const teacherDoc = teacherSnap.docs[0];
    const data = teacherDoc.data();
    if (data.password === cleanPass && (!className || data.assigned_class.toLowerCase() === className.toLowerCase())) {
      return {
        success: true,
        role: 'teacher',
        userObj: { id: teacherDoc.id, ...data }
      };
    }
  }

  // 3. Try Authenticating Student
  const studentQuery = query(
    collection(db, 'students'),
    where('school_id', '==', schoolId),
    where('username', '==', cleanUser),
    where('class_name', '==', className)
  );
  const studentSnap = await getDocs(studentQuery);
  if (!studentSnap.empty) {
    const studentDoc = studentSnap.docs[0];
    const data = studentDoc.data();
    if (data.password === cleanPass) {
      return {
        success: true,
        role: 'student',
        userObj: { id: studentDoc.id, ...data }
      };
    }
  }

  return { success: false, role: 'student', userObj: null };
}

// Fetch class-specific students for Teacher
export async function fetchStudentsByClass(schoolId: string, className: string): Promise<Student[]> {
  const q = query(
    collection(db, 'students'),
    where('school_id', '==', schoolId),
    where('class_name', '==', className)
  );
  const snap = await getDocs(q);
  const students: Student[] = [];
  snap.forEach((d) => {
    students.push({ id: d.id, ...d.data() } as Student);
  });
  return students;
}

// Fetch all students for School Admin (Grouped by class in frontend)
export async function fetchAllStudentsForSchool(schoolId: string): Promise<Student[]> {
  const q = query(
    collection(db, 'students'),
    where('school_id', '==', schoolId)
  );
  const snap = await getDocs(q);
  const students: Student[] = [];
  snap.forEach((d) => {
    students.push({ id: d.id, ...d.data() } as Student);
  });
  return students;
}

// Fetch all teachers for School Admin
export async function fetchAllTeachersForSchool(schoolId: string): Promise<Teacher[]> {
  const q = query(
    collection(db, 'teachers'),
    where('school_id', '==', schoolId)
  );
  const snap = await getDocs(q);
  const teachers: Teacher[] = [];
  snap.forEach((d) => {
    teachers.push({ id: d.id, ...d.data() } as Teacher);
  });
  return teachers;
}

// Add a new Student (Live INSERT equivalent)
export async function addStudent(student: Omit<Student, 'id' | 'math_progress_data'>): Promise<string> {
  const fullStudent = {
    ...student,
    username: student.username.trim().toLowerCase(),
    math_progress_data: {
      highScore: 0,
      xp: 100,
      solved: 0,
      correctAnswers: 0
    }
  };
  const docRef = await addDoc(collection(db, 'students'), fullStudent);
  // Update with its own generated ID for consistency
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

// Add a new Teacher (Live INSERT equivalent)
export async function addTeacher(teacher: Omit<Teacher, 'id'>): Promise<string> {
  const fullTeacher = {
    ...teacher,
    username: teacher.username.trim().toLowerCase()
  };
  const docRef = await addDoc(collection(db, 'teachers'), fullTeacher);
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

// 4. ON-THE-FLY SCHOOL REGISTRATION FROM GOOGLE MAPS
export async function registerSchool(id: string, name: string): Promise<string> {
  try {
    const ref = doc(db, 'schools', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        id: id,
        school_name: name,
        admin_password: 'admin123' // default admin security passcode
      });
      
      // Also seed a default administrative console account for this school
      const safeAdminUsername = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_admin`;
      const adminId = `admin_${id}`;
      await setDoc(doc(db, 'school_admins', adminId), {
        id: adminId,
        username: safeAdminUsername,
        password: 'admin123',
        school_id: id
      });
    }
    return id;
  } catch (err) {
    console.error("Failed to register school on Firestore ledger:", err);
    throw err;
  }
}

// 5. LIVE STUDENT ACTIVITY LOGGING ENGINE
export interface StudentActivityLog {
  id: string;
  student_id: string;
  student_name: string;
  school_id: string;
  class_name: string;
  action_type: 'login' | 'math_quiz' | 'battle' | 'badge_claimed';
  description: string;
  timestamp: string;
}

export async function logStudentActivity(
  studentId: string,
  studentName: string,
  schoolId: string,
  className: string,
  actionType: 'login' | 'math_quiz' | 'battle' | 'badge_claimed',
  description: string
) {
  try {
    const logsCol = collection(db, 'student_activity_logs');
    const newLog = {
      student_id: studentId,
      student_name: studentName,
      school_id: schoolId,
      class_name: className,
      action_type: actionType,
      description,
      timestamp: new Date().toISOString()
    };
    const ref = await addDoc(logsCol, newLog);
    await updateDoc(ref, { id: ref.id });
  } catch (err) {
    console.warn("Failed to write student activity log to Firestore:", err);
  }
}

export async function fetchStudentActivitiesByClass(schoolId: string, className: string): Promise<StudentActivityLog[]> {
  try {
    const q = query(
      collection(db, 'student_activity_logs'),
      where('school_id', '==', schoolId),
      where('class_name', '==', className),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    const logs: StudentActivityLog[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...d.data() } as StudentActivityLog);
    });
    return logs;
  } catch (err) {
    console.warn("Ordered activity logs fetch bypassed or failed, falling back to manual sort:", err);
    try {
      const q = query(
        collection(db, 'student_activity_logs'),
        where('school_id', '==', schoolId),
        where('class_name', '==', className)
      );
      const snap = await getDocs(q);
      const logs: StudentActivityLog[] = [];
      snap.forEach((d) => {
        logs.push({ id: d.id, ...d.data() } as StudentActivityLog);
      });
      return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (innerErr) {
      console.error("All activity logs indices and queries failed:", innerErr);
      return [];
    }
  }
}

// Update student score live
export async function updateStudentProgress(studentId: string, scoreGained: number, xpGained: number, isCorrect: boolean) {
  try {
    const ref = doc(db, 'students', studentId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const prevProgress = data.math_progress_data || { highScore: 0, xp: 100, solved: 0, correctAnswers: 0 };
      
      const updatedProgress = {
        highScore: Math.max(prevProgress.highScore || 0, scoreGained),
        xp: (prevProgress.xp || 100) + xpGained,
        solved: (prevProgress.solved || 0) + 1,
        correctAnswers: (prevProgress.correctAnswers || 0) + (isCorrect ? 1 : 0)
      };

      await updateDoc(ref, {
        math_progress_data: updatedProgress
      });

      // Auto-log the math adventure live!
      await logStudentActivity(
        studentId,
        `${data.real_first_name} ${data.real_last_name}`,
        data.school_id,
        data.class_name,
        'math_quiz',
        `Conquered math equation! Score: ${scoreGained} pts, earned +${xpGained} XP.`
      );
    }
  } catch (err) {
    console.error("Failed to update student math scores live on Firestore:", err);
  }
}
