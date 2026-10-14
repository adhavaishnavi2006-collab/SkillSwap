import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// Configuration for existing project: skillswap-39167
export const firebaseConfig = {
  apiKey: "AIzaSyBK8vo5f2DBLX72-Kc7Nd-0pAEpG7gl8M8",
  authDomain: "skillswap-39167.firebaseapp.com",
  projectId: "skillswap-39167",
  storageBucket: "skillswap-39167.firebasestorage.app",
  messagingSenderId: "21093868263",
  appId: "1:21093868263:web:cdf7ca11f6e9c6e891f842",
  measurementId: "G-GWE9V79H3W"
};

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase modular services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics: initialized conditionally only when supported and enabled in environment
export let analytics = null;
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
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_probe'));
    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('the client is offline')) {
      console.warn('SkillSwap Firebase: client offline or network unreachable.');
    }
    return false;
  }
}

// Structured error handling according to Firebase integration specifications
export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser ? auth.currentUser.uid : null,
      email: auth.currentUser ? auth.currentUser.email : null,
      emailVerified: auth.currentUser ? auth.currentUser.emailVerified : null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
