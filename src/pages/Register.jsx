import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase.js'
import { createStudent } from '@/lib/api.js'

function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ name: '', number: '', referralCode: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check for referral code in URL on component mount
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setForm(prev => ({ ...prev, referralCode: refCode }))
    }
  }, [searchParams])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleGoogleSignUp = async () => {
    setError('')
    setLoading(true)
    try {
      // Initiate Google OAuth sign up
      const { data, error: signUpError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (signUpError) throw signUpError
      
      // Note: The redirect will be handled by Supabase OAuth flow
      // The student record will be created in the dashboard after successful authentication
    } catch (err) {
      setError('Google Sign-Up failed. Please try again.')
      console.error('Google Sign-Up error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="text-center">
        <Card className="w-full max-w-md border-2 border-orange-300 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-blue-600 text-center">Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-semibold">Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
              </div>
              <div>
                <Label htmlFor="number" className="font-semibold">Number</Label>
                <Input id="number" type="tel" name="number" value={form.number} onChange={handleChange} placeholder="Phone number" required />
              </div>
              <div>
                <Label htmlFor="referralCode" className="font-semibold">Referral Code (Optional)</Label>
                <Input id="referralCode" name="referralCode" value={form.referralCode} onChange={handleChange} placeholder="Enter referral code" />
              </div>
              {error && (
                <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
              )}
              <Button 
                onClick={handleGoogleSignUp}
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold flex items-center justify-center"
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Register