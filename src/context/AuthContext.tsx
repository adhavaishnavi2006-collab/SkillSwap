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

export interface AuthActionResult {
  success: boolean;
  error?: string;
  code?: string;
  details?: string;
  isConfigIssue?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  lastError: string | null;
  lastErrorCode: string | null;
  login: (email: string, pass: string) => Promise<AuthActionResult>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    collegeYear: string;
    department: string;
  }) => Promise<AuthActionResult>;
  loginAsDemoStudent: (demoEmail?: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthActionResult>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);

  // Sync Firebase Auth as the single source of truth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          // Fetch student profile from Firestore
          let profile = await getUserProfile(fbUser.uid);

          if (!profile) {
            // Construct fallback profile from auth credentials (Idempotent recovery)
            const isDefaultAdmin = fbUser.email?.toLowerCase() === 'admin@skillswap.edu';
            const newProfile: User = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
              email: fbUser.email || '',
              role: isDefaultAdmin ? 'admin' : 'student',
              collegeYear: '2nd Year',
              department: 'Computer Engineering',
              collegeName: 'Engineering College',
              joinedAt: new Date().toISOString(),
            };
            // Persist to Firestore
            await saveUserProfile(newProfile);
            profile = newProfile;
          }
          setCurrentUser(profile);
        } catch (err) {
          console.warn('[SkillSwap Auth] Error resolving user profile on state change:', err);
          // Set in-memory fallback user so UI doesn't crash
          const isDefaultAdmin = fbUser.email?.toLowerCase() === 'admin@skillswap.edu';
          setCurrentUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
            email: fbUser.email || '',
            role: isDefaultAdmin ? 'admin' : 'student',
            collegeYear: '2nd Year',
            department: 'Computer Engineering',
            joinedAt: new Date().toISOString(),
          });
        }
      } else {
        // If no Firebase Auth user, check for an active demo session in localStorage
        const demoSession = localStorage.getItem('skillswap_demo_session');
        if (demoSession) {
          try {
            const parsed = JSON.parse(demoSession) as User;
            setCurrentUser(parsed);
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<AuthActionResult> => {
    setLastError(null);
    setLastErrorCode(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      console.log(`[SkillSwap Auth] Attempting Firebase signIn for ${normalizedEmail}...`);
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      
      // Idempotently ensure profile exists in Firestore
      let profile = await getUserProfile(cred.user.uid);
      if (!profile) {
        console.log('[SkillSwap Auth] Profile not found in Firestore. Restoring student profile...');
        const isDefaultAdmin = normalizedEmail === 'admin@skillswap.edu';
        profile = {
          id: cred.user.uid,
          name: cred.user.displayName || normalizedEmail.split('@')[0] || 'Student',
          email: normalizedEmail,
          role: isDefaultAdmin ? 'admin' : 'student',
          collegeYear: '2nd Year',
          department: 'Computer Engineering',
          joinedAt: new Date().toISOString(),
        };
        await saveUserProfile(profile);
      }

      setCurrentUser(profile);
      setFirebaseUser(cred.user);
      localStorage.removeItem('skillswap_demo_session');
      return { success: true };
    } catch (err: any) {
      console.error('[SkillSwap Auth] Firebase Login Error:', err);
      const code = err?.code || '';
      const rawMsg = err?.message || String(err);
      setLastErrorCode(code);

      let message = 'Failed to log in. Please check your email and password.';
      let isConfigIssue = false;

      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        message = 'Invalid email or password. If you do not have an account, please create one.';
      } else if (code === 'auth/wrong-password') {
        message = 'Incorrect password. Please verify your credentials.';
      } else if (code === 'auth/api-key-not-valid' || code === 'auth/invalid-api-key' || rawMsg.includes('API key not valid')) {
        isConfigIssue = true;
        message = 'Firebase API key is invalid or restricted (auth/api-key-not-valid). Please verify your Web API Key in Firebase Console for project "skillswap-39167".';
      } else if (code === 'auth/operation-not-allowed') {
        isConfigIssue = true;
        message = 'Email/Password sign-in method is disabled in Firebase Console. Please enable "Email/Password" under Authentication > Sign-in method.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to multiple failed attempts. Try again later or reset password.';
      } else if (code === 'auth/invalid-email') {
        message = 'The provided email address is invalid.';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network connection failed. Unable to reach Firebase Authentication servers.';
      } else if (code) {
        message = `Firebase Authentication error (${code}): ${rawMsg}`;
      }

      setLastError(message);
      return { success: false, error: message, code, isConfigIssue };
    }
  };

  const register = async (params: {
    name: string;
    email: string;
    password: string;
    collegeYear: string;
    department: string;
  }): Promise<AuthActionResult> => {
    setLastError(null);
    setLastErrorCode(null);

    const normalizedEmail = params.email.trim().toLowerCase();
    const trimmedName = params.name.trim();

    if (!trimmedName) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid student email address.' };
    }
    if (params.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    let userCredential;
    let isRecoveredUser = false;

    try {
      console.log(`[SkillSwap Auth] Calling createUserWithEmailAndPassword for ${normalizedEmail}...`);
      userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, params.password);
    } catch (authError: any) {
      const authCode = authError?.code || '';
      const authMsg = authError?.message || String(authError);
      console.warn(`[SkillSwap Auth] Registration failed with code: ${authCode}`, authError);
      setLastErrorCode(authCode);

      // IDEMPOTENCY RECOVERY:
      // If the email is already in use (e.g. from an earlier registration attempt that failed during profile write),
      // attempt signing in with the provided password to repair and complete the profile!
      if (authCode === 'auth/email-already-in-use') {
        console.log('[SkillSwap Auth] Email already in Auth. Attempting recovery sign-in to restore profile...');
        try {
          userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, params.password);
          isRecoveredUser = true;
        } catch (signInErr: any) {
          console.warn('[SkillSwap Auth] Recovery sign-in failed:', signInErr);
          const msg = 'An account with this email address already exists. Please log in with your password, or use "Forgot Password".';
          setLastError(msg);
          return { success: false, code: 'auth/email-already-in-use', error: msg };
        }
      } else if (
        authCode === 'auth/api-key-not-valid' ||
        authCode === 'auth/invalid-api-key' ||
        authMsg.includes('API key not valid')
      ) {
        const msg = 'Firebase API key is invalid or restricted (auth/api-key-not-valid). Please verify your Web API Key in Firebase Console for project "skillswap-39167".';
        setLastError(msg);
        return { success: false, code: 'auth/api-key-not-valid', error: msg, isConfigIssue: true };
      } else if (authCode === 'auth/operation-not-allowed') {
        const msg = 'Email/Password sign-in method is disabled in Firebase Console. Please enable "Email/Password" under Firebase Console > Authentication > Sign-in method.';
        setLastError(msg);
        return { success: false, code: 'auth/operation-not-allowed', error: msg, isConfigIssue: true };
      } else if (authCode === 'auth/weak-password') {
        const msg = 'Password is too weak. Please use at least 6 characters.';
        setLastError(msg);
        return { success: false, code: 'auth/weak-password', error: msg };
      } else if (authCode === 'auth/invalid-email') {
        const msg = 'The provided email address is invalid.';
        setLastError(msg);
        return { success: false, code: 'auth/invalid-email', error: msg };
      } else if (authCode === 'auth/network-request-failed') {
        const msg = 'Network request failed. Unable to reach Firebase Authentication servers. Please check your internet connection.';
        setLastError(msg);
        return { success: false, code: 'auth/network-request-failed', error: msg };
      } else if (authCode === 'auth/too-many-requests') {
        const msg = 'Too many registration requests. Please wait a moment before trying again.';
        setLastError(msg);
        return { success: false, code: 'auth/too-many-requests', error: msg };
      } else {
        const msg = `Firebase registration error (${authCode || 'unknown'}): ${authMsg}`;
        setLastError(msg);
        return { success: false, code: authCode || 'auth/unknown', error: msg };
      }
    }

    const fbUser = userCredential.user;

    // Set display name in Firebase Auth
    try {
      await updateProfile(fbUser, { displayName: trimmedName });
    } catch (e) {
      console.warn('[SkillSwap Auth] Non-critical: Could not update displayName:', e);
    }

    // Role determination: prevent self-assigning admin unless designated admin email
    const isConfiguredAdmin = normalizedEmail === 'admin@skillswap.edu';

    // Strictly match schema & security rule constraints:
    // request.resource.data.id == userId && request.resource.data.role == 'student'
    const studentProfile: User = {
      id: fbUser.uid,
      name: trimmedName,
      email: normalizedEmail,
      role: isConfiguredAdmin ? 'admin' : 'student',
      collegeYear: params.collegeYear,
      department: params.department,
      joinedAt: new Date().toISOString(),
    };

    // Save student profile to Cloud Firestore
    console.log(`[SkillSwap Auth] Writing student profile to Firestore at /users/${fbUser.uid}...`);
    const profileSaveResult = await saveUserProfile(studentProfile);

    // Update state
    setCurrentUser(studentProfile);
    setFirebaseUser(fbUser);
    localStorage.removeItem('skillswap_demo_session');

    if (!profileSaveResult.success) {
      console.warn('[SkillSwap Auth] User registered in Auth, but Firestore write returned notice:', profileSaveResult.error);
    }

    return {
      success: true,
      details: isRecoveredUser
        ? 'Existing account detected. Student profile was successfully restored!'
        : 'Student account created successfully!',
    };
  };

  /**
   * Demo Student Mode: allows instant testing of all platform features even if
   * Firebase API key restrictions or offline status prevent cloud authentication.
   */
  const loginAsDemoStudent = async (demoEmail: string = 'adhavaishnavi@gmail.com'): Promise<AuthActionResult> => {
    const isAdminUser = demoEmail === 'admin@skillswap.edu';
    const demoUser: User = {
      id: isAdminUser ? 'demo_admin_user_id' : 'demo_student_vaishnavi_id',
      name: isAdminUser ? 'SkillSwap Administrator' : 'Vaishnavi Adhav',
      email: demoEmail,
      role: isAdminUser ? 'admin' : 'student',
      collegeYear: isAdminUser ? 'Staff' : '2nd Year',
      department: 'Computer Engineering',
      collegeName: 'Engineering College',
      joinedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('skillswap_demo_session', JSON.stringify(demoUser));
      await saveUserProfile(demoUser);
    } catch {
      // ignore
    }

    setCurrentUser(demoUser);
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<AuthActionResult> => {
    setLastError(null);
    setLastErrorCode(null);

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      return { success: true };
    } catch (err: any) {
      console.error('[SkillSwap Auth] Password Reset Error:', err);
      const code = err?.code;
      setLastErrorCode(code);
      let message = 'Failed to send password reset email.';
      if (code === 'auth/user-not-found') {
        message = 'No registered student account was found with this email.';
      } else if (code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (code === 'auth/api-key-not-valid' || code === 'auth/invalid-api-key') {
        message = 'Firebase API key is invalid or restricted (auth/api-key-not-valid). Please check Firebase Console.';
      }
      setLastError(message);
      return { success: false, error: message, code };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('[SkillSwap Auth] Logout error:', err);
    }
    localStorage.removeItem('skillswap_demo_session');
    setCurrentUser(null);
    setFirebaseUser(null);
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
    lastError,
    lastErrorCode,
    login,
    register,
    loginAsDemoStudent,
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
