import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, BookOpen, GraduationCap, HelpCircle, LayoutDashboard, LogOut, Menu, ShieldCheck, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
      isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Strict 3-zone top bar contract: Zone 1 (Wordmark) - Zone 2 (4-5 Nav Links) - Zone 3 (Primary Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single element brand wordmark */}
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            SkillSwap
          </span>
        </Link>

        {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/skill-swap" className={navLinkClass}>
            Skill Swap
          </NavLink>
          <NavLink to="/notes" className={navLinkClass}>
            Notes
          </NavLink>
          <NavLink to="/guidance" className={navLinkClass}>
            Guidance
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Zone 3: Primary Action / Auth Buttons */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0"
              >
                Login
              </Link>
              <Link
                to="/create-account"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                Create Account
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="View Student Dashboard"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-slate-800 leading-tight truncate max-w-[110px]">
                    {currentUser?.name}
                  </p>
                  <p className="text-slate-400 text-[11px] leading-tight">
                    {currentUser?.role === 'admin' ? 'Admin' : currentUser?.collegeYear}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="Sign out of SkillSwap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </NavLink>
          <NavLink
            to="/skill-swap"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            Skill Swap
          </NavLink>
          <NavLink
            to="/notes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            Notes
          </NavLink>
          <NavLink
            to="/guidance"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            Guidance
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              <LayoutDashboard className="w-4 h-4 text-purple-600" />
              Student Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Dashboard
            </NavLink>
          )}

          <div className="pt-4 border-t border-slate-200">
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/create-account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{currentUser?.name}</p>
                  <p className="text-xs text-slate-500">{currentUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
