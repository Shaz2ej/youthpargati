import { supabase } from '@/lib/supabase.js';
import { getStudentData, createStudent } from '@/lib/api.js';

export const debugAuth = async () => {
  console.log('=== Debug Auth Started ===');
  
  // 1. Check current session
  console.log('1. Checking current session...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('   Session data:', sessionData);
  console.log('   Session error:', sessionError);
  
  if (!sessionData?.session?.user) {
    console.log('   ❌ No active session!');
    console.log('=== Debug Auth Ended ===');
    return { success: false, message: 'No active session' };
  }
  
  const userId = sessionData.session.user.id;
  console.log('   ✅ Current user ID:', userId);
  console.log('   ✅ Current user email:', sessionData.session.user.email);
  
  // 2. Check if student record exists
  console.log('2. Checking if student record exists...');
  const studentResult = await getStudentData(userId);
  console.log('   Student result:', studentResult);
  
  if (studentResult.error === 'No student record found') {
    console.log('   ❌ Student record not found, creating one...');
    
    // Create student record
    const createResult = await createStudent(
      userId,
      sessionData.session.user.user_metadata?.name || 'Test User',
      sessionData.session.user.email || 'test@example.com',
      sessionData.session.user.user_metadata?.phone || '1234567890'
    );
    
    console.log('   Create result:', createResult);
    
    if (createResult.error) {
      console.log('   ❌ Failed to create student record:', createResult.error);
      console.log('=== Debug Auth Ended ===');
      return { success: false, message: `Failed to create student record: ${createResult.error}` };
    }
    
    console.log('   ✅ Student record created successfully');
    
    // Verify the student record was created
    console.log('3. Verifying student record creation...');
    const verifyResult = await getStudentData(userId);
    console.log('   Verification result:', verifyResult);
    
    if (verifyResult.error) {
      console.log('   ❌ Failed to verify student record:', verifyResult.error);
      console.log('=== Debug Auth Ended ===');
      return { success: false, message: `Failed to verify student record: ${verifyResult.error}` };
    }
    
    console.log('   ✅ Student record verified successfully');
    console.log('=== Debug Auth Ended ===');
    return { success: true, message: 'Student record created and verified', student: verifyResult.data };
  } else if (studentResult.error) {
    console.log('   ❌ Error fetching student data:', studentResult.error);
    console.log('=== Debug Auth Ended ===');
    return { success: false, message: `Error fetching student data: ${studentResult.error}` };
  } else {
    console.log('   ✅ Student record found');
    console.log('=== Debug Auth Ended ===');
    return { success: true, message: 'Student record found', student: studentResult.data };
  }
};