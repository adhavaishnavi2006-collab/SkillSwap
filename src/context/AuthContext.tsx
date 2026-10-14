import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../firebase';
import { User } from '../types';
import { getUserProfile, saveUserProfile } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    collegeYear: string;
    department: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase Auth as the single source of truth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // Fetch student profile from Firestore
        const profile = await getUserProfile(fbUser.uid);

        if (profile) {
          setCurrentUser(profile);
        } else {
          // Construct fallback profile from auth credentials
          const isDefaultAdmin = fbUser.email?.toLowerCase() === 'admin@skillswap.edu';
          const newProfile: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
            email: fbUser.email || '',
            role: isDefaultAdmin ? 'admin' : 'student',
            collegeYear: '2nd Year',
            department: 'Computer Engineering',
            joinedAt: new Date().toISOString(),
          };
          // Persist to Firestore
          await saveUserProfile(newProfile);
          setCurrentUser(newProfile);
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await getUserProfile(cred.user.uid);
      if (profile) {
        setCurrentUser(profile);
      }
      return { success: true };
    } catch (err: unknown) {
      console.error('Firebase Login Error:', err);
      const code = (err as { code?: string })?.code;
      let message = 'Failed to log in. Please check your email and password.';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        message = 'Invalid email or password. If you do not have an account, please create one.';
      } else if (code === 'auth/wrong-password') {
        message = 'Incorrect password. Please verify your credentials.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed attempts. Try again later or reset password.';
      } else if (code === 'auth/invalid-email') {
        message = 'The provided email address is invalid.';
      }
      return { success: false, error: message };
    }
  };

  const register = async (params: {
    name: string;
    email: string;
    password: string;
    collegeYear: string;
    department: string;
  }) => {
    try {
      const normalizedEmail = params.email.trim().toLowerCase();
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, params.password);

      // Set display name in Firebase Auth
      await updateProfile(cred.user, {
        displayName: params.name.trim(),
      });

      // Role determination: prevent self-assigning admin unless designated admin email
      const isConfiguredAdmin = normalizedEmail === 'admin@skillswap.edu';

      const studentProfile: User = {
        id: cred.user.uid,
        name: params.name.trim(),
        email: normalizedEmail,
        role: isConfiguredAdmin ? 'admin' : 'student',
        collegeYear: params.collegeYear,
        department: params.department,
        joinedAt: new Date().toISOString(),
      };

      // Save student profile in Firestore
      await saveUserProfile(studentProfile);
      setCurrentUser(studentProfile);

      return { success: true };
    } catch (err: unknown) {
      console.error('Firebase Register Error:', err);
      const code = (err as { code?: string })?.code;
      let message = 'Failed to create student account.';
      if (code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Please log in instead.';
      } else if (code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (code === 'auth/invalid-email') {
        message = 'Please provide a valid college email address.';
      }
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: unknown) {
      console.error('Firebase Password Reset Error:', err);
      const code = (err as { code?: string })?.code;
      let message = 'Failed to send password reset email.';
      if (code === 'auth/user-not-found') {
        message = 'No registered student account was found with this email.';
      } else if (code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const profile = await getUserProfile(auth.currentUser.uid);
      if (profile) setCurrentUser(profile);
    }
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin' || firebaseUser?.email === 'admin@skillswap.edu',
    loading,
    login,
    register,
    logout,
    resetPassword,
    refreshUser,
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
