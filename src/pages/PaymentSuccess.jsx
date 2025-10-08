import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Link } from 'react-router-dom'
import { CheckCircle, Home, User } from 'lucide-react'

function PaymentSuccess() {
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
                  You will receive access to your courses shortly.
                </p>
              </div>
              
              <div className="flex flex-col gap-3 mt-6">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
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