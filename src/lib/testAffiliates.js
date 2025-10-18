import { supabaseClient } from './supabase.js';
import { ensureAffiliateRecord } from './api.js';

export const testAffiliatesRecord = async (userId) => {
  try {
    console.log('Testing affiliates record for user:', userId);
    
    // First get the student record
    console.log('Getting student record...');
    const { data: studentData, error: studentError } = await supabaseClient
      .from('students')
      .select('id, referral_code')
      .eq('firebase_uid', userId)
      .single();
    
    console.log('Student record:', studentData, studentError);
    
    if (studentError) {
      return { error: `Student record error: ${studentError.message}` };
    }
    
    if (!studentData) {
      return { error: 'No student record found' };
    }
    
    // Ensure affiliate record exists
    console.log('Ensuring affiliates record exists...');
    const ensureResult = await ensureAffiliateRecord(studentData.id, studentData.referral_code);
    
    console.log('Affiliates ensure result:', ensureResult);
    
    if (ensureResult.error) {
      return { error: `Failed to ensure affiliates record: ${ensureResult.error}` };
    }
    
    return { data: ensureResult.data, created: false };
  } catch (error) {
    console.error('Error testing affiliates record:', error);
    return { error: error.message };
  }
};