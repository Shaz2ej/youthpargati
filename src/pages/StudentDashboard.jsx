import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';

export default function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        // If no user, redirect to login
        navigate('/login');
        return;
      }

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
  }, [navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-center mb-8 text-blue-600">
          Welcome, {userData?.name || "Student"} 👋
        </h1>

        {(!userData?.mobile_number || !userData?.state) ? (
          <Card className="bg-white shadow-2xl border rounded-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black text-blue-600">Complete Your Profile</CardTitle>
              <CardDescription className="text-gray-600">
                Please fill in your details to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-lg py-6"
                size="lg"
              >
                Save Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-2xl border rounded-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black text-blue-600">Your Profile</CardTitle>
              <CardDescription className="text-gray-600">
                Your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-gray-600">Mobile:</span>
                <span className="font-semibold">{userData.mobile_number}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-gray-600">State:</span>
                <span className="font-semibold">{userData.state}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}