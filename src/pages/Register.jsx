import React, { useState } from "react";
import { db, auth } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    state: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.mobile || !formData.state) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const user = auth.currentUser;

      if (user) {
        await setDoc(doc(db, "students", user.uid), {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          state: formData.state,
          uid: user.uid,
          createdAt: serverTimestamp(),
        });
      } else {
        console.error("User not authenticated");
      }

      alert("✅ Registration successful!");
      setFormData({ name: "", email: "", mobile: "", state: "" });
      // Redirect to dashboard after successful registration
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving user:", error);
      alert("❌ Error saving user. Check console.");
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
          <CardTitle className="text-3xl font-black text-blue-600">Create Account</CardTitle>
          <CardDescription className="text-gray-600">
            Join YouthPargati to start your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="text"
                name="state"
                placeholder="Your State"
                value={formData.state}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-lg py-6"
              size="lg"
            >
              Register
            </Button>
          </form>
          
          <div className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;