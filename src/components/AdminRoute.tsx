import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, ArrowLeft, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, currentUser, loading, refreshAdminToken } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const handleRefreshClaims = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    const nowAdmin = await refreshAdminToken();
    setIsRefreshing(false);
    if (nowAdmin) {
      setRefreshMessage('Administrative credentials verified! Loading dashboard...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      setRefreshMessage('Token refreshed. Account does not possess administrative authorization.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Verifying Administrative Credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Administrator Authentication Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please log in with an authorized college administrator account to view administrative records.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-left space-y-1">
            <p className="font-semibold text-slate-800">Designated College Administrator:</p>
            <p className="font-mono text-indigo-700 font-medium">adhavaishnavi2006@gmail.com</p>
          </div>
          <Link
            to="/login"
            state={{ from: { pathname: '/admin' } }}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors w-full shadow-xs"
          >
            Log in to SkillSwap
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-rose-200 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Administrative Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            You are signed in as <span className="font-semibold text-slate-800">{currentUser?.name}</span> (<code>{currentUser?.email}</code>), registered with role <span className="font-bold text-indigo-700">{currentUser?.role}</span>.
          </p>
          <p className="text-xs text-slate-500">
            This console is strictly restricted to verified college administrative faculty.
          </p>
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 text-left space-y-1">
            <p className="font-semibold text-slate-800">Authorized Administrator Account:</p>
            <p className="font-mono text-indigo-700 font-medium">adhavaishnavi2006@gmail.com</p>
          </div>

          {refreshMessage && (
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>{refreshMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleRefreshClaims}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Verifying Token...' : 'Refresh Admin Token / Claims'}</span>
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Student Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
