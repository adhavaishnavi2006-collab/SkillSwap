import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, currentUser } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Authentication Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            Please log in with an authorized college administrator account to view administrative records.
          </p>
          <Link
            to="/login"
            state={{ from: { pathname: '/admin' } }}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors w-full"
          >
            Log in as Administrator
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-rose-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-4">
            You are logged in as <span className="font-semibold text-slate-800">{currentUser?.name}</span> ({currentUser?.role}). This section is strictly restricted to verified college administrative faculty.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 mb-6 text-left">
            <p className="font-semibold text-slate-700 mb-1">Administrative Demo Account:</p>
            <p>Email: <code className="text-indigo-600 font-mono">admin@skillswap.edu</code></p>
            <p>Password: <code className="text-indigo-600 font-mono">admin123</code></p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
