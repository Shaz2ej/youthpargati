import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByK3AqqZ4uwpcPY_2iEV9riZ4xxXuPASU",
  authDomain: "youthpargati-e975a.firebaseapp.com",
  projectId: "youthpargati-e975a",
  storageBucket: "youthpargati-e975a.firebasestorage.app",
  messagingSenderId: "733396374495",
  appId: "1:733396374495:web:e2212b96372633dd296a6a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Google Login
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-in Error:", error);
  }
};

// ✅ Logout
export const logout = async () => {
  await signOut(auth);
};