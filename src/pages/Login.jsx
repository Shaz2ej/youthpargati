import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const provider = new GoogleAuthProvider();

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log("User logged in with Google, checking Firestore record...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user data exists in Firestore
      const userRef = doc(db, "students", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("Student data loaded successfully.");
        console.log("Welcome back:", userSnap.data());
      } else {
        console.log("No record found, creating new student document.");
        // Create new student document with user info
        await setDoc(doc(db, "students", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
        });
        console.log("New student document created successfully.");
      }

      // Redirect to dashboard after successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      alert(`Failed to sign in with Google: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black text-blue-600">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-red-600 text-white hover:bg-red-700 font-bold text-lg py-6"
            size="lg"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;