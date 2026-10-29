import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, BookOpen, GraduationCap, HelpCircle, Mail, Phone, Users, ShieldCheck } from 'lucide-react';
import { FirebaseDiagnosticsModal } from './FirebaseDiagnosticsModal';

export const Footer: React.FC = () => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">SkillSwap</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              A student-focused platform for students of the same college to exchange skills, access verified study notes, and receive academic guidance.
            </p>
            <p className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Learn • Share • Earn • Grow
            </p>
          </div>

          {/* Exactly 3 Main Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Our 3 Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/skill-swap" className="flex items-center gap-2 hover:text-white transition-colors">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Skill Swap</span>
                </Link>
              </li>
              <li>
                <Link to="/notes" className="flex items-center gap-2 hover:text-white transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Notes Library (1st-4th Year)</span>
                </Link>
              </li>
              <li>
                <Link to="/guidance" className="flex items-center gap-2 hover:text-white transition-colors">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Academic Guidance</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Genuine Project Team */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Project Team & Contact</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <p className="font-semibold text-white text-sm">Vaishnavi Adhav</p>
                <p className="text-slate-400 mt-0.5">Computer Engineering</p>
                <div className="mt-2.5 space-y-1">
                  <a href="tel:9405079100" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-300 transition-colors">
                    <Phone className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>9405079100</span>
                  </a>
                  <a href="mailto:adhavaishnavi@gmail.com" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-300 transition-colors truncate">
                    <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">adhavaishnavi@gmail.com</span>
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <p className="font-semibold text-white text-sm">Shruti Kulkarni</p>
                <p className="text-slate-400 mt-0.5">Computer Engineering</p>
                <div className="mt-2.5">
                  <a href="tel:7620338995" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-300 transition-colors">
                    <Phone className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>7620338995</span>
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <p className="font-semibold text-white text-sm">Shubham Biradar</p>
                <p className="text-slate-400 mt-0.5">Computer Engineering</p>
                <div className="mt-2.5">
                  <a href="tel:7758971314" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-300 transition-colors">
                    <Phone className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>7758971314</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with demo credentials hint and Firebase status */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SkillSwap Platform. Built for Second-Year Computer Engineering College Project.</p>
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <button
              onClick={() => setShowDiagnostics(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firebase: <strong className="font-mono text-white">skillswap-39167</strong></span>
            </button>
            <span>·</span>
            <span>Student Demo: <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">adhavaishnavi@gmail.com</code></span>
          </div>
        </div>
      </div>

      <FirebaseDiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </footer>
  );
};
