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
  updateDoc
} from 'firebase/firestore';

// ==========================================================
// 1. SUPABASE / POSTGRES SQL SCHEMA REPRESENTATION (USER REFERENCE)
// ==========================================================
export const SUPABASE_SQL_SCHEMA = `-- Jesse's Math Arena SQL Schema (Supabase / Postgres)
-- Run this in your Supabase SQL Editor to create the correct tables & relationships!

-- 1. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. School Students Table
CREATE TABLE IF NOT EXISTS school_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_first_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  school_math_progress JSONB NOT NULL DEFAULT '{"highScore": 0, "xp": 100, "coins": 100, "solved": 0, "correctAnswers": 0, "currentLevel": 1}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for rapid teacher student queries
CREATE INDEX IF NOT EXISTS idx_school_students_teacher ON school_students(teacher_id);
`;

// ==========================================================
// 2. TYPE DEFINITIONS
// ==========================================================
export interface Teacher {
  id: string; // doc ID
  teacher_name: string;
  email: string;
  password?: string;
}

export interface MathProgressData {
  highScore: number;
  xp: number;
  coins: number;
  solved: number;
  correctAnswers: number;
  currentLevel: number;
}

export interface SchoolStudent {
  id: string; // doc ID
  real_first_name: string;
  username: string;
  password?: string;
  teacher_id: string; // maps to registered teacher
  school_math_progress: MathProgressData;

  // Duplicate top-level fields for flawless frontend compatibility
  coins?: number;
  xp?: number;
  badges?: string[];
  equipped_items?: {
    hair: string;
    body: string;
    instrument: string;
  };
  purchased_items?: string[];
}

// Retain Student alias for backward compatibility across existing files if they refer to it
export type Student = SchoolStudent;

// ==========================================================
// 3. SEEDING SYSTEM (Ensures default accounts exist for instant trial)
// ==========================================================
export async function seedSchoolsDb() {
  try {
    const teachersCol = collection(db, 'teachers');
    const snap = await getDocs(teachersCol);
    
    if (snap.empty) {
      console.log('✏️ Seeding default classroom teacher and student data to Firestore...');
      
      const defaultTeacherId = 'teacher_jesse_default';
      
      // Seed default teacher
      await setDoc(doc(db, 'teachers', defaultTeacherId), {
        id: defaultTeacherId,
        teacher_name: 'Jesse Rockstar',
        email: 'teacher@jesserock.edu',
        password: 'teach123'
      });

      // Seed default students under this teacher
      const s1Id = 'student_leo_default';
      await setDoc(doc(db, 'school_students', s1Id), {
        id: s1Id,
        real_first_name: 'Leo',
        username: 'leo_rock',
        password: 'star123',
        teacher_id: defaultTeacherId,
        school_math_progress: {
          highScore: 420,
          xp: 1250,
          coins: 200,
          solved: 120,
          correctAnswers: 98,
          currentLevel: 5
        },
        // Root fields for dual backward compatibility
        coins: 200,
        xp: 1250,
        badges: ["School Rockstar", "Genius Debut"],
        equipped_items: {
          hair: 'hair_rocker',
          body: 'body_vest',
          instrument: 'guitar_v'
        },
        purchased_items: ['hair_rocker', 'body_vest', 'guitar_v']
      });

      const s2Id = 'student_emma_default';
      await setDoc(doc(db, 'school_students', s2Id), {
        id: s2Id,
        real_first_name: 'Emma',
        username: 'emma_calc',
        password: 'star123',
        teacher_id: defaultTeacherId,
        school_math_progress: {
          highScore: 680,
          xp: 1850,
          coins: 350,
          solved: 150,
          correctAnswers: 135,
          currentLevel: 8
        },
        coins: 350,
        xp: 1850,
        badges: ["School Rockstar", "Fast Fingers"],
        equipped_items: {
          hair: 'hair_mohawk',
          body: 'body_tshirt',
          instrument: 'guitar_default'
        },
        purchased_items: ['hair_mohawk', 'body_tshirt']
      });

      console.log('✅ Seeding complete.');
    }
  } catch (error) {
    console.warn('Failed to seed default classroom data:', error);
  }
}

// ==========================================================
// 4. AUTHENTICATION & CRUD OPERATIONS
// ==========================================================

// Authenticate Teacher
export async function authenticateSchoolTeacher(
  emailEntered: string,
  passwordEntered: string
): Promise<{
  success: boolean;
  error?: string;
  userObj?: Teacher;
} | null> {
  await seedSchoolsDb();
  const cleanEmail = emailEntered.trim().toLowerCase();
  const cleanPass = passwordEntered.trim();

  const q = query(
    collection(db, 'teachers'),
    where('email', '==', cleanEmail)
  );
  
  const snap = await getDocs(q);
  if (snap.empty) {
    return { success: false, error: "Teacher account with this email does not exist." };
  }

  const teacherDoc = snap.docs[0];
  const data = teacherDoc.data();
  if (data.password === cleanPass) {
    return {
      success: true,
      userObj: { id: teacherDoc.id, ...data } as Teacher
    };
  }

  return { success: false, error: "Incorrect password entered." };
}

// Register Teacher
export async function registerTeacher(
  teacherName: string,
  emailEntered: string,
  passwordEntered: string
): Promise<{ success: boolean; error?: string; userObj?: Teacher }> {
  const cleanEmail = emailEntered.trim().toLowerCase();
  const cleanPass = passwordEntered.trim();
  const cleanName = teacherName.trim();

  // Validate duplicate email
  const q = query(
    collection(db, 'teachers'),
    where('email', '==', cleanEmail)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { success: false, error: "A teacher has already registered with this email address." };
  }

  // Insert teacher doc
  const docRef = await addDoc(collection(db, 'teachers'), {
    teacher_name: cleanName,
    email: cleanEmail,
    password: cleanPass
  });

  await updateDoc(docRef, { id: docRef.id });

  return {
    success: true,
    userObj: { id: docRef.id, teacher_name: cleanName, email: cleanEmail }
  };
}

