const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://pnupcskyrxivtjhwmvax.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudXBjc2t5cnhpdnRqaHdtdmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzAxNDIsImV4cCI6MjA3MTk0NjE0Mn0.Q0Qp4CFCXWTSdFqbqR1nouEEF2_jydgPfhXRoygKFx0';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAffiliates() {
  console.log('Testing affiliates table access...');
  
  try {
    // Test a simple query
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('student_id', '941b888b-a32f-42ba-8ff9-1b1be10c8aee')
      .single();
    
    console.log('Query result:', data, error);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAffiliates();