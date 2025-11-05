import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const provider = new GoogleAuthProvider();

const Login = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoogleLogin = async () => {
    // Check if name input is not empty
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      console.log("User logging in with Google...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google login successful, creating student record...");
      // Create student document with user info
      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        name: name, // Use the name from input field
        email: user.email,
        createdAt: serverTimestamp(),
        referral_codes: {} // Initialize empty referral codes object
      });
      console.log("Student document created successfully.");

      // Check if user was trying to purchase a package
      const storedPackage = sessionStorage.getItem('checkoutPackage');
      if (storedPackage) {
        // If so, redirect to checkout instead of dashboard
        console.log('User had a package in cart, redirecting to checkout');
        navigate("/checkout");
      } else {
        // Redirect to dashboard after successful login
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert(`Failed to sign in with Google: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, redirect appropriately
  React.useEffect(() => {
    if (user) {
      // Check if user was trying to purchase a package
      const storedPackage = sessionStorage.getItem('checkoutPackage');
      if (storedPackage) {
        // If so, redirect to checkout instead of dashboard
        console.log('User is already logged in and had a package in cart, redirecting to checkout');
        navigate("/checkout");
      } else {
        // Redirect to dashboard
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black text-blue-600">Welcome</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-red-600 text-white hover:bg-red-700 font-bold text-lg py-6"
            size="lg"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;