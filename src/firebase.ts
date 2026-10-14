import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';

// Configuration for project: skillswap-39167
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBK8vo5f2DBLX72-Kc7Nd-0pAEpG7gl8M8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'skillswap-39167.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'skillswap-39167',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'skillswap-39167.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '21093868263',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:21093868263:web:cdf7ca11f6e9c6e891f842',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-GWE9V79H3W',
};

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase modular services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics: initialized conditionally only when supported and enabled in environment
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  // Prevent unhandled background Firebase installation / analytics rejections from crashing the UI
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = String(reason?.message || reason || '');
    if (reasonStr.includes('installations') || reasonStr.includes('Installations') || reasonStr.includes('API key not valid')) {
      console.warn('Suppressed Firebase background installations notice:', reasonStr);
      event.preventDefault();
    }
  });

  if (import.meta.env.VITE_ENABLE_FIREBASE_ANALYTICS === 'true') {
    isAnalyticsSupported()
      .then((supported) => {
        if (supported) {
          try {
            analytics = getAnalytics(app);
          } catch (e) {
            console.warn('Firebase Analytics initialization skipped:', e);
            analytics = null;
          }
        }
      })
      .catch(() => {
        analytics = null;
      });
  }
}

// Optional connectivity diagnostic check
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_probe'));
    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('the client is offline')) {
      console.warn('SkillSwap Firebase: client offline or network unreachable.');
    }
    return false;
  }
}

// Structured error handling according to Firebase integration specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
