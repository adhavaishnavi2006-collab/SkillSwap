import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, loginUser, logoutUser, registerStudent, setCurrentUser } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    collegeYear: string;
    department: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
  quickSwitchAccount: (targetEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setLocalUser] = useState<User | null>(() => getCurrentUser());

  useEffect(() => {
    const user = getCurrentUser();
    setLocalUser(user);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    if (res.success && res.user) {
      setLocalUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  };

  const register = async (params: {
    name: string;
    email: string;
    password: string;
    collegeYear: string;
    department: string;
  }) => {
    const res = await registerStudent(params);
    if (res.success && res.user) {
      setLocalUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const logout = () => {
    logoutUser();
    setLocalUser(null);
  };

  const refreshUser = () => {
    const user = getCurrentUser();
    setLocalUser(user);
  };

  // Helper for effortless testing between student accounts or admin without breaking security
  const quickSwitchAccount = async (targetEmail: string) => {
    await login(targetEmail, targetEmail === 'admin@skillswap.edu' ? 'admin123' : 'student123');
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
    quickSwitchAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
