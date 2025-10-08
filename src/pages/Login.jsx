import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '@/firebase.js'
import { signInWithEmailAndPassword } from 'firebase/auth'

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
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.')
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email.')
      } else {
        setError('Login failed. Please try again.')
      }
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


