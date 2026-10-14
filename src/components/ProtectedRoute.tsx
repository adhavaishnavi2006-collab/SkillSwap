import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Verifying Firebase Authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login while saving the requested path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
