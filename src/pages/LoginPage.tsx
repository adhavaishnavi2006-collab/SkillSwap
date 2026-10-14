import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, GraduationCap, Lock, LogIn, Mail, RefreshCw } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your registered email address and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate(fromPath, { replace: true });
    } else {
      setErrorMsg(result.error || 'Invalid email or password.');
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setEmail(demoEmail);
    const demoPass = demoEmail === 'admin@skillswap.edu' ? 'admin123' : 'student123';
    setPassword(demoPass);

    const result = await login(demoEmail, demoPass);
    if (result.success) {
      navigate(fromPath, { replace: true });
    } else {
      // If user is not yet created in the Firebase Authentication project, bootstrap it smoothly
      const reg = await register({
        name: demoEmail === 'admin@skillswap.edu' ? 'Administrator' : 'Vaishnavi Adhav',
        email: demoEmail,
        password: demoPass,
        collegeYear: demoEmail === 'admin@skillswap.edu' ? 'Staff' : '2nd Year',
        department: 'Computer Engineering',
      });
      if (reg.success) {
        navigate(fromPath, { replace: true });
      } else {
        setErrorMsg(result.error || 'Authentication error. Please check or register.');
      }
    }
    setIsLoading(false);
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
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
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
        <div className="pt-1 text-center text-xs text-slate-600">
          <span>Do not have an account yet? </span>
          <Link to="/create-account" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
};
