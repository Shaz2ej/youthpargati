import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, User, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/context/AuthContext.jsx'

function PaymentSuccess() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Wait for auth state to be determined
    if (loading) {
      return;
    }
    
    const processPaymentSuccess = async () => {
      try {
        console.log('Processing payment success for user:', user);
        
        // Get package data from sessionStorage
        const storedPackage = sessionStorage.getItem('checkoutPackage')
        const referralCode = sessionStorage.getItem('referralCode')
        
        console.log('Stored package:', storedPackage);
        console.log('Referral code:', referralCode);
        
        if (!storedPackage || !user) {
          throw new Error('Missing package data or user authentication')
        }
        
        const packageData = JSON.parse(storedPackage)
        console.log('Package data:', packageData);
        
        // Get student ID from Supabase
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('firebase_uid', user.uid)
          .single()
        
        if (studentError) {
          console.error('Error fetching student data:', studentError)
          throw new Error('Failed to fetch student data')
        }
        
        console.log('Student data:', studentData);
        
        // Prepare purchase data - let Supabase triggers handle commission calculation
        const purchaseData = {
          student_id: studentData.id,
          package_id: packageData.id,
          package_name: packageData.title,
          amount: packageData.price,
          commission: 0, // Will be calculated by database trigger
          status: 'completed',
          payment_method: 'Pay0.Shop',
          // Include referral code if available - will be processed by database trigger
          ...(referralCode && { referral_code: referralCode })
        }
        
        console.log('Purchase data to insert:', purchaseData);
        
        // Insert purchase record
        const { data: purchaseResult, error: insertError } = await supabase
          .from('purchases')
          .insert(purchaseData)
          .select()
        
        if (insertError) {
          console.error('Error inserting purchase record:', insertError)
          throw new Error('Failed to record purchase')
        }
        
        console.log('Purchase record inserted successfully:', purchaseResult)
        
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
    
    // Only run if user is authenticated and not still loading
    if (!loading && user) {
      processPaymentSuccess()
    } else if (!loading && !user) {
      // User is not authenticated
      setError('User authentication required. Please login to complete your purchase.')
      setIsLoading(false)
    }
  }, [user, loading])

  const handleViewCourse = () => {
    // Redirect to dashboard where purchased courses will be visible
    navigate('/dashboard')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  // Show loading state while auth is being determined
  if (loading || (isLoading && !error)) {
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