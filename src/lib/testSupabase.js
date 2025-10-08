import { supabase } from './supabase.js'

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('students')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Supabase connection successful!')
    return { success: true, data }
  } catch (err) {
    console.error('Supabase test error:', err)
    return { success: false, error: err.message }
  }
}

// Test if student exists
export const testStudentExists = async (firebaseUid) => {
  try {
    console.log('Testing if student exists for UID:', firebaseUid)
    
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single()
    
    if (error) {
      console.error('Student lookup error:', error)
      return { exists: false, error: error.message }
    }
    
    console.log('Student found:', data)
    return { exists: true, data }
  } catch (err) {
    console.error('Student test error:', err)
    return { exists: false, error: err.message }
  }
}