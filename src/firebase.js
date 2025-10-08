import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyCdCPlWV7YaiXwvxkcSk8bTkWbqC0SJOWI",
  authDomain: "login-register-746b8.firebaseapp.com",
  projectId: "login-register-746b8",
  storageBucket: "login-register-746b8.firebasestorage.app",
  messagingSenderId: "778956685525",
  appId: "1:778956685525:web:d279c84c761ea267c3a25c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;


