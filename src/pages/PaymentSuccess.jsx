import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, User, BookOpen } from 'lucide-react'
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { fetchPackageCommission, fetchPackageCommissionUnowned, checkUserPurchase } from '@/lib/utils';

function PaymentSuccess() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [packageData, setPackageData] = useState(null)
  const [referrerCommission, setReferrerCommission] = useState(0)

  // Function to create purchase record in Firestore and handle referral commissions
  const createPurchaseRecord = async (packageData, user) => {
    if (!user || !user.uid) throw new Error("User not authenticated");
    
    // Validate packageData
    if (!packageData || !packageData.id) {
      throw new Error("Invalid package data");
    }
    
    // Get referral code from session storage
    const referralCode = sessionStorage.getItem('referralCode') || '';
    
    // Handle referral commission if referral code was provided
    let commissionEarned = 0;
    let referrerUid = null;
    let commissionType = ""; // "owned" or "unowned"
    
    if (referralCode) {
      try {
        // Find referrer by referral code
        const referrerQuery = query(collection(db, "students"), where("referral_code", "==", referralCode));
        const referrerSnapshot = await getDocs(referrerQuery);
        
        if (!referrerSnapshot.empty) {
          const referrerDoc = referrerSnapshot.docs[0];
          const referrerData = referrerDoc.data();
          const referrerRef = referrerDoc.ref;
          referrerUid = referrerDoc.id;
          
          // Check if referrer has purchased the same package
          const hasPurchasedSamePackage = await checkUserPurchase(packageData.id, referrerUid);
          
          if (hasPurchasedSamePackage) {
            // Referrer has purchased the same package - use owned commission
            commissionType = "owned";
            const referrerCommission = await fetchPackageCommission(packageData.id);
            
            if (referrerCommission > 0) {
              // Update referrer's wallet balance and total earned
              await updateDoc(referrerRef, {
                wallet_balance: increment(referrerCommission),
                total_earned: increment(referrerCommission),
              });
              
              commissionEarned = referrerCommission;
              setReferrerCommission(referrerCommission);
              
              console.log(`Referrer ${referrerData.name} earned owned commission: ₹${referrerCommission}`);
            }
          } else {
            // Referrer has not purchased the same package - use unowned commission
            commissionType = "unowned";
            const referrerCommission = await fetchPackageCommissionUnowned(packageData.id);
            
            if (referrerCommission > 0) {
              // Update referrer's wallet balance and total earned
              await updateDoc(referrerRef, {
                wallet_balance: increment(referrerCommission),
                total_earned: increment(referrerCommission),
              });
              
              commissionEarned = referrerCommission;
              setReferrerCommission(referrerCommission);
              
              console.log(`Referrer ${referrerData.name} earned unowned commission: ₹${referrerCommission}`);
            }
          }
        }
      } catch (err) {
        console.error('Error processing referral commission:', err);
        // Don't fail the purchase if referral processing fails
      }
    }
    
    // Create purchase record in Firestore with all necessary referral and commission details
    const purchaseData = {
      student_uid: user.uid,
      package_id: packageData.id,
      package_name: packageData.name || packageData.title || "",
      amount: packageData.price || 0,
      payment_status: "success",
      purchase_date: serverTimestamp(),
      referral_code: referralCode || "",
      referred_by: referrerUid || "",
      commission_type: commissionType,
      commission: commissionEarned
    };
    
    console.log('Creating purchase record for package:', packageData.id, 'user:', user.uid, 'data:', purchaseData);
    
    const purchaseDocRef = await addDoc(collection(db, "purchases"), purchaseData);
    console.log('Purchase record created with ID:', purchaseDocRef.id);
    
    // Update buyer's student document with purchased package
    const studentRef = doc(db, "students", user.uid);
    await updateDoc(studentRef, {
      purchased_package: packageData.id,
    });
    
    // Update buyer's document with who referred them if referral code was provided
    if (referralCode && referrerUid) {
      await updateDoc(studentRef, {
        referred_by: referralCode,
        referrer_uid: referrerUid
      });
    }
    
    // Store purchase info in localStorage to trigger UI updates
    localStorage.setItem('lastPurchase', JSON.stringify({
      packageId: packageData.id,
      userId: user.uid,
      timestamp: Date.now(),
      referrerCommission: commissionEarned
    }));
    
    return purchaseDocRef.id;
  };

  useEffect(() => {
    // Process payment and create purchase record
    const processPayment = async () => {
      try {
        // Get user from localStorage (since we don't have AuthContext here)
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        if (!user) {
          throw new Error("User not found");
        }
        
        // Get package data from session storage
        const storedPackage = sessionStorage.getItem('checkoutPackage');
        console.log('Stored package for purchase record:', storedPackage);
        
        if (storedPackage) {
          const packageData = JSON.parse(storedPackage);
          console.log('Parsed package data:', packageData);
          setPackageData(packageData);
          
          // Create purchase record in Firestore
          await createPurchaseRecord(packageData, user);
          console.log('Purchase record created successfully for package:', packageData.id);
        } else {
          console.warn('No package data found in session storage for purchase record');
        }
        
        // Clear session storage after successful processing
        sessionStorage.removeItem('checkoutPackage')
        sessionStorage.removeItem('referralCode')
        
        // Set loading to false to show success UI
        setIsLoading(false)
      } catch (err) {
        console.error('Error in payment success processing:', err)
        setError(err.message || 'An error occurred while processing your payment')
        setIsLoading(false)
      }
    }
    
    console.log('PaymentSuccess component loaded');
    processPayment()
  }, [])

  const handleViewCourse = () => {
    // Redirect to the package courses page
    if (packageData && packageData.id) {
      navigate(`/packages/${packageData.id}/courses`);
    } else {
      // Fallback to dashboard
      navigate('/dashboard');
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  // Show loading state while processing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <Card className="w-full max-w-md border-2 border-blue-300 shadow-2xl">
            <CardHeader>
              <div className="mx-auto bg-blue-100 rounded-full p-3 mb-4">
                <CheckCircle className="h-12 w-12 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-3xl font-black text-blue-600 text-center">Processing...</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Please wait while we finalize your purchase and unlock your course access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-center">
                    Setting up your course access...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <Card className="w-full max-w-md border-2 border-red-300 shadow-2xl">
            <CardHeader>
              <div className="mx-auto bg-red-100 rounded-full p-3 mb-4">
                <CheckCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-3xl font-black text-red-600 text-center">Processing Error</CardTitle>
              <CardDescription className="text-center text-gray-600">
                There was an issue processing your payment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800">
                    {error}
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 mt-6">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleViewCourse}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoHome}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="text-center">
        <Card className="w-full max-w-md border-2 border-green-300 shadow-2xl">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-black text-green-600 text-center">Payment Successful!</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Thank you for your purchase. Your payment has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800">
                  <span className="font-semibold">Order ID:</span> #{'ORDER' + Date.now()}
                </p>
                <p className="text-green-800 mt-2">
                  Your course access has been unlocked! You can now view your courses.
                </p>
                {referrerCommission > 0 && (
                  <p className="text-green-800 mt-2">
                    Your referrer has received ₹{referrerCommission} as commission.
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-3 mt-6">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleViewCourse}
                >
                  <User className="h-4 w-4 mr-2" />
                  View My Courses
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoHome}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PaymentSuccess