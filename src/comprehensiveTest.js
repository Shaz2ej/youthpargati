import { supabase } from '@/lib/supabase.js';

export const comprehensiveTest = async () => {
  console.log('=== Comprehensive Auth Test ===');
  
  // 1. Check current session
  console.log('1. Checking current session...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('   Session data:', sessionData);
  console.log('   Session error:', sessionError);
  
  if (!sessionData?.session?.user) {
    console.log('   No active session!');
    return;
  }
  
  const userId = sessionData.session.user.id;
  console.log('   Current user ID:', userId);
  console.log('   Current user email:', sessionData.session.user.email);
  
  // 2. Check JWT token
  console.log('2. Checking JWT token...');
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log('   User data:', userData);
  console.log('   User error:', userError);
  
  if (userData?.user) {
    console.log('   JWT user ID:', userData.user.id);
    console.log('   JWT user email:', userData.user.email);
  }
  
  // 3. Test different queries to find student record
  console.log('3. Testing student record queries...');
  
  // Query 1: By supabase_auth_uid
  console.log('   Query 1: Looking for student with supabase_auth_uid =', userId);
  const { data: studentBySupabaseAuthUid, error: error1 } = await supabase
    .from('students')
    .select('*')
    .eq('supabase_auth_uid', userId);
  console.log('   Result 1:', studentBySupabaseAuthUid, error1);
  
  // Query 2: By id
  console.log('   Query 2: Looking for student with id =', userId);
  const { data: studentById, error: error2 } = await supabase
    .from('students')
    .select('*')
    .eq('id', userId);
  console.log('   Result 2:', studentById, error2);
  
  // Query 3: List all students
  console.log('   Query 3: Listing all students...');
  const { data: allStudents, error: error3 } = await supabase
    .from('students')
    .select('*');
  console.log('   Result 3: Found', allStudents?.length || 0, 'students');
  if (allStudents) {
    allStudents.forEach((student, index) => {
      console.log(`   Student ${index + 1}:`, {
        id: student.id,
        supabase_auth_uid: student.supabase_auth_uid,
        name: student.name,
        email: student.email
      });
    });
  }
  console.log('   Error 3:', error3);
  
  // 4. Test student record creation
  console.log('4. Testing student record creation...');
  if (!studentBySupabaseAuthUid || studentBySupabaseAuthUid.length === 0) {
    console.log('   No student record found, attempting to create one...');
    
    const testStudent = {
      supabase_auth_uid: userId,
      name: sessionData.session.user.user_metadata?.name || 'Test User',
      email: sessionData.session.user.email || 'test@example.com',
      phone: '1234567890',
      referral_code: 'TEST123'
    };
    
    console.log('   Attempting to insert test student:', testStudent);
    const { data: insertData, error: insertError } = await supabase
      .from('students')
      .upsert(testStudent, { onConflict: 'email' })
      .select();
    
    console.log('   Insert result:', insertData, insertError);
  } else {
    console.log('   Student record already exists');
  }
  
  console.log('=== Test Complete ===');
};