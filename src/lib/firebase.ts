import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9osCI680YaE-HFoj-g8OuA63iVpJjaNM",
  authDomain: "silver-linker-scf5x.firebaseapp.com",
  projectId: "silver-linker-scf5x",
  storageBucket: "silver-linker-scf5x.firebasestorage.app",
  messagingSenderId: "483318254290",
  appId: "1:483318254290:web:a78237bdcc85fb05433b0b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, "ai-studio-fdec55b7-ba82-44d4-ae95-0c5de616e19f");

export { app, auth, db };
