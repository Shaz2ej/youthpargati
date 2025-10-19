import supabase from './supabase.js';

export const testAuthStatus = async () => {
  try {
    console.log('Testing authentication status...');
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session, sessionError);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user, userError);
    
    if (user) {
      console.log('User is authenticated with ID:', user.id);
      
      // Test a simple query to see if we can access data
      const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('supabase_auth_uid', user.id)
        .single();
      
      console.log('Test query result:', data, error);
      
      return { authenticated: true, user, testQuery: { data, error } };
    } else {
      console.log('User is not authenticated');
      return { authenticated: false, user: null };
    }
  } catch (error) {
    console.error('Error testing authentication:', error);
    return { authenticated: false, error: error.message };
  }
};