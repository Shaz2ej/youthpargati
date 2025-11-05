import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { fetchPackages, fetchUserPurchases } from '@/lib/utils.js';
import { Loader2, Copy, Share2 } from 'lucide-react';

export default function ReferralDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [purchasedPackages, setPurchasedPackages] = useState([]);
  const [otherPackages, setOtherPackages] = useState([]);
  const [referralCodes, setReferralCodes] = useState({});
  const navigate = useNavigate();

  // Generate referral code for a user and package
  const generateReferralCode = (userName, packageName) => {
    // Extract first part of username (max 6 characters)
    const userPart = userName.split(' ')[0].substring(0, 6).toUpperCase();
    
    // Extract first part of package name (max 10 characters)
    const packagePart = packageName.replace(/\s+/g, '_').substring(0, 10).toUpperCase();
    
    // Generate random 4-digit number
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    
    return `${userPart}-${packagePart}-${randomNumber}`;
  };

  // Initialize referral codes for all packages
  const initializeReferralCodes = async (user, allPackages) => {
    const userRef = doc(db, "students", user.uid);
    const userDoc = await getDoc(userRef);
    
    let userData = {};
    let updatedReferralCodes = {};
    
    if (userDoc.exists()) {
      userData = userDoc.data();
      updatedReferralCodes = userData.referral_codes || {};
    }
    
    // Generate referral codes for all packages if not already present
    let needsUpdate = false;
    allPackages.forEach(pkg => {
      const codeKey = `${pkg.id}_code`;
      if (!updatedReferralCodes[codeKey]) {
        updatedReferralCodes[codeKey] = generateReferralCode(user.displayName || userData.name || "USER", pkg.title || pkg.name || pkg.id);
        needsUpdate = true;
      }
    });
    
    // Update Firestore with referral codes if needed
    if (needsUpdate) {
      await updateDoc(userRef, {
        referral_codes: updatedReferralCodes
      });
    }
    
    return updatedReferralCodes;
  };

  // Copy referral code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
    alert(`Referral code ${code} copied to clipboard!`);
  };

  // Share referral code via social media
  const shareReferralCode = (code, packageName) => {
    const message = `Join me in learning ${packageName}! Use my referral code: ${code}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAndInitialize = async () => {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "students", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Fetch all packages
        const allPackages = await fetchPackages();
        setPackages(allPackages);

        // Fetch user purchases
        const userPurchases = await fetchUserPurchases(user.uid);
        const purchasedPackageIds = userPurchases.map(purchase => purchase.package_id);
        setPurchasedPackages(allPackages.filter(pkg => purchasedPackageIds.includes(pkg.id)));
        setOtherPackages(allPackages.filter(pkg => !purchasedPackageIds.includes(pkg.id)));

        // Initialize referral codes
        const codes = await initializeReferralCodes(user, allPackages);
        setReferralCodes(codes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndInitialize();

    // Listen for changes in purchases
    const unsubscribe = onSnapshot(
      query(collection(db, "purchases"), where("student_uid", "==", user.uid)),
      () => {
        // Re-fetch data when purchases change
        fetchAndInitialize();
      }
    );

    // Listen for changes in user data
    const unsubscribeUser = onSnapshot(
      doc(db, "students", user.uid),
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
      }
    );

    // Cleanup listeners
    return () => {
      unsubscribe();
      unsubscribeUser();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading referral dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-center mb-8 text-blue-600">
          Referral Dashboard
        </h1>

        {/* Your Purchased Packages Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
            Your Purchased Packages
          </h2>
          
          {purchasedPackages.length === 0 ? (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">You haven't purchased any packages yet.</p>
                <Button 
                  onClick={() => navigate('/')} 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Browse Packages
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedPackages.map((pkg) => (
                <Card key={pkg.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-blue-600">
                      {pkg.title || pkg.name}
                    </CardTitle>
                    <CardDescription>
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Referral Code:</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {referralCodes[`${pkg.id}_code`] || "Generating..."}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(referralCodes[`${pkg.id}_code`])}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        onClick={() => shareReferralCode(referralCodes[`${pkg.id}_code`], pkg.title || pkg.name)}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Other Packages Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-orange-500">
            Other Packages
          </h2>
          <p className="text-gray-600 mb-6 italic">
            These are referral codes for packages you haven't purchased yet.
          </p>
          
          {otherPackages.length === 0 ? (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">You've purchased all available packages!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPackages.map((pkg) => (
                <Card key={pkg.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-orange-600">
                      {pkg.title || pkg.name}
                    </CardTitle>
                    <CardDescription>
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Referral Code:</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {referralCodes[`${pkg.id}_code`] || "Generating..."}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(referralCodes[`${pkg.id}_code`])}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        onClick={() => shareReferralCode(referralCodes[`${pkg.id}_code`], pkg.title || pkg.name)}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}