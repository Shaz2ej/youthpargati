import { supabaseClient } from './supabase.js';

export const testRLSPolicies = async (userId) => {
  try {
    console.log('Testing RLS policies for user:', userId);
    
    // Test students table access
    console.log('Testing students table access...');
    const { data: studentData, error: studentError } = await supabaseClient
      .from('students')
      .select('*')
      .eq('supabase_auth_uid', userId)
      .single();
    
    console.log('Students table test result:', studentData, studentError);
    
    // Test affiliates table access
    console.log('Testing affiliates table access...');
    const { data: affiliateData, error: affiliateError } = await supabaseClient
      .from('affiliates')
      .select('*')
      .eq('student_id', studentData?.id)
      .single();
    
    console.log('Affiliates table test result:', affiliateData, affiliateError);
    
    // Test purchases table access
    console.log('Testing purchases table access...');
    const { data: purchasesData, error: purchasesError } = await supabaseClient
      .from('purchases')
      .select('*')
      .eq('student_id', studentData?.id);
    
    console.log('Purchases table test result:', purchasesData, purchasesError);
    
    return {
      students: { data: studentData, error: studentError },
      affiliates: { data: affiliateData, error: affiliateError },
      purchases: { data: purchasesData, error: purchasesError }
    };
  } catch (error) {
    console.error('Error testing RLS policies:', error);
    return { error: error.message };
  }
};