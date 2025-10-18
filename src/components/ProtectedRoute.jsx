import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  
  console.log('ProtectedRoute: Checking auth state', { user, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600 font-bold">Loading...</div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  
  console.log('ProtectedRoute: User authenticated, rendering children');

  return children
}

export default ProtectedRoute