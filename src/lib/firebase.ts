import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "silver-linker-scf5x",
  appId: "1:483318254290:web:a78237bdcc85fb05433b0b",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC9osCI680YaE-HFoj-g8OuA63iVpJjaNM", 
  authDomain: "silver-linker-scf5x.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-fdec55b7-ba82-44d4-ae95-0c5de616e19f",
  storageBucket: "silver-linker-scf5x.firebasestorage.app",
  messagingSenderId: "483318254290"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const dbId = (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || "ai-studio-fdec55b7-ba82-44d4-ae95-0c5de616e19f";
const db = initializeFirestore(app, {}, dbId);

export { app, auth, db };
