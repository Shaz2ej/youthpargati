// Test script to verify that the affiliate record fixes are working
import { ensureAffiliateRecord } from './src/lib/api.js';
import { supabaseClient } from './src/lib/supabase.js';

async function testAffiliateFix() {
  console.log('Testing affiliate record creation fix...');
  
  try {
    // Test with a sample student ID and referral code
    // Replace these with actual values from your database
    const studentId = '941b888b-a32f-42ba-8ff9-1b1be10c8aee'; // Example student ID
    const referralCode = 'TEST123'; // Example referral code
    
    console.log(`Testing with studentId: ${studentId}`);
    
    // Ensure affiliate record exists
    const result = await ensureAffiliateRecord(studentId, referralCode);
    console.log('Ensure affiliate record result:', result);
    
    if (result.error) {
      console.error('Failed to ensure affiliate record:', result.error);
      return;
    }
    
    console.log('Affiliate record ensured successfully:', result.data);
    
    // Test fetching the affiliate data
    const { data, error } = await supabaseClient
      .from('affiliates')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (error) {
      console.error('Error fetching affiliate data:', error);
      return;
    }
    
    console.log('Fetched affiliate data:', data);
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testAffiliateFix();