import { supabase } from '@/lib/supabase.js'

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