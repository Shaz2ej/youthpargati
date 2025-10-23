import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        console.log("User logged in:", user);
        // Redirect to dashboard after successful login
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      alert("Failed to sign in with Google. Please try again.");
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
            className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-lg py-6"
            size="lg"
          >
            Sign in with Google
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline font-medium"
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