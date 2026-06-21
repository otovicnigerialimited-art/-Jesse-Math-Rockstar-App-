import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  User, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  BookOpen, 
  FileText, 
  X, 
  ShieldAlert, 
  HelpCircle, 
  Activity, 
  Crown,
  Scale,
  Award,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRightLeft,
  MapPin,
  PlusCircle,
  LogIn
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  fetchAllSchools, 
  authenticateSchoolUser, 
  School, 
  registerSchool, 
  addTeacher, 
  logStudentActivity 
} from '../lib/schoolDb';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface AuthGateProps {
  onAuthSuccess: (username: string, uid: string) => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function AuthGate({ onAuthSuccess }: AuthGateProps) {
  // Tabs: 'individual' for Home Login, 'school' for School Login
  const [loginTab, setLoginTab] = useState<'individual' | 'school'>('individual');
  // School sub-tabs: 'signin' for traditional login, 'teachersignup' for Teacher Self-registration
  const [schoolSubTab, setSchoolSubTab] = useState<'signin' | 'teachersignup'>('signin');

  // Home Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // School Login Form State
  const [schoolsList, setSchoolsList] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [className, setClassName] = useState('');
  const [schoolUsername, setSchoolUsername] = useState('');
  const [schoolPassword, setSchoolPassword] = useState('');
  const [showSchoolPassword, setShowSchoolPassword] = useState(false);

  // Interactive Google Maps School Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedSchoolObj, setSelectedSchoolObj] = useState<{ id: string, name: string, address?: string } | null>(null);
  const [schoolLocation, setSchoolLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Teacher Self-registration states
  const [teacherNameSignup, setTeacherNameSignup] = useState('');
  const [classSignup, setClassSignup] = useState('');
  const [teacherUsernameSignup, setTeacherUsernameSignup] = useState('');
  const [teacherPasswordSignup, setTeacherPasswordSignup] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Load registered schools database
  useEffect(() => {
    async function loadSchools() {
      try {
        const list = await fetchAllSchools();
        setSchoolsList(list);
        if (list.length > 0) {
          setSelectedSchool(list[0].id);
        }
      } catch (err) {
        console.warn("Failed to load schools database:", err);
      }
    }
    loadSchools();
  }, [loginTab]);

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedSchool) {
      setError("Please select your registered school!");
      return;
    }
    if (!schoolUsername.trim() || !schoolPassword.trim()) {
      setError("Please fill in both school username and secret PIN!");
      return;
    }

    setLoading(true);

    try {
      const res = await authenticateSchoolUser(
        selectedSchool,
        className.trim(),
        schoolUsername.trim(),
        schoolPassword.trim()
      );

      if (!res || !res.success) {
        setError("Verified auth lock failed! Please check credentials or Class Name PIN match.");
        setLoading(false);
        return;
      }

      const { role, userObj } = res;
      const schoolObj = schoolsList.find(s => s.id === selectedSchool);
      const schoolName = schoolObj ? schoolObj.school_name : "Your Math School";

      // Store school states natively in localStorage
      localStorage.setItem('jesse_rock_role', role);
      localStorage.setItem('jesse_rock_school_id', selectedSchool);
      localStorage.setItem('jesse_rock_school_name', schoolName);
      localStorage.setItem('jesse_rock_class_name', role === 'student' ? userObj.class_name : (role === 'teacher' ? userObj.assigned_class : ''));
      localStorage.setItem('jesse_rock_real_name', role === 'student' ? `${userObj.real_first_name} ${userObj.real_last_name}` : (role === 'teacher' ? userObj.teacher_name : 'Admin User'));
      localStorage.setItem('jesse_rock_user_id', userObj.id);
      localStorage.setItem('jesse_rock_my_username', userObj.username);
      localStorage.setItem('jesse_rock_device_id', userObj.id);

      // Log successful student login action
      if (role === 'student' && userObj) {
        try {
          await logStudentActivity(
            userObj.id,
            `${userObj.real_first_name} ${userObj.real_last_name}`,
            selectedSchool,
            userObj.class_name,
            'login',
            `Authenticated successfully and logged into classroom!`
          );
        } catch (logErr) {
          console.warn("Telemetry log for login bypassed:", logErr);
        }
      }

      setSuccess(`Awesome! Verifying credentials... Logged in as ${role.toUpperCase()}: ${userObj.username}`);
      
      setTimeout(() => {
        onAuthSuccess(userObj.username, userObj.id);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact database school gate.");
    } finally {
      setLoading(false);
    }
  };

  // Google Maps Places Autocomplete setup
  const placesLib = useMapsLibrary('places');
  const [sessionToken, setSessionToken] = useState<any>(null);

  useEffect(() => {
    if (!placesLib) return;
    try {
      setSessionToken(new google.maps.places.AutocompleteSessionToken());
    } catch (err) {
      console.warn("Could not instantiate AutocompleteSessionToken:", err);
    }
  }, [placesLib]);

  const handleSchoolQuery = (queryInput: string) => {
    setSearchQuery(queryInput);
    if (!queryInput.trim()) {
      setPredictions([]);
      return;
    }

    if (placesLib) {
      try {
        const autocompleteService = new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions({
          input: queryInput,
          types: ['school', 'establishment'],
          sessionToken: sessionToken || undefined
        }, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results.map(r => ({
              id: r.place_id,
              name: r.structured_formatting.main_text,
              address: r.structured_formatting.secondary_text || r.description,
              isRealGooglePlace: true
            })));
          } else {
            fallbackLocalSearch(queryInput);
          }
        });
      } catch (err) {
        console.warn("Google Place Predictions query failed, using mock list:", err);
        fallbackLocalSearch(queryInput);
      }
    } else {
      fallbackLocalSearch(queryInput);
    }
  };

  const fallbackLocalSearch = (queryInput: string) => {
    const defaultSuggestions = [
      { id: 'jesse_academy', name: 'Jesse Math Academy', address: 'Westminster, London, UK' },
      { id: 'sunset_rockstar', name: 'Sunset Rockstar School', address: 'Los Angeles, California, USA' },
      { id: 'lincoln_high', name: 'Lincoln High School', address: 'Boston, Massachusetts, USA' },
      { id: 'oakwood_primary', name: 'Oakwood Primary School', address: 'Manchester, UK' }
    ];
    const filtered = defaultSuggestions.filter(item => item.name.toLowerCase().includes(queryInput.toLowerCase()));
    
    // Always append option to self-register
    const results: any[] = [...filtered];
    if (queryInput.trim().length >= 3 && !filtered.some(f => f.name.toLowerCase() === queryInput.toLowerCase())) {
      results.push({
        id: `custom_${Date.now()}`,
        name: queryInput.trim(),
        address: '✨ Click to register as an active school',
        isNewCustomAddition: true
      });
    }
    setPredictions(results);
  };

  const handleSelectPrediction = async (item: { id: string, name: string, address?: string, isNewCustomAddition?: boolean, isRealGooglePlace?: boolean }) => {
    setSearchQuery(item.name);
    setSelectedSchoolObj(item);
    setPredictions([]);
    setError(null);
    setSuccess(null);

    setLoading(true);
    try {
      await registerSchool(item.id, item.name);
      setSelectedSchool(item.id);
      
      // Attempt displaying center map of Google school location
      if (item.isRealGooglePlace && placesLib) {
        try {
          const service = new google.maps.places.PlacesService(document.createElement('div'));
          service.getDetails({
            placeId: item.id,
            fields: ['geometry']
          }, (placeResult, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && placeResult?.geometry?.location) {
              setSchoolLocation({
                lat: placeResult.geometry.location.lat(),
                lng: placeResult.geometry.location.lng()
              });
            }
          });
        } catch (mErr) {
          console.warn("Could not fetch Google place geometry lat/lng coordinates:", mErr);
        }
      } else {
        setSchoolLocation(null);
      }

      setSuccess(`Success! Selected and registered '${item.name}' system entry.`);
      const list = await fetchAllSchools();
      setSchoolsList(list);
    } catch (err: any) {
      setError("Failed to register school. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedSchool) {
      setError("Please search and select the real-life school you work for first!");
      return;
    }
    if (!teacherNameSignup.trim() || !classSignup.trim() || !teacherUsernameSignup.trim() || !teacherPasswordSignup.trim()) {
      setError("All fields (Teacher Name, Class, Username, and Password) are strictly required!");
      return;
    }

    if (teacherUsernameSignup.includes(' ')) {
      setError("Spaces are not permitted in requested teacher usernames!");
      return;
    }

    setLoading(true);
    try {
      // 1. Create teacher account in Firestore 'teachers' collection
      const teacherId = await addTeacher({
        teacher_name: teacherNameSignup.trim(),
        username: teacherUsernameSignup.trim().toLowerCase(),
        password: teacherPasswordSignup.trim(),
        school_id: selectedSchool,
        assigned_class: classSignup.trim()
      });

      // 2. Select this school and log in immediately!
      const schoolObj = schoolsList.find(s => s.id === selectedSchool);
      const schoolName = schoolObj ? schoolObj.school_name : (selectedSchoolObj?.name || "Your Math School");

      localStorage.setItem('jesse_rock_role', 'teacher');
      localStorage.setItem('jesse_rock_school_id', selectedSchool);
      localStorage.setItem('jesse_rock_school_name', schoolName);
      localStorage.setItem('jesse_rock_class_name', classSignup.trim());
      localStorage.setItem('jesse_rock_real_name', teacherNameSignup.trim());
      localStorage.setItem('jesse_rock_user_id', teacherId);
      localStorage.setItem('jesse_rock_my_username', teacherUsernameSignup.trim().toLowerCase());
      localStorage.setItem('jesse_rock_device_id', teacherId);

      setSuccess(`Congratulations, Teacher ${teacherNameSignup}! Your class platform is now fully synchronized! Redirecting...`);
      
      setTimeout(() => {
        onAuthSuccess(teacherUsernameSignup.trim().toLowerCase(), teacherId);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to register new class teacher profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Please pick a beautiful Math identity!");
      return;
    }

    if (cleanUsername.includes(' ')) {
      setError("Spaces are strictly forbidden in rockstar names! Use alphabets & numbers only.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Name must be at least 3 characters long!");
      return;
    }

    if (cleanUsername.length > 20) {
      setError("Rockstar names cannot exceed 20 characters!");
      return;
    }

    const cleanPassword = password.trim();
    if (!cleanPassword) {
      setError("Please pick a legendary Math Rockstar Password to secure your account!");
      return;
    }

    if (cleanPassword.length < 4) {
      setError("Your secure password must be at least 4 characters long!");
      return;
    }

    setLoading(true);

    try {
      // 1. Retrieve or generate a stable device ID for the session
      let deviceId = localStorage.getItem('jesse_rock_device_id');
      if (!deviceId) {
        deviceId = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem('jesse_rock_device_id', deviceId);
      }
      const uid = deviceId;

      // 2. Check if username is already claimed in Firestore global registry
      const nameDocRef = doc(db, "usernames", cleanUsername.toLowerCase());
      let nameDoc;
      try {
        nameDoc = await getDoc(nameDocRef);
      } catch (err) {
        console.warn("Firestore not reachable or offline - falling back:", err);
      }

      if (nameDoc && nameDoc.exists()) {
        const existingData = nameDoc.data();
        
        // Match secure identity password
        if (existingData.password) {
          if (existingData.password !== cleanPassword) {
            setError(`Security Block: The username "${cleanUsername}" is protected with a Math Rockstar Password. Enter the correct password or pick another name.`);
            setLoading(false);
            return;
          }
        } else {
          // Backward compatibility: secure the old user account with this password
          try {
            await setDoc(nameDocRef, {
              password: cleanPassword
            }, { merge: true });
          } catch (err) {
            console.warn("Failed to set backward-compatible password:", err);
          }
        }

        const correctUid = existingData.uid || uid;
        localStorage.setItem('jesse_rock_device_id', correctUid);
        localStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, correctUid);
        localStorage.setItem('jesse_rock_my_username', existingData.username || cleanUsername);
        
        setSuccess(`Welcome back, ${existingData.username || cleanUsername}! Loading progress...`);
        setTimeout(() => {
          onAuthSuccess(existingData.username || cleanUsername, correctUid);
        }, 1200);
        return;
      }

      // 3. Username is free! Claim it with password protection
      try {
        await setDoc(nameDocRef, {
          uid: uid,
          username: cleanUsername,
          password: cleanPassword,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error("Could not register username on Firestore:", err);
        throw new Error("Failed to reserve legendary username. Please try again!");
      }

      const userProfileRef = doc(db, "users", uid);
      try {
        await setDoc(userProfileRef, {
          uid: uid,
          username: cleanUsername,
          xp: 100,
          streak: 1, 
          coins: 100,
          badges: ["Genius Debut"],
          createdAt: Date.now()
        });
      } catch (err) {
        console.warn("Could not save initial user profile doc, falling back securely:", err);
      }

      // Store identity mapping locally
      localStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, uid);
      localStorage.setItem('jesse_rock_my_username', cleanUsername);

      setSuccess(`Congratulations! Username "${cleanUsername}" is now registered.`);
      setTimeout(() => {
        onAuthSuccess(cleanUsername, uid);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to enter Jesse Rock Math Arena. Check internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden font-sans">
      {/* Dynamic Animated BG Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6"
      >
        {/* Brand/Game Logo */}
        <div className="text-center space-y-2.5">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 12 }}
            className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-violet-500/30 mx-auto cursor-pointer"
          >
            <Trophy className="text-white" size={24} />
          </motion.div>
          
          <h1 className="text-2xl font-display font-black tracking-tight text-white leading-none">
            JESSE ROCK<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 text-xl font-black tracking-widest uppercase">
              MATH ARENA 👑
            </span>
          </h1>
          
          <div className="py-1 px-2 bg-violet-600/10 border border-violet-500/20 text-violet-300 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 justify-center mx-auto">
            <Lock size={10} className="text-violet-400 animate-pulse" /> School & Guest Security Hub
          </div>
        </div>

        {/* Multi-Tab Selector */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 gap-1.5 shadow-md">
          <button
            type="button"
            onClick={() => { setLoginTab('individual'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              loginTab === 'individual'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-pink-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={12} /> Individual
          </button>
          <button
            type="button"
            onClick={() => { setLoginTab('school'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              loginTab === 'school'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-blue-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap size={13} /> School Login
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold rounded-xl flex items-start gap-2"
          >
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-xl flex items-start gap-2"
          >
            <Check size={14} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Tab Content 1: Home/Individual Login */}
        {loginTab === 'individual' ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Legendary Username
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3.5 text-slate-450" />
                <input
                  id="username-entry"
                  type="text"
                  placeholder="GeniusMathMage"
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\s/g, '');
                    setUsername(val);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold placeholder:text-slate-650"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Math Rockstar Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-450" />
                <input
                  id="password-entry"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password or custom pin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold placeholder:text-slate-650"
                  autoComplete="off"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              id="btn-claim-identity"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 mt-1"
            >
              {loading ? "Checking..." : "ENTER THE ARENA ✨"}
            </button>
          </form>
        ) : (
          /* Tab Content 2: Live Managed School Login */
          <div className="space-y-4">
            {/* School Sub-tabs selector */}
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 gap-1.5 shadow-md">
              <button
                type="button"
                onClick={() => { setSchoolSubTab('signin'); setError(null); setSuccess(null); }}
                className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  schoolSubTab === 'signin'
                    ? 'bg-slate-800 text-white border border-white/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn size={11} /> Profile Login
              </button>
              <button
                type="button"
                onClick={() => { setSchoolSubTab('teachersignup'); setError(null); setSuccess(null); }}
                className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  schoolSubTab === 'teachersignup'
                    ? 'bg-slate-800 text-white border border-white/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlusCircle size={11} /> Teacher Register
              </button>
            </div>

            {/* School selection search box (Real-life Google Maps Place query + Register) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block flex items-center justify-between">
                <span>School Autocomplete (Google Maps Search)</span>
                <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">REAL LIFE REGISTERED</span>
              </label>
              
              <div className="relative">
                <MapPin size={13} className="absolute left-3.5 top-3.5 text-slate-450" />
                <input
                  type="text"
                  placeholder="Type school name..."
                  value={searchQuery}
                  onChange={(e) => handleSchoolQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold placeholder:text-slate-650"
                  disabled={loading}
                />

                {predictions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[160px] overflow-y-auto">
                    {predictions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPrediction(p)}
                        className="w-full px-3 py-2.5 hover:bg-white/5 text-left text-xs border-b border-white/5 flex flex-col gap-0.5"
                      >
                        <span className="font-extrabold text-white">{p.name}</span>
                        <span className="text-[9px] text-slate-450 truncate">{p.address}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedSchoolObj && (
                <div className="p-2 py-1.5 bg-[#00d2ff]/5 border border-[#00d2ff]/10 rounded-lg text-[9px] text-slate-400 font-mono text-left space-y-1 flex flex-col">
                  <span>Selected Network: <strong className="text-white">{selectedSchoolObj.name}</strong></span>
                  <span className="truncate text-[8px] text-slate-550">Address: {selectedSchoolObj.address || "Self-Signed Registry Location"}</span>
                </div>
              )}
            </div>

            {/* If Google Maps coordinate is loaded, render a sleek inline map of their building! */}
            {schoolLocation && (
              <div className="w-full h-24 rounded-xl overflow-hidden border border-white/10 relative">
                <Map
                  defaultCenter={schoolLocation}
                  defaultZoom={15}
                  center={schoolLocation}
                  gestureHandling="none"
                  disableDefaultUI={true}
                  mapId="DEMO_MAP_ID"
                >
                  <AdvancedMarker position={schoolLocation}>
                    <Pin background={'#8b5cf6'} glyphColor={'#fff'} borderColor={'#7c3aed'} />
                  </AdvancedMarker>
                </Map>
                <div className="absolute bottom-1 right-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-400 border border-white/5">
                  Building Location Map
                </div>
              </div>
            )}

            {schoolSubTab === 'signin' ? (
              /* Subtab Form A: Member profile sign in */
              <form onSubmit={handleSchoolSubmit} className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block flex items-center justify-between">
                    <span>Target Class Code</span>
                    <span className="text-[9px] text-slate-500 font-mono font-bold">Skip for Admin</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Year 5B"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold placeholder:text-slate-650"
                    autoComplete="off"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Classroom Username
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3.5 text-slate-455" />
                    <input
                      type="text"
                      placeholder="e.g. leo_rockstar"
                      value={schoolUsername}
                      onChange={(e) => setSchoolUsername(e.target.value.replace(/\s/g, ''))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Access Code / PIN
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-455" />
                    <input
                      type={showSchoolPassword ? "text" : "password"}
                      placeholder="e.g. star123"
                      value={schoolPassword}
                      onChange={(e) => setSchoolPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                      autoComplete="off"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSchoolPassword(!showSchoolPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                    >
                      {showSchoolPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-550 hover:to-indigo-550 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 mt-1"
                >
                  {loading ? "Syncing Gate..." : "ENTER PORTAL 🍏"}
                </button>
              </form>
            ) : (
              /* Subtab Form B: Teacher self-registration on-the-fly! */
              <form onSubmit={handleTeacherSignupSubmit} className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Your Teacher Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Jesse"
                    value={teacherNameSignup}
                    onChange={(e) => setTeacherNameSignup(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                    autoComplete="off"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Class You Teach (e.g., Year 5B)
                  </label>
                  <input
                    type="text"
                    placeholder="Year 5B"
                    value={classSignup}
                    onChange={(e) => setClassSignup(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold font-mono"
                    autoComplete="off"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Desired Username
                    </label>
                    <input
                      type="text"
                      placeholder="teacher_jesse"
                      value={teacherUsernameSignup}
                      onChange={(e) => setTeacherUsernameSignup(e.target.value.replace(/\s/g, ''))}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Access Password
                    </label>
                    <input
                      type="password"
                      placeholder="Secret PIN"
                      value={teacherPasswordSignup}
                      onChange={(e) => setTeacherPasswordSignup(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 mt-1"
                >
                  {loading ? "Spinning Ledger..." : "REGISTER & SYNC 🎓"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Navigation Tabs for Terms, Rules */}
        <div className="flex items-center justify-center gap-4 text-[10px] pt-3 border-t border-white/5">
          <button 
            type="button"
            onClick={() => setShowTerms(true)}
            className="text-slate-500 hover:text-violet-400 transition-colors cursor-pointer font-bold tracking-tight inline-flex items-center gap-1"
          >
            <FileText size={11} /> Terms & Policies
          </button>
          <span className="text-slate-800">•</span>
          <button 
            type="button"
            onClick={() => setShowRules(true)}
            className="text-slate-500 hover:text-violet-400 transition-colors cursor-pointer font-bold tracking-tight inline-flex items-center gap-1"
          >
            <BookOpen size={11} /> How It Works & Rules
          </button>
        </div>
      </motion.div>

      {/* OVERLAY MODAL: Terms & Policies */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowTerms(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-400">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Terms & Policies</h3>
                  <p className="text-slate-500 text-xs">Official rules for Jesse Rock Math Arena players</p>
                </div>
              </div>

              <div className="space-y-4 text-slate-300 text-xs leading-relaxed font-sans">
                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400">1. Fair Play Covenant</h4>
                  <p>
                    All math duelists must rely solely on their brainpower. Use of calculators, scripts, or auto-solvers inside the Arena is strictly forbidden. We want to preserve the honor and fun of Jesse Rock.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400">2. Device Identity & Credentials</h4>
                  <p>
                    Since we don't ask you for any secret passwords, your exclusive username is claimed dynamically using secure anonymous Firebase Auth. A tracking record is registered to your device's browser local storage. Cleared storage may require choosing a new unique name if ownership logs are lost.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400">3. Ownership & Trademarks</h4>
                  <p>
                    All Math Arena problems, designs, logic systems, and graphical features are copyright of Jesse Rock Math Arena. Player-authored scores and badges are owned collectively under free game engagement.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400">4. Privacy Guarantee</h4>
                  <p>
                    We value your absolute data safety. We never request private details like your contact numbers, real names, or secret emails. We store solely your public math identity to construct global leaderboard states.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setShowTerms(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Close & Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY MODAL: How It Works & Rules */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-400">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">How It Works & Rules</h3>
                  <p className="text-slate-500 text-xs">Learn how to dominate the leaderboards</p>
                </div>
              </div>

              <div className="space-y-4 text-slate-300 text-xs leading-relaxed font-sans">
                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400 flex items-center gap-1.5">
                    <Activity size={12} /> Real-Time Quick Play Matchmaking
                  </h4>
                  <p>
                    Click <strong>"Find Match"</strong> in the Arena to start searching for active math duelists online. Once an opponent joins, the game starts instantly!
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400 flex items-center gap-1.5">
                    <Crown size={12} /> Objective & Game Scoring
                  </h4>
                  <p>
                    Both players represent themselves against the same math equations. Answer correctly as fast as possible to build multiplier speeds and gain higher progressive points!
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400 flex items-center gap-1.5">
                    <Award size={12} /> Sticking to the Streaks
                  </h4>
                  <p>
                    Winning sequential match duels builds a mighty multiplayer streak factor. If you exit or give a wrong response sheet, the streak resets to zero. Keep your active focus!
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-violet-400 flex items-center gap-1.5">
                    <Sparkles size={12} /> Levelling Up & Elite Badges
                  </h4>
                  <p>
                    Earning math XP expands your level rank. Build the ultimate trophy wall by unlocking elite badges like the <strong>Genius Debut</strong> to confirm your intellectual supremacy.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setShowRules(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Got It, Let's Play!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
