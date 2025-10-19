import { supabase } from '@/lib/supabase.js';

export const testAuth = async () => {
  console.log('Testing authentication...');
  
  // Check current session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('Current session:', sessionData, sessionError);
  
  if (sessionData?.session?.user) {
    const userId = sessionData.session.user.id;
    console.log('Current user ID:', userId);
    
    // Try to get student data
    console.log('Testing query with supabase_auth_uid =', userId);
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('supabase_auth_uid', userId);
    console.log('Student data (supabase_auth_uid):', studentData, studentError);
    
    // Try with eq('id', userId) as well to see which one works
    console.log('Testing query with id =', userId);
    const { data: studentDataById, error: studentErrorById } = await supabase
      .from('students')
      .select('*')
      .eq('id', userId);
    
    console.log('Student data (id):', studentDataById, studentErrorById);
    
    // List all students to see what's in the database
    console.log('Listing all students:');
    const { data: allStudents, error: allStudentsError } = await supabase
      .from('students')
      .select('*');
    
    console.log('All students:', allStudents, allStudentsError);
  } else {
    console.log('No active session');
  }
};