// Authenticate School Student
export async function authenticateSchoolStudent(
  usernameEntered: string,
  passwordEntered: string
): Promise<{
  success: boolean;
  error?: string;
  userObj?: SchoolStudent;
} | null> {
  await seedSchoolsDb();
  const cleanUser = usernameEntered.trim().toLowerCase();
  const cleanPass = passwordEntered.trim();

  const q = query(
    collection(db, 'school_students'),
    where('username', '==', cleanUser)
  );

  const snap = await getDocs(q);
  if (snap.empty) {
    return { success: false, error: "School student username not found. Ask your teacher to register you!" };
  }

  const studentDoc = snap.docs[0];
  const data = studentDoc.data() as SchoolStudent;
  if (data.password === cleanPass) {
    return {
      success: true,
      userObj: { id: studentDoc.id, ...data }
    };
  }

  return { success: false, error: "Incorrect password or pin. Please ask your teacher to verify it!" };
}

// Add student under a teacher (Roster creation)
export async function addStudentToTeacher(
  realFirstName: string,
  usernameEntered: string,
  passwordEntered: string,
  teacherId: string
): Promise<{ success: boolean; error?: string; studentId?: string }> {
  const cleanUser = usernameEntered.trim().toLowerCase();
  const cleanPass = passwordEntered.trim();
  const cleanFirstName = realFirstName.trim();

  // Verify unique student username globally (or in classroom)
  const q = query(
    collection(db, 'school_students'),
    where('username', '==', cleanUser)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { success: false, error: `Username @${cleanUser} is already claimed by another student. Try an initial/suffix variation!` };
  }

  // Insert standard rockstar data
  const initialProgressObj: MathProgressData = {
    highScore: 0,
    xp: 100,
    coins: 100,
    solved: 0,
    correctAnswers: 0,
    currentLevel: 1
  };

  const newStudentData = {
    real_first_name: cleanFirstName,
    username: cleanUser,
    password: cleanPass,
    teacher_id: teacherId,
    school_math_progress: initialProgressObj,

    // Duplicate at root level
    coins: 100,
    xp: 100,
    badges: ["School Rockstar"],
    equipped_items: {
      hair: 'hair_default',
      body: 'body_default',
      instrument: 'instrument_default'
    },
    purchased_items: ['hair_default', 'body_default', 'instrument_default']
  };

  const docRef = await addDoc(collection(db, 'school_students'), newStudentData);
  await updateDoc(docRef, { id: docRef.id });

  return {
    success: true,
    studentId: docRef.id
  };
}

// Fetch all students registered under a teacher
export async function fetchStudentsByTeacher(teacherId: string): Promise<SchoolStudent[]> {
  const q = query(
    collection(db, 'school_students'),
    where('teacher_id', '==', teacherId)
  );
  const snap = await getDocs(q);
  const list: SchoolStudent[] = [];
  snap.forEach(d => {
    list.push({ id: d.id, ...d.data() } as SchoolStudent);
  });
  return list;
}

// Live student progress updates from quiz battles
export async function updateSchoolStudentProgress(
  studentId: string,
  scoreGained: number,
  xpGained: number,
  isCorrect: boolean
) {
  try {
    const ref = doc(db, 'school_students', studentId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const prevRootProgress = data.school_math_progress || { highScore: 0, xp: 100, coins: 100, solved: 0, correctAnswers: 0, currentLevel: 1 };
      
      const nextHighScore = Math.max(prevRootProgress.highScore || 0, scoreGained);
      const nextXp = (data.xp || prevRootProgress.xp || 100) + xpGained;
      // Coins are earned based on math solved (e.g. +10 coins per correct equation solved!)
      const coinGain = isCorrect ? 10 : 2;
      const nextCoins = (data.coins || prevRootProgress.coins || 100) + coinGain;
      const nextSolved = (prevRootProgress.solved || 0) + 1;
      const nextCorrect = (prevRootProgress.correctAnswers || 0) + (isCorrect ? 1 : 0);
      const nextLevel = Math.floor(nextXp / 1000) + 1;

      const updatedProgressObj: MathProgressData = {
        highScore: nextHighScore,
        xp: nextXp,
        coins: nextCoins,
        solved: nextSolved,
        correctAnswers: nextCorrect,
        currentLevel: nextLevel
      };

      await updateDoc(ref, {
        school_math_progress: updatedProgressObj,
        coins: nextCoins,
        xp: nextXp
      });
    }
  } catch (err) {
    console.error("Failed to update school student scores live on Firestore:", err);
  }
}

// Re-exports/shims for compatibility
export async function fetchAllSchools() { return []; }
export async function registerSchool() { return ""; }
export async function authenticateSchoolUser() { return null; }
export async function fetchPendingSchools() { return []; }
export async function fetchVerifiedSchools() { return []; }
export async function approveSchool() { }
export async function fetchStudentsByClass() { return []; }
export async function fetchAllStudentsForSchool() { return []; }
export async function fetchAllTeachersForSchool() { return []; }
export async function addStudent() { return ""; }
export async function addTeacher() { return ""; }
export async function logStudentActivity() { }
export async function fetchStudentActivitiesByClass() { return []; }
export async function updateStudentProgress() { }
