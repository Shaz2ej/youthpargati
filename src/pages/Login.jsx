import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const provider = new GoogleAuthProvider();

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      console.log("User logging in with email, checking credentials...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Email login successful, checking Firestore record...");
      // Check if user data exists in Firestore
      const userRef = doc(db, "students", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("Student data loaded successfully.");
        console.log("Welcome back:", userSnap.data());
      } else {
        console.log("No record found for this user.");
        alert("User record not found. Please contact support.");
      }

      // Redirect to dashboard after successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Email login error:", error);
      alert(`Login failed: ${error.message}`);
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-lg py-6"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with Email"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline font-medium"
              disabled={loading}
            >
              Register now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;