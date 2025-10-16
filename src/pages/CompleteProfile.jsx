import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import { supabase } from '@/firebase.js'

function CompleteProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ phone: '', state: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Update user profile with phone number and state
      const { error: updateError } = await supabase
        .from('students')
        .update({ 
          phone: formData.phone,
          state: formData.state
        })
        .eq('firebase_uid', user.id)
      
      if (updateError) throw updateError
      
      // Redirect to dashboard after successful update
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to update profile. Please try again.')
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="text-center">
        <Card className="w-full max-w-md border-2 border-blue-300 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-blue-600 text-center">Complete Your Profile</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Please provide your mobile number and state to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="phone" className="font-semibold">Mobile Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Enter your mobile number" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="state" className="font-semibold">State</Label>
                <Input 
                  id="state" 
                  type="text" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                  placeholder="Enter your state" 
                  required 
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CompleteProfile