import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from '@/firebase.js'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { createStudent } from '@/lib/api.js'

function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', number: '', password: '', referralCode: '' })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Create Firebase user
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(cred.user, { displayName: form.name })
      
      // Create student record in Supabase, passing referral code if present
      const studentResult = await createStudent(
        cred.user.uid, 
        form.name, 
        form.email, 
        form.number, 
        form.referralCode
      )
      if (studentResult.error) {
        console.error('Error creating student record:', studentResult.error)
        // Don't fail registration if Supabase fails, just log the error
      }
      
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError('Registration failed. Please try again.')
      }
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-semibold">Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
              </div>
              <div>
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <Input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
              <div>
                <Label htmlFor="number" className="font-semibold">Number</Label>
                <Input id="number" type="tel" name="number" value={form.number} onChange={handleChange} placeholder="Phone number" required />
              </div>
              <div>
                <Label htmlFor="referralCode" className="font-semibold">Referral Code (Optional)</Label>
                <Input id="referralCode" name="referralCode" value={form.referralCode} onChange={handleChange} placeholder="Enter referral code" />
              </div>
              <div>
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <Input id="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
              </div>
              {error && (
                <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
              )}
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </Button>
            </form>
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