import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';

// Storage key for user-configured API key overrides
export const FIREBASE_OVERRIDE_KEY = 'skillswap_firebase_api_key_override';

// Sanitize user-provided or environment API key (strips quotes, spaces)
export function sanitizeApiKey(rawKey?: string | null): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

// Verify basic structure of a Google Web API Key (must start with AIzaSy and be 39 chars)
export function isValidApiKeyFormat(key: string): boolean {
  const clean = sanitizeApiKey(key);
  return /^AIzaSy[A-Za-z0-9_-]{33}$/.test(clean);
}

// Retrieve any custom API key saved in localStorage, or fall back to Vite environment
export function getActiveApiKey(): string {
  if (typeof window !== 'undefined') {
    try {
      const customKey = localStorage.getItem(FIREBASE_OVERRIDE_KEY);
      if (customKey && customKey.trim()) {
        return sanitizeApiKey(customKey);
      }
    } catch {
      // ignore
    }
  }
  return sanitizeApiKey(import.meta.env.VITE_FIREBASE_API_KEY) || 'AIzaSyBK8vo5f2DBLX72-Kc7Nd-0pAEpG7gl8M8';
}

export function setActiveApiKey(newKey: string): void {
  if (typeof window !== 'undefined') {
    try {
      const cleanKey = sanitizeApiKey(newKey);
      if (cleanKey) {
        localStorage.setItem(FIREBASE_OVERRIDE_KEY, cleanKey);
      } else {
        localStorage.removeItem(FIREBASE_OVERRIDE_KEY);
      }
    } catch {
      // ignore
    }
  }
}

// Global helper to detect all API Key error variations from Google / Firebase SDK
export function isApiKeyError(code: string = '', rawMsg: string = ''): boolean {
  const c = String(code).toLowerCase();
  const m = String(rawMsg).toLowerCase();
  return (
    c.includes('api-key-not-valid') ||
    c.includes('invalid-api-key') ||
    c.includes('api_key_invalid') ||
    c.includes('api-key') ||
    m.includes('api-key-not-valid') ||
    m.includes('api key not valid') ||
    m.includes('invalid api key') ||
    m.includes('please pass a valid api key')
  );
}

export function isOperationNotAllowed(code: string = '', rawMsg: string = ''): boolean {
  const c = String(code).toLowerCase();
  const m = String(rawMsg).toLowerCase();
  return c.includes('operation-not-allowed') || m.includes('operation not allowed');
}

export function isEmailAlreadyInUse(code: string = '', rawMsg: string = ''): boolean {
  const c = String(code).toLowerCase();
  const m = String(rawMsg).toLowerCase();
  return c.includes('email-already-in-use') || m.includes('email already in use');
}

// Configuration for project: skillswap-39167
export const firebaseConfig = {
  apiKey: getActiveApiKey(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'skillswap-39167.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'skillswap-39167',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'skillswap-39167.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '21093868263',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:21093868263:web:cdf7ca11f6e9c6e891f842',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-GWE9V79H3W',
};

// Initialize Firebase only once
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase modular services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Analytics: initialized conditionally only when supported and enabled in environment
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  // Prevent unhandled background Firebase installation / analytics rejections from crashing the UI
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = String(reason?.message || reason || '');
    if (isApiKeyError(reasonStr, reasonStr) || reasonStr.includes('installations') || reasonStr.includes('Installations')) {
      console.warn('[SkillSwap Firebase] Suppressed background installations notice:', reasonStr);
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
            console.warn('[SkillSwap Firebase] Analytics initialization skipped:', e);
            analytics = null;
          }
        }
      })
      .catch(() => {
        analytics = null;
      });
  }
}

// ----------------- STRUCTURED ERROR HANDLING -----------------
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
  console.error('[SkillSwap Firestore Error]:', JSON.stringify(errInfo));
  const err = new Error(JSON.stringify(errInfo));
  (err as any).code = (error as any)?.code || 'firestore/error';
  throw err;
}

// ----------------- CONNECTION DIAGNOSTICS -----------------
export interface FirebaseDiagnosticReport {
  timestamp: string;
  projectId: string;
  authDomain: string;
  storageBucket: string;
  apiKey: string;
  apiKeyMasked: string;
  isKeyFormatValid: boolean;
  auth: {
    status: 'ok' | 'error' | 'pending';
    code?: string;
    message?: string;
  };
  firestore: {
    status: 'ok' | 'error' | 'pending';
    code?: string;
    message?: string;
  };
  storage: {
    status: 'ok' | 'error' | 'pending';
    code?: string;
    message?: string;
  };
}

/**
 * Diagnostic utility to verify live Firebase connections and report exact error codes
 */
export async function runFirebaseDiagnostics(overrideKey?: string): Promise<FirebaseDiagnosticReport> {
  const currentKey = sanitizeApiKey(overrideKey || getActiveApiKey());
  const maskedKey = currentKey.length > 8 
    ? `${currentKey.substring(0, 6)}...${currentKey.substring(currentKey.length - 4)}` 
    : '***';

  const report: FirebaseDiagnosticReport = {
    timestamp: new Date().toISOString(),
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    apiKey: currentKey,
    apiKeyMasked: maskedKey,
    isKeyFormatValid: isValidApiKeyFormat(currentKey),
    auth: { status: 'pending' },
    firestore: { status: 'pending' },
    storage: { status: 'pending' },
  };

  // 1. Test Auth API Key & Identity Toolkit
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${encodeURIComponent(currentKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'diagnostic_probe@skillswap.edu',
          continueUri: window.location.origin,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      const errReason = data?.error?.message || data?.error?.errors?.[0]?.message || 'Unknown auth error';
      const errCode = data?.error?.details?.[0]?.reason || (res.status === 400 ? 'auth/api-key-not-valid' : `http_${res.status}`);
      report.auth = {
        status: 'error',
        code: errCode,
        message: errReason,
      };
    } else {
      report.auth = {
        status: 'ok',
        message: 'Firebase Authentication service is reachable and responsive.',
      };
    }
  } catch (fetchErr: any) {
    report.auth = {
      status: 'error',
      code: 'network/unreachable',
      message: fetchErr?.message || 'Network request failed. Unable to reach Identity Toolkit.',
    };
  }

  // 2. Test Firestore
  try {
    const testDoc = doc(db, 'users', auth.currentUser?.uid || 'probe_doc');
    await getDoc(testDoc);
    report.firestore = {
      status: 'ok',
      message: 'Cloud Firestore is connected and answering queries.',
    };
  } catch (fsErr: any) {
    const fsCode = fsErr?.code || 'firestore/error';
    const fsMsg = fsErr?.message || 'Firestore probe failed';
    if (fsCode === 'permission-denied') {
      report.firestore = {
        status: 'ok',
        code: 'permission-denied',
        message: 'Cloud Firestore is reachable (Security rules active).',
      };
    } else {
      report.firestore = {
        status: 'error',
        code: fsCode,
        message: fsMsg,
      };
    }
  }

  // 3. Test Storage Bucket
  try {
    if (storage.app) {
      report.storage = {
        status: 'ok',
        message: `Firebase Storage bucket "${firebaseConfig.storageBucket}" is initialized.`,
      };
    }
  } catch (stErr: any) {
    report.storage = {
      status: 'error',
      code: stErr?.code || 'storage/error',
      message: stErr?.message || 'Storage initialization failed',
    };
  }

  return report;
}
