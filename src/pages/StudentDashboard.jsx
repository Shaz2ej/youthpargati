import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { fetchUserPurchases, fetchPackageById } from '@/lib/utils.js';

export default function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [packages, setPackages] = useState([]);
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
        
        // Check if profile is already completed
        if (data.mobile_number && data.state) {
          setProfileCompleted(true);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  // Fetch user purchases and package details
  useEffect(() => {
    const fetchPurchasesAndPackages = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch user purchases
        const userPurchases = await fetchUserPurchases(user.uid);
        setPurchases(userPurchases);

        // Fetch package details for each purchase
        const packagePromises = userPurchases.map(purchase => {
          // Validate package_id before fetching
          if (!purchase.package_id) {
            console.warn('Missing package_id in purchase:', purchase);
            return Promise.resolve(null);
          }
          console.log('Fetching package details for purchase:', purchase.id, 'package_id:', purchase.package_id);
          return fetchPackageById(purchase.package_id);
        });
        
        const packageResults = await Promise.all(packagePromises);
        // Filter out any null results and create a map of package details
        const packageMap = {};
        packageResults.forEach((pkg, index) => {
          if (pkg) {
            const packageId = userPurchases[index].package_id;
            if (packageId) {
              console.log('Mapping package details for package:', packageId);
              packageMap[packageId] = pkg;
            } else {
              console.warn('Missing package_id for purchase at index:', index);
            }
          }
        });
        
        setPackages(packageMap);
        console.log('Final package map:', packageMap);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      }
    };

    if (profileCompleted) {
      fetchPurchasesAndPackages();
    }
  }, [profileCompleted]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "students", user.uid);
    await updateDoc(docRef, {
      mobile_number: mobile,
      state: state,
    });

    // Update local state
    const updatedUserData = { ...userData, mobile_number: mobile, state: state };
    setUserData(updatedUserData);
    
    // Check if both fields are now present and set profileCompleted to true
    if (mobile && state) {
      setProfileCompleted(true);
    }
    
    alert("Profile updated successfully!");
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-center mb-8 text-blue-600">
          Welcome, {userData?.name || "Student"} 👋
        </h1>

        {(!profileCompleted) ? (
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
          <div className="space-y-8">
            <Card className="bg-white shadow-2xl border rounded-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-black text-blue-600">Your Profile</CardTitle>
                <CardDescription className="text-gray-600">
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="font-semibold">{userData?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="font-semibold">{userData?.email || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-600">Mobile:</span>
                  <span className="font-semibold">{userData?.mobile_number || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-600">State:</span>
                  <span className="font-semibold">{userData?.state || "N/A"}</span>
                </div>
                <div className="pt-4 text-center text-sm text-gray-500">
                  <p>You'll earn commission based on your current package level, regardless of which package the referred person buys.</p>
                </div>
              </CardContent>
            </Card>

            {/* Purchased Packages Section */}
            <Card className="bg-white shadow-2xl border rounded-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-black text-blue-600">Your Courses</CardTitle>
                <CardDescription className="text-gray-600">
                  Courses you've purchased
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't purchased any courses yet.</p>
                    <Button 
                      onClick={() => navigate('/')} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {purchases.map((purchase) => {
                      // Validate package_id before accessing packages
                      if (!purchase.package_id) {
                        console.warn('Missing package_id in purchase for rendering:', purchase);
                        return null;
                      }
                      
                      const pkg = packages[purchase.package_id];
                      console.log('Rendering purchase:', purchase.id, 'package_id:', purchase.package_id, 'package exists:', !!pkg);
                      
                      return pkg ? (
                        <Card key={purchase.id} className="border-2 border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-blue-600">
                              {pkg.title}
                            </CardTitle>
                            <CardDescription>
                              {pkg.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-semibold text-green-600">Purchased</span>
                              <span className="text-sm text-gray-500">
                                {purchase.purchase_date?.toDate ? 
                                  purchase.purchase_date.toDate().toLocaleDateString() : 
                                  'Date unknown'}
                              </span>
                            </div>
                            <Button 
                              onClick={() => {
                                console.log('Navigating to package courses for package:', purchase.package_id);
                                navigate(`/packages/${purchase.package_id}/courses`);
                              }}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              View Course
                            </Button>
                          </CardContent>
                        </Card>
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}