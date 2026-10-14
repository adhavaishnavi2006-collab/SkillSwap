import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoredUsers, hashPassword } from '../services/storage';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldAlert } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [foundUser, setFoundUser] = useState<boolean>(false);

  const handleLookupEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const users = getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      setStatusMsg({
        type: 'error',
        text: 'No student or faculty account found registered with this email address.',
      });
      setFoundUser(false);
      return;
    }

    setFoundUser(true);
    setStatusMsg({
      type: 'info',
      text: `Account found for ${user.name}. In this college project runtime (without an external SMTP mailer relay), you can reset your local password securely below.`,
    });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsVerifying(true);
    const users = getStoredUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (userIndex !== -1) {
      const newHash = await hashPassword(newPassword);
      users[userIndex].passwordHash = newHash;
      localStorage.setItem('skillswap_users_v2', JSON.stringify(users));
      setIsVerifying(false);
      setStatusMsg({
        type: 'success',
        text: 'Your password has been updated securely with cryptographic hashing! You can now log in with your new password.',
      });
      setFoundUser(false);
      setEmail('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setIsVerifying(false);
      setStatusMsg({ type: 'error', text: 'Account could not be updated.' });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Password Recovery</h2>
          <p className="text-xs text-slate-500">
            Recover and reset your registered SkillSwap account credentials
          </p>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
              statusMsg.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                : statusMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
            }`}
          >
            {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
            {statusMsg.type === 'info' && <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {!foundUser ? (
          <form onSubmit={handleLookupEmail} className="space-y-4 text-left">
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
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Verify Registered Account
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 mt-2"
            >
              {isVerifying ? 'Updating...' : 'Set New Secure Password'}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
          <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
