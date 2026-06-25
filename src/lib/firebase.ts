import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: (process.env.VITE_FIREBASE_API_KEY as string) || "AIzaSyC9osCI680YaE-HFoj-g8OuA63iVpJjaNM",
  authDomain: (process.env.VITE_FIREBASE_AUTH_DOMAIN as string) || "silver-linker-scf5x.firebaseapp.com",
  projectId: (process.env.VITE_FIREBASE_PROJECT_ID as string) || "silver-linker-scf5x",
  storageBucket: (process.env.VITE_FIREBASE_STORAGE_BUCKET as string) || "silver-linker-scf5x.firebasestorage.app",
  messagingSenderId: (process.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || "483318254290",
  appId: (process.env.VITE_FIREBASE_APP_ID as string) || "1:483318254290:web:a78237bdcc85fb05433b0b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const dbId = (process.env.VITE_FIREBASE_DATABASE_ID as string) || "ai-studio-fdec55b7-ba82-44d4-ae95-0c5de616e19f";
const db = initializeFirestore(app, {}, dbId);

export { app, auth, db };
