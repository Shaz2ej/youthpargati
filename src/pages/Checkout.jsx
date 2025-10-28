import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { useNavigate } from 'react-router-dom'
import { handlePackagePayment } from '@/lib/payment.js'
import { useAuth } from '@/context/AuthContext.jsx'
import { Home, User, CreditCard } from 'lucide-react'

function Checkout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [packageData, setPackageData] = useState(null)
  const [referralCode, setReferralCode] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('Checkout page loaded');
    // Get package data from session storage
    const storedPackage = sessionStorage.getItem('checkoutPackage')
    const storedReferralCode = sessionStorage.getItem('referralCode')
    
    console.log('Stored package:', storedPackage);
    console.log('Stored referral code:', storedReferralCode);
    
    if (storedPackage) {
      setPackageData(JSON.parse(storedPackage))
    }
    
    if (storedReferralCode) {
      setReferralCode(storedReferralCode)
    }
    
    // NOTE: Don't clear session storage here - it should persist until payment is complete
    // The session storage will be cleared in PaymentSuccess.jsx after successful processing
  }, [])

  const handleProcessPayment = async () => {
    console.log('Checkout: handleProcessPayment called');
    console.log('Checkout: Current user state', user);
    console.log('Checkout: Current auth context', { user, loading });
    console.log('Checkout: Package data:', packageData);
    console.log('Checkout: Referral code:', referralCode);
    
    // More robust check - wait for auth state to be fully loaded
    if (loading) {
      console.warn('Purchase attempt blocked: Auth state still loading');
      setError('Please wait, still loading user session...');
      return;
    }
    
    // Robust check at the very beginning of the handler
    if (!user) {
      console.warn('Purchase attempt blocked: No user object');
      console.log('Checkout: User check failed. User:', user);
      setError('Please log in to purchase courses.')
      return
    }
    
    // Fix: Use user.uid instead of user.id for Firebase user objects
    if (!user.uid) {
      console.warn('Purchase attempt blocked: User ID not available');
      console.log('Checkout: User ID check failed. User:', user);
      setError('Please log in to purchase courses.')
      return
    }
    
    console.log('Checkout: User authenticated', user.uid);
    
    // Small delay to ensure auth state is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!packageData) {
      setError('Package data not found')
      return
    }
    
    setProcessing(true)
    setError('')
    
    try {
      console.log('Checkout: Processing payment for user', user.uid);
      
      // Create mock student data since we're not using Supabase
      const studentData = {
        name: user.user_metadata?.name || 'Student',
        phone: user.user_metadata?.phone || ''
      };
      
      console.log('User data retrieved:', studentData);
      
      // Process payment with referral code if provided
      const result = await handlePackagePayment(packageData, {  // Fixed: was packageInfo
        uid: user.uid,  // Fix: Use user.uid instead of user.id
        name: studentData.name,
        phone: studentData.phone
      }, referralCode)
      
      console.log('Payment result:', result);
      
      // If there's an error in the result, show it to the user
      if (result && !result.status) {
        setError(result.message);
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError('Failed to process payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleClearReferralCode = () => {
    setReferralCode('')
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-center text-blue-600">Checkout</CardTitle>
            <CardDescription className="text-center">
              No package selected. Please go back and select a package.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <a href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-blue-600 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-blue-600">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-bold text-lg">{packageData.title}</h3>
                    <p className="text-gray-600 text-sm">{packageData.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{packageData.price}</p>
                  </div>
                </div>
                
                {/* GST Calculation */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Package Price:</span>
                    <span>₹{packageData.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{packageData.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Referral Code and Payment */}
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-orange-600">Complete Purchase</CardTitle>
              <CardDescription>Enter referral code and proceed with payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Referral Code Section */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-bold mb-2">Have a referral code?</h2>
                <div className="flex">
                  <Input 
                    type="text" 
                    placeholder="Enter referral code" 
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleClearReferralCode}
                    className="rounded-l-none border-l-0"
                  >
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Enter a referral code to earn commissions for the referrer
                </p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg">
                  {error}
                </div>
              )}
              
              {/* Payment Button */}
              <Button
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-lg py-3"
                onClick={handleProcessPayment}
                disabled={processing}
              >
                {processing ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay ₹{packageData.price}
                  </>
                )}
              </Button>
              
              {/* Navigation Buttons */}
              <div className="flex flex-col gap-3">
                <Button asChild variant="outline" className="w-full">
                  <a href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Checkout