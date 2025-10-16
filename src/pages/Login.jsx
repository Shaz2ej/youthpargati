import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signInWithGoogle } from '@/firebase.js'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (location.state && location.state.registered) {
      setInfo('Registration successful! Please log in.')
    }
  }, [location.state])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Note: Email/password login would need to be implemented with Supabase auth
    // For now, we're focusing on Google OAuth
    setError('Email/password login is not implemented. Please use Google Sign-In.')
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      // The redirect will be handled by Supabase OAuth flow
    } catch (err) {
      setError('Google Sign-In failed. Please try again.')
      console.error('Google Sign-In error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="text-center">
        <Card className="w-full max-w-md border-2 border-blue-300 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-blue-600 text-center">Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            {info && <p className="mb-3 text-green-700 font-semibold text-center">{info}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <Input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
              <div>
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <Input id="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
              </div>
              {error && (
                <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
              )}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </form>
            
            <div className="my-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold flex items-center justify-center"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
            
            <p className="mt-4 text-sm text-gray-600 text-center">
              New here?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create an account</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login