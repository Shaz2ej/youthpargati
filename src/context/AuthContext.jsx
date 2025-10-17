import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
      setIsLoadingAuth(false)
      
      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
        setLoading(false)
        setIsLoadingAuth(false)
      })
      
      return () => {
        subscription.unsubscribe()
      }
    }
    
    checkSession()
  }, [])

  // Show loading screen while determining auth state
  if (isLoadingAuth) {
    return <div>Loading...</div>
  }

  const value = { user, loading, isLoadingAuth }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}