import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Wallet, 
  Users, 
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  Home
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext.jsx'
import { useNavigate, Link } from 'react-router-dom'

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "students", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setMobile(data.mobile_number || "");
        setState(data.state || "");
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "students", user.uid);
    await updateDoc(docRef, {
      mobile_number: mobile,
      state: state,
    });

    setUserData({ ...userData, mobile_number: mobile, state: state });
    alert("Profile updated successfully!");
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {userData?.name || "Student"} 👋
      </h1>

      {(!userData?.mobile_number || !userData?.state) ? (
        <div className="space-y-4">
          <p className="text-gray-600">Please complete your profile:</p>
          <input
            type="text"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="border p-2 rounded w-full max-w-sm"
          />
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border p-2 rounded w-full max-w-sm"
          />
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      ) : (
        <div>
          <p><strong>Mobile:</strong> {userData.mobile_number}</p>
          <p><strong>State:</strong> {userData.state}</p>
        </div>
      )}
    </div>
  );
}
