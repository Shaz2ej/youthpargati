import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    
    // Check active session first
    const checkInitialSession = async () => {
      try {
        console.log('AuthProvider: Checking initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('AuthProvider: Initial session check result', session, error);
        
        if (session?.user) {
          console.log('AuthProvider: Setting initial user', session.user);
          setUser(session.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('AuthProvider: Error checking initial session', error);
        setUser(null);
        setLoading(false);
      } finally {
        console.log('AuthProvider: Initial session check complete');
      }
    };
    
    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: onAuthStateChange triggered', _event, session?.user);
      
      try {
        const newUser = session?.user || null;
        console.log('AuthProvider: Setting user from auth state change', newUser);
        
        // Test the session to make sure it's valid
        if (newUser) {
          console.log('AuthProvider: Testing session validity...');
          supabase.auth.getSession().then(({ data: { session }, error }) => {
            console.log('AuthProvider: Session validity test result', session, error);
          });
        }
        
        setUser(newUser);
      } catch (error) {
        console.error('AuthProvider: Error in onAuthStateChange:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setIsLoadingAuth(false);
        console.log('AuthProvider: Auth state change processing complete');
      }
    });

    // Check initial session
    checkInitialSession().then(() => {
      setIsLoadingAuth(false);
      console.log('AuthProvider: isLoadingAuth set to false after initial check');
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Show loading screen while determining auth state
  if (isLoadingAuth) {
    console.log('AuthProvider: Still loading auth state...');
    return <div>Loading auth...</div>;
  }

  console.log('AuthProvider: Providing context with user', user);
  const value = { user, loading, isLoadingAuth };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  console.log('useAuth: Returning context', context);
  return context;
}