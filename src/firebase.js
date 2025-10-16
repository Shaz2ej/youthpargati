import { supabase } from '@/lib/supabase.js'

// For backward compatibility with components still using Firebase-like API
export const auth = {
  // Mock functions to prevent build errors
  createUserWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return { user: data.user }
  },
  updateProfile: async (user, profile) => {
    // In Supabase, profile data is handled differently
    // This is a mock function to prevent build errors
    return Promise.resolve()
  },
  signInWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { user: data.user }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}

// Function to sign in with Google using Supabase
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  
  if (error) {
    throw error
  }
  
  return data
}

// Function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

// Export supabase client for other uses
export { supabase }

export default supabase