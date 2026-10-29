import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, AuthActionResult } from '../context/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  Key,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
  User,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { FirebaseDiagnosticsModal } from '../components/FirebaseDiagnosticsModal';

export const CreateAccountPage: React.FC = () => {
  const { register, loginAsDemoStudent } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [collegeYear, setCollegeYear] = useState('2nd Year');
  const [department, setDepartment] = useState('Computer Engineering');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<AuthActionResult | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setSuccessMsg(null);

    // Form Validations
    if (!name.trim()) {
      setErrorDetails({ success: false, error: 'Please enter your full name.' });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorDetails({ success: false, error: 'Please enter a valid student email address.' });
      return;
    }

    if (password.length < 6) {
      setErrorDetails({ success: false, error: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      setErrorDetails({ success: false, error: 'Passwords do not match. Please re-enter identical passwords.' });
      return;
    }

    setIsLoading(true);
    const result = await register({
      name,
      email,
      password,
      collegeYear,
      department,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg(result.details || 'Account created successfully! Redirecting to your student dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setErrorDetails(result);
    }
  };

  const handleDemoStudentFallback = async () => {
    setIsLoading(true);
    await loginAsDemoStudent(email || 'adhavaishnavi@gmail.com');
    setIsLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create SkillSwap Account</h2>
          <p className="text-xs text-slate-500">
            Join your college peer learning and notes sharing network
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
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900">
                  {errorDetails.code ? `Registration Error [${errorDetails.code}]` : 'Registration Error'}
                </p>
                <p className="text-slate-700 leading-relaxed">{errorDetails.error}</p>
              </div>
            </div>

            {/* If Firebase API Key or Configuration Issue */}
            {errorDetails.isConfigIssue && (
              <div className="mt-3 pt-3 border-t border-rose-200/60 space-y-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Why this happened:</span>
                </div>
                <p className="text-slate-600 leading-normal">
                  Google Identity Toolkit reported that the API key configured for project{' '}
                  <code className="bg-rose-100 px-1 py-0.5 rounded font-mono text-[10px]">skillswap-39167</code> is
                  either restricted or pending activation in Firebase Console.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDiagnosticsModal(true)}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 text-center transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Check & Update Key</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoStudentFallback}
                    className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-center transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Enter Demo Mode</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Account Already Exists */}
            {errorDetails.code === 'auth/email-already-in-use' && (
              <div className="mt-2 pt-2 border-t border-rose-200/60 flex justify-end">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Go to Login Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Success Notice */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vaishnavi Adhav"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Year & Department Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Year</label>
              <select
                value={collegeYear}
                onChange={(e) => setCollegeYear(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="1st Year">1st Year (FE)</option>
                <option value="2nd Year">2nd Year (SE)</option>
                <option value="3rd Year">3rd Year (TE)</option>
                <option value="4th Year">4th Year (BE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white truncate"
              >
                <option value="Computer Engineering">Computer Engg</option>
                <option value="Information Technology">Information Tech</option>
                <option value="Electronics & Telecom">E&TC Engg</option>
                <option value="Mechanical Engineering">Mechanical Engg</option>
                <option value="Civil Engineering">Civil Engg</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password (min. 6 chars)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Creating Student Account...' : 'Create Account'}</span>
          </button>
        </form>

        {/* Link to Login */}
        <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100 flex items-center justify-between">
          <span>Already registered on SkillSwap?</span>
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Login
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
