/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: 'field_coordinator' | 'radiologist' | 'monitor';
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

 const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers = [
  { id: '1', username: 'coordinator1', password: 'Pass123!', email:"coordinator1@test.com",role: 'field_coordinator' as const },
  { id: '2', username: 'radiologist1', password: 'Pass123!', role: 'radiologist' as const },
  { id: '3', username: 'radiologist2', password: 'Pass123!', role: 'radiologist' as const },
  { id: '4', username: 'radiologist3', password: 'Pass123!', role: 'radiologist' as const },
  { id: '5', username: 'monitor1', password: 'Pass123!', role: 'monitor' as const },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = mockUsers.find(u => u.username === username && u.password === password);
    if (foundUser) {
      const loginTime = new Date().toISOString();
      const userWithLoginTime = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        loginTime
      };
      
      setUser(userWithLoginTime);
      localStorage.setItem('currentUser', JSON.stringify(userWithLoginTime));
      
      // Save login record
      const loginRecords = JSON.parse(localStorage.getItem('loginRecords') || '[]');
      loginRecords.push({
        username: foundUser.username,
        role: foundUser.role,
        loginTime
      });
      localStorage.setItem('loginRecords', JSON.stringify(loginRecords));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};