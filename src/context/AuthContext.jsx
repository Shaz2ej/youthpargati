import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock authentication state
  useEffect(() => {
    // Simulate checking for existing session
    const checkUser = async () => {
      // In a real app, this would check for a valid session
      // For now, we'll just set loading to false
      setLoading(false);
    };

    checkUser();
  }, []);

  const value = {
    user,
    loading,
    isLoadingAuth: loading,
    signOut: () => {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;