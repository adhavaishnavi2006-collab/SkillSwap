import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftRight,
  BookOpen,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleServiceClick = (targetPath: string) => {
    if (isAuthenticated) {
      navigate(targetPath);
    } else {
      // Guide to login with target path saved
      navigate('/login', { state: { from: { pathname: targetPath } } });
    }
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-xs font-semibold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Campus Peer Learning Network</span>
              <span className="text-slate-300">·</span>
              <span>Computer Engineering</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15] text-balance">
              Learn, Share, Earn & Grow Together.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              SkillSwap is a dedicated platform built for college students to exchange technical skills, share verified semester notes across all engineering years, and receive completely free academic guidance from peers.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#services"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <span>Explore Services</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <Link
                to={isAuthenticated ? '/dashboard' : '/create-account'}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                {isAuthenticated ? 'Go to Student Dashboard' : 'Get Started'}
              </Link>
            </div>

            {/* Real Key Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-900 text-base tabular-nums">100% Free</p>
                <p className="text-slate-500 mt-0.5">Academic Guidance</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base tabular-nums">1st to 4th Year</p>
                <p className="text-slate-500 mt-0.5">Engineering Notes</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base tabular-nums">P2P Swaps</p>
                <p className="text-slate-500 mt-0.5">Free or Paid Help</p>
              </div>
            </div>
          </div>

          {/* Interactive Hero Visual Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-gradient-to-tr from-indigo-100 via-purple-50 to-pink-50 p-6 rounded-3xl border border-indigo-100 shadow-xl">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">SkillSwap Live Feed</p>
                      <p className="text-[10px] text-slate-400">Campus Active Exchanges</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    College Network
                  </span>
                </div>

                {/* Micro Preview 1: Skill Swap */}
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-left">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Skill Swap Request</span>
                    </span>
                    <span className="text-xs font-medium text-indigo-600">Free Exchange</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800">
                    Offering: C++ Trees & Graphs
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Seeking: Figma UI Wireframing
                  </p>
                </div>

                {/* Micro Preview 2: Notes */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-left">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-blue-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verified Notes</span>
                    </span>
                    <span className="text-xs font-medium text-blue-600">2nd Year</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800">
                    DBMS Exam Review & Normalization Guide
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>5 Pages Free Preview · Controlled Unlock</span>
                  </p>
                </div>

                {/* Micro Preview 3: Guidance */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-left">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Guidance Query</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Always Free</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800">
                    Why Merge Sort is preferred for Linked Lists?
                  </p>
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Answer accepted by question author</span>
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Exactly THREE Main Services Section */}
      <section id="services" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
            Campus Learning Ecosystem
          </h2>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
            Our Three Dedicated Services
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            SkillSwap focuses on three core pillars designed specifically for college students to succeed academically and develop practical skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Skill Swap (Lavender and Indigo theme) */}
          <div className="flex flex-col justify-between bg-white rounded-3xl p-7 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/80 rounded-bl-full pointer-events-none -z-0" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                <ArrowLeftRight className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">Skill Swap</h4>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                  Knowledge Exchange & Mentorship
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Exchange knowledge with fellow students. Offer skills you know and request skills you want to learn. Support both free peer swaps and optional paid 1-on-1 assistance.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Programming, Design, Academics, Fitness</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Free mutual exchange or optional student rate</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Manage incoming requests with Accept/Reject</span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 pt-6">
              <button
                onClick={() => handleServiceClick('/skill-swap')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Skill Swap</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Notes (Blue and Lavender theme) */}
          <div className="flex flex-col justify-between bg-white rounded-3xl p-7 border border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/80 rounded-bl-full pointer-events-none -z-0" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">Notes</h4>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">
                  Engineering Notes Library
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Discover and share study notes organized by engineering year (1st, 2nd, 3rd, and 4th Year). Upload verified PDF notes with controlled access and transparent previewing.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Organized by 1st, 2nd, 3rd & 4th Year Engineering</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>First 5 pages free preview on all notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Exchange with your notes or student paid access</span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 pt-6">
              <button
                onClick={() => handleServiceClick('/notes')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Notes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: Guidance (Mint green with purple accents) */}
          <div className="flex flex-col justify-between bg-white rounded-3xl p-7 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/80 rounded-bl-full pointer-events-none -z-0" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">Guidance</h4>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  100% Free Academic Help
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Ask academic questions and get help from fellow students. Support programming, DSA, web development, databases, engineering projects, and career preparation.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Completely free for all students — always</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Categories: DSA, Databases, Web, Projects, Career</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Peer responses with verified accepted solutions</span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 pt-6">
              <button
                onClick={() => handleServiceClick('/guidance')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Get Guidance</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* About Section with Authentic Project Team Information */}
      <section id="about" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="max-w-3xl mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              About SkillSwap
            </h2>
            <h3 className="text-3xl font-bold tracking-tight mb-4">
              A Student-Focused Learning Community
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              SkillSwap was conceived as a second-year Computer Engineering project to solve an authentic campus challenge: students frequently have complementary strengths — one excels at C++ Data Structures while another excels at UI design or database normalization. By bringing skill swaps, semester notes, and free academic guidance under one roof, we empower students to learn collaboratively, share notes, earn recognition or fair peer rewards, and grow together.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Project Team Members</span>
            </h4>

            {/* Exactly the genuine project team details supplied in user prompt */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-sm mb-3">
                  VA
                </div>
                <h5 className="text-base font-bold text-white">Vaishnavi Adhav</h5>
                <p className="text-xs text-slate-400 mt-0.5">Computer Engineering</p>
                <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                  <a href="tel:9405079100" className="flex items-center gap-2 text-slate-300 hover:text-indigo-300 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>9405079100</span>
                  </a>
                  <a href="mailto:adhavaishnavi@gmail.com" className="flex items-center gap-2 text-slate-300 hover:text-indigo-300 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">adhavaishnavi@gmail.com</span>
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-sm mb-3">
                  SK
                </div>
                <h5 className="text-base font-bold text-white">Shruti Kulkarni</h5>
                <p className="text-xs text-slate-400 mt-0.5">Computer Engineering</p>
                <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                  <a href="tel:7620338995" className="flex items-center gap-2 text-slate-300 hover:text-indigo-300 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>7620338995</span>
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm mb-3">
                  SB
                </div>
                <h5 className="text-base font-bold text-white">Shubham Biradar</h5>
                <p className="text-xs text-slate-400 mt-0.5">Computer Engineering</p>
                <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                  <a href="tel:7758971314" className="flex items-center gap-2 text-slate-300 hover:text-indigo-300 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>7758971314</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* College Architecture & Trust Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Designed for Second-Year Computer Engineering
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-stack architecture featuring role-based authorization, client-side cryptographic hashing, and modular service separation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/skill-swap"
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Browse Skills
            </Link>
            <Link
              to="/notes"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Browse Notes
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
