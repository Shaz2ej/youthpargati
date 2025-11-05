import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx';
import { Label } from '@/components/ui/label.jsx';
import { fetchUserPurchases, fetchPackageById } from '@/lib/utils.js';

export default function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [packages, setPackages] = useState([]);
  const [walletData, setWalletData] = useState({
    wallet_balance: 0,
    total_earned: 0,
    day1_earning: 0,
    day10_earning: 0,
    day20_earning: 0,
    day30_earning: 0,
    referral_code: "",
    referred_by: "",
    purchased_package: ""
  });
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
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
        
        // Set wallet and referral data
        setWalletData({
          wallet_balance: data.wallet_balance || 0,
          total_earned: data.total_earned || 0,
          day1_earning: data.day1_earning || 0,
          day10_earning: data.day10_earning || 0,
          day20_earning: data.day20_earning || 0,
          day30_earning: data.day30_earning || 0,
          referral_code: data.referral_code || "",
          referred_by: data.referred_by || "",
          purchased_package: data.purchased_package || ""
        });
        
        // Check if profile is already completed
        if (data.mobile_number && data.state) {
          setProfileCompleted(true);
          
          // Generate referral code if not present
          if (!data.referral_code) {
            await generateReferralCode(user.uid, data);
          }
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  // Generate referral code for user
  const generateReferralCode = async (uid, userData) => {
    // Generate a unique referral code based on user name and random numbers
    const baseName = userData.name.split(' ')[0].toUpperCase().substring(0, 4);
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const referralCode = `${baseName}${randomNumber}`;
    
    // Update Firestore with the referral code
    const docRef = doc(db, "students", uid);
    await updateDoc(docRef, {
      referral_code: referralCode
    });
    
    // Update local state
    setWalletData(prev => ({
      ...prev,
      referral_code: referralCode
    }));
    
    return referralCode;
  };

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
      
      // Generate referral code if not present
      if (!walletData.referral_code) {
        await generateReferralCode(user.uid, { ...updatedUserData, mobile_number: mobile, state });
      }
    }
    
    alert("Profile updated successfully!");
  };

  // Handle withdrawal request submission
  const handleWithdrawalSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Validation
    if (walletData.wallet_balance < 200) {
      alert("Minimum balance of ₹200 required for withdrawal.");
      return;
    }

    if (withdrawalMethod === "UPI" && !upiId.trim()) {
      alert("Please enter your UPI ID.");
      return;
    }

    if (withdrawalMethod === "BANK" && (!accountNumber.trim() || !ifscCode.trim())) {
      alert("Please enter both Account Number and IFSC Code.");
      return;
    }

    setWithdrawalLoading(true);

    try {
      // Create withdrawal request document
      const withdrawalData = {
        student_uid: user.uid,
        amount: walletData.wallet_balance,
        payment_method: withdrawalMethod,
        status: "pending",
        requestedAt: serverTimestamp()
      };

      if (withdrawalMethod === "UPI") {
        withdrawalData.upi_id = upiId.trim();
      } else {
        withdrawalData.account_number = accountNumber.trim();
        withdrawalData.ifsc_code = ifscCode.trim().toUpperCase();
      }

      // Add to withdraw_requests collection
      await addDoc(collection(db, "withdraw_requests"), withdrawalData);

      // Reset wallet balance to 0
      const docRef = doc(db, "students", user.uid);
      await updateDoc(docRef, {
        wallet_balance: 0
      });

      // Update local state
      setWalletData(prev => ({
        ...prev,
        wallet_balance: 0
      }));

      // Reset form and close dialog
      setUpiId("");
      setAccountNumber("");
      setIfscCode("");
      setShowWithdrawalForm(false);
      
      alert("Withdrawal request submitted successfully!");
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      alert("Error submitting withdrawal request. Please try again.");
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Copy referral code to clipboard
  const copyReferralCode = () => {
    navigator.clipboard.writeText(walletData.referral_code);
    alert("Referral code copied to clipboard!");
  };

  // Share referral code via WhatsApp
  const shareViaWhatsApp = () => {
    const message = `Join this course and earn with my referral code ${walletData.referral_code}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
            {/* Wallet and Earnings Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Day 1 Earnings</p>
                      <p className="text-2xl font-bold">₹{walletData.day1_earning}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Day 10 Earnings</p>
                      <p className="text-2xl font-bold">₹{walletData.day10_earning}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Day 20 Earnings</p>
                      <p className="text-2xl font-bold">₹{walletData.day20_earning}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Day 30 Earnings</p>
                      <p className="text-2xl font-bold">₹{walletData.day30_earning}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white md:col-span-2 lg:col-span-1">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Wallet Balance</p>
                      <p className="text-2xl font-bold">₹{walletData.wallet_balance}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white md:col-span-2 lg:col-span-3">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Total Earned</p>
                      <p className="text-2xl font-bold">₹{walletData.total_earned}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Dialog open={showWithdrawalForm} onOpenChange={setShowWithdrawalForm}>
                        <DialogTrigger asChild>
                          <Button 
                            className="bg-white text-indigo-600 hover:bg-white/90 font-bold"
                            disabled={walletData.wallet_balance < 200}
                          >
                            Withdraw Earnings
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Withdraw Earnings</DialogTitle>
                            <DialogDescription>
                              Request withdrawal for ₹{walletData.wallet_balance}. Minimum withdrawal amount is ₹200.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="method" className="text-right">
                                Method
                              </Label>
                              <RadioGroup 
                                value={withdrawalMethod} 
                                onValueChange={setWithdrawalMethod}
                                className="col-span-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="UPI" id="UPI" />
                                  <Label htmlFor="UPI">UPI</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="BANK" id="BANK" />
                                  <Label htmlFor="BANK">Bank Account</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            
                            {withdrawalMethod === "UPI" ? (
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="upi" className="text-right">
                                  UPI ID
                                </Label>
                                <Input
                                  id="upi"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  className="col-span-3"
                                  placeholder="yourname@upi"
                                />
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="account" className="text-right">
                                    Account No.
                                  </Label>
                                  <Input
                                    id="account"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Bank account number"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="ifsc" className="text-right">
                                    IFSC Code
                                  </Label>
                                  <Input
                                    id="ifsc"
                                    value={ifscCode}
                                    onChange={(e) => setIfscCode(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Bank IFSC code"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={handleWithdrawalSubmit} 
                              disabled={withdrawalLoading}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              {withdrawalLoading ? "Processing..." : "Submit Request"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Section */}
            <Card className="bg-white shadow-2xl border rounded-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-black text-blue-600">Referral Program</CardTitle>
                <CardDescription className="text-gray-600">
                  Share your referral code and earn commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Your Referral Code</p>
                    <p className="text-xl font-bold text-blue-600">{walletData.referral_code}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyReferralCode} variant="outline">
                      Copy Code
                    </Button>
                    <Button onClick={shareViaWhatsApp} className="bg-green-600 hover:bg-green-700">
                      Share via WhatsApp
                    </Button>
                  </div>
                </div>
                
                {walletData.referred_by && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Referred By</p>
                    <p className="font-medium">{walletData.referred_by}</p>
                  </div>
                )}
                
                {walletData.purchased_package && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Your Package</p>
                    <p className="font-medium capitalize">{walletData.purchased_package}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Section */}
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