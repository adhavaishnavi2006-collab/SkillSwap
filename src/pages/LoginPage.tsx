import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, AuthActionResult } from '../context/AuthContext';
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Key,
  Lock,
  LogIn,
  Mail,
  RefreshCw,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { FirebaseDiagnosticsModal } from '../components/FirebaseDiagnosticsModal';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemoStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<AuthActionResult | null>(null);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);

    if (!email.trim() || !password.trim()) {
      setErrorDetails({ success: false, error: 'Please enter both your registered email address and password.' });
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate(fromPath, { replace: true });
    } else {
      setErrorDetails(result);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setIsLoading(true);
    setErrorDetails(null);
    setEmail(demoEmail);
    const demoPass = demoEmail === 'admin@skillswap.edu' ? 'admin123' : 'student123';
    setPassword(demoPass);

    // First attempt real Firebase login
    const result = await login(demoEmail, demoPass);
    if (result.success) {
      setIsLoading(false);
      navigate(fromPath, { replace: true });
      return;
    }

    // If Firebase Auth fails (e.g. invalid API key or account not created yet), provide seamless demo access
    console.log('[SkillSwap Demo] Falling back to verified demo session...');
    await loginAsDemoStudent(demoEmail);
    setIsLoading(false);
    navigate(fromPath, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Login to SkillSwap</h2>
          <p className="text-xs text-slate-500">
            Powered by Firebase Authentication & Firestore
          </p>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setShowDiagnosticsModal(true)}
              className="text-[11px] text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Project: <strong>skillswap-39167</strong></span>
              <Wrench className="w-2.5 h-2.5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {errorDetails && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900">
                  {errorDetails.code ? `Login Error [${errorDetails.code}]` : 'Login Error'}
                </p>
                <p className="text-slate-700 leading-relaxed">{errorDetails.error}</p>
              </div>
            </div>

            {errorDetails.isConfigIssue && (
              <div className="pt-2 border-t border-rose-200/60 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiagnosticsModal(true)}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 text-center text-xs"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Configure API Key</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('adhavaishnavi@gmail.com')}
                  className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold flex items-center justify-center gap-1.5 text-center text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Use Demo Account</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Registered Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating with Firebase...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Switcher */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 text-center uppercase tracking-wider mb-2">
            Quick College Demo Sign-In
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('adhavaishnavi@gmail.com')}
              className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors text-center"
            >
              Student (Vaishnavi)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@skillswap.edu')}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-center"
            >
              Administrator
            </button>
          </div>
        </div>

        {/* Link to Create Account */}
        <div className="pt-1 text-center text-xs text-slate-600 flex items-center justify-between">
          <span>Do not have an account yet?</span>
          <Link to="/create-account" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Create Account
          </Link>
        </div>

      </div>

      {/* Firebase Diagnostics Modal */}
      <FirebaseDiagnosticsModal
        isOpen={showDiagnosticsModal}
        onClose={() => setShowDiagnosticsModal(false)}
        initialError={errorDetails?.error}
      />
    </div>
  );
};
