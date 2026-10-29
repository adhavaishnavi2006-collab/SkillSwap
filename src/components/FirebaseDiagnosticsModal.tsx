import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  HardDrive,
  Key,
  Lock,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  firebaseConfig,
  runFirebaseDiagnostics,
  FirebaseDiagnosticReport,
  getActiveApiKey,
  setActiveApiKey,
} from '../firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialError?: string | null;
}

export const FirebaseDiagnosticsModal: React.FC<Props> = ({ isOpen, onClose, initialError }) => {
  const [report, setReport] = useState<FirebaseDiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keyUpdateNotice, setKeyUpdateNotice] = useState<string | null>(null);

  const executeDiagnostics = async () => {
    setIsRunning(true);
    setKeyUpdateNotice(null);
    try {
      const result = await runFirebaseDiagnostics();
      setReport(result);
    } catch (err: any) {
      console.error('[SkillSwap] Diagnostics error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCustomKeyInput(getActiveApiKey());
      executeDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = async () => {
    const trimmed = customKeyInput.trim().replace(/^["']|["']$/g, '');
    if (!trimmed) {
      setKeyUpdateNotice('Please enter an API key.');
      return;
    }
    setActiveApiKey(trimmed);
    setKeyUpdateNotice('API Key updated! Testing connection and reloading application...');
    setIsRunning(true);
    const testReport = await runFirebaseDiagnostics(trimmed);
    setReport(testReport);
    setIsRunning(false);

    if (testReport.auth.status === 'ok') {
      setKeyUpdateNotice('Valid API key verified! Reloading app in 1 second...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setKeyUpdateNotice(`Saved key, but probe returned: ${testReport.auth.message || testReport.auth.code}. Reload to apply anyway.`);
    }
  };

  const handleResetDefaultKey = () => {
    setActiveApiKey('');
    const defaultKey = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBK8vo5f2DBLX72-Kc7Nd-0pAEpG7gl8M8';
    setCustomKeyInput(defaultKey);
    setKeyUpdateNotice('Reset to default project API key. Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Firebase Connection Diagnostics</h3>
              <p className="text-xs text-slate-400">Project: <span className="font-mono text-indigo-300">skillswap-39167</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left text-xs">
          {initialError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <p className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Last Reported Firebase Action Error</span>
              </p>
              <p className="font-mono text-[11px] break-all">{initialError}</p>
            </div>
          )}

          {/* Active Configuration Table */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Active Client Configuration
            </h4>
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Project ID</span>
                <span className="font-semibold text-slate-700">{firebaseConfig.projectId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Auth Domain</span>
                <span className="font-semibold text-slate-700">{firebaseConfig.authDomain}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Storage Bucket</span>
                <span className="font-semibold text-slate-700">{firebaseConfig.storageBucket}</span>
              </div>
            </div>
          </div>

          {/* Live Diagnostic Checks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                Live Services Health Check
              </h4>
              <button
                onClick={executeDiagnostics}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Probing...' : 'Re-test Now'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Auth Card */}
              <div className={`p-3 rounded-xl border ${
                report?.auth.status === 'ok' 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                  : report?.auth.status === 'error'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Authentication</span>
                  </div>
                  {report?.auth.status === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {report?.auth.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                  {report?.auth.status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {report?.auth.message || (isRunning ? 'Testing identity toolkit...' : 'Pending check')}
                </p>
                {report?.auth.code && (
                  <p className="mt-1 font-mono text-[10px] text-rose-700 bg-rose-100/80 px-1 py-0.5 rounded inline-block">
                    {report.auth.code}
                  </p>
                )}
              </div>

              {/* Firestore Card */}
              <div className={`p-3 rounded-xl border ${
                report?.firestore.status === 'ok' 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                  : report?.firestore.status === 'error'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Database className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cloud Firestore</span>
                  </div>
                  {report?.firestore.status === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {report?.firestore.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                  {report?.firestore.status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {report?.firestore.message || (isRunning ? 'Testing database...' : 'Pending check')}
                </p>
              </div>

              {/* Storage Card */}
              <div className={`p-3 rounded-xl border ${
                report?.storage.status === 'ok' 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                  : report?.storage.status === 'error'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Firebase Storage</span>
                  </div>
                  {report?.storage.status === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {report?.storage.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                  {report?.storage.status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {report?.storage.message || (isRunning ? 'Checking bucket...' : 'Pending check')}
                </p>
              </div>
            </div>
          </div>

          {/* Web API Key Live Configurator */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Web API Key (Firebase Console / GCP)</span>
              </label>
              <button
                type="button"
                onClick={handleResetDefaultKey}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                Reset Default
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              If your Firebase project has an updated API key or key restrictions, you can paste it here to test immediately without rebuilding:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 font-mono text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
              >
                Apply & Test
              </button>
            </div>
            {keyUpdateNotice && (
              <p className="text-emerald-700 font-medium text-[11px]">{keyUpdateNotice}</p>
            )}
          </div>

          {/* Firebase Console Setup Steps */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2.5">
            <p className="font-bold text-indigo-900 flex items-center gap-1.5">
              <span>Required Settings in Firebase Console for skillswap-39167:</span>
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
              <li>
                <strong>Enable Email/Password Sign-In:</strong> Go to{' '}
                <a
                  href="https://console.firebase.google.com/project/skillswap-39167/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline font-semibold inline-flex items-center gap-0.5"
                >
                  Firebase Console &gt; Authentication &gt; Sign-in method <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                and enable <strong>Email/Password</strong>.
              </li>
              <li>
                <strong>Verify Web App API Key:</strong> Go to{' '}
                <a
                  href="https://console.firebase.google.com/project/skillswap-39167/settings/general"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline font-semibold inline-flex items-center gap-0.5"
                >
                  Project Settings &gt; General &gt; Your Apps <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                and confirm the <code>apiKey</code>.
              </li>
              <li>
                <strong>Check Google Cloud API Restrictions:</strong> In GCP Console under Credentials, verify the key allows <code>Identity Toolkit API</code> and has no restrictive domain blocks for preview run environments.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
