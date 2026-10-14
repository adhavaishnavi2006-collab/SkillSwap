import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAdminMetrics,
  deleteSkillListing,
  deleteStudyNote,
  deleteGuidanceDoubt,
  getSkillListings,
  getStudyNotes,
  getGuidanceDoubts,
  getTransactions,
} from '../services/storage';
import {
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  IndianRupee,
  Shield,
  Trash2,
  Users,
  AlertCircle,
  BarChart3,
  Layers,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof getAdminMetrics>> | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'skills' | 'notes' | 'guidance' | 'payments'>('students');

  // Live item lists for moderation
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [doubtsList, setDoubtsList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [alert, setAlert] = useState<string | null>(null);

  const refreshAll = async () => {
    const [m, s, n, d, t] = await Promise.all([
      getAdminMetrics(),
      getSkillListings(),
      getStudyNotes(),
      getGuidanceDoubts(),
      getTransactions(),
    ]);
    setMetrics(m);
    setSkillsList(s);
    setNotesList(n);
    setDoubtsList(d);
    setTransactionsList(t);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleAdminDeleteSkill = async (id: string) => {
    if (window.confirm('Administrative Action: Are you sure you want to remove this skill listing?')) {
      await deleteSkillListing(id);
      setAlert('Skill listing removed from Firestore by administrator.');
      await refreshAll();
    }
  };

  const handleAdminDeleteNote = async (id: string) => {
    if (window.confirm('Administrative Action: Are you sure you want to remove this course note?')) {
      await deleteStudyNote(id);
      setAlert('Course note removed from Firestore by administrator.');
      await refreshAll();
    }
  };

  const handleAdminDeleteDoubt = async (id: string) => {
    if (window.confirm('Administrative Action: Are you sure you want to remove this guidance question?')) {
      await deleteGuidanceDoubt(id);
      setAlert('Guidance question removed from Firestore by administrator.');
      await refreshAll();
    }
  };

  if (!metrics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                SkillSwap Administrative Console
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                Authorized Faculty
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live college database auditing, enrollment analytics, and content moderation.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700 font-mono">
          <span>Logged in: </span>
          <span className="text-indigo-300 font-semibold">{currentUser?.email}</span>
        </div>
      </div>

      {alert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <span>{alert}</span>
          <button onClick={() => setAlert(null)} className="font-bold text-emerald-600">
            Dismiss
          </button>
        </div>
      )}

      {/* Real Statistics Calculated from Actual Database Records */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Enrolled Students</span>
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{metrics.totalStudents}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered student accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <ArrowLeftRight className="w-4 h-4 text-purple-600" />
            <span>Skill Listings</span>
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{metrics.totalSkills}</p>
          <span className="text-[11px] text-purple-600 mt-1 block">{metrics.activeRequests} pending swaps</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Uploaded Notes</span>
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{metrics.totalNotes}</p>
          <span className="text-[11px] text-blue-600 mt-1 block">Across all 4 years</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Guidance Doubts</span>
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{metrics.totalDoubts}</p>
          <span className="text-[11px] text-emerald-600 mt-1 block">{metrics.resolvedDoubtsCount} resolved</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-amber-600" />
            <span>Payment Volume</span>
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">₹{metrics.totalPaymentsVolume}</p>
          <span className="text-[11px] text-amber-600 mt-1 block">{metrics.verifiedTransactionsCount} verified orders</span>
        </div>

      </div>

      {/* Engineering Notes by Year Breakdown Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Curriculum Coverage: Notes Count by Engineering Year</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-slate-500">1st Year (FE)</span>
            <p className="text-lg font-bold text-blue-900 mt-0.5 tabular-nums">{metrics.totalNotesByYear['1st Year']} Notes</p>
          </div>
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <span className="text-slate-500">2nd Year (SE)</span>
            <p className="text-lg font-bold text-indigo-900 mt-0.5 tabular-nums">{metrics.totalNotesByYear['2nd Year']} Notes</p>
          </div>
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <span className="text-slate-500">3rd Year (TE)</span>
            <p className="text-lg font-bold text-purple-900 mt-0.5 tabular-nums">{metrics.totalNotesByYear['3rd Year']} Notes</p>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-slate-500">4th Year (BE)</span>
            <p className="text-lg font-bold text-emerald-900 mt-0.5 tabular-nums">{metrics.totalNotesByYear['4th Year']} Notes</p>
          </div>
        </div>
      </div>

      {/* Distinct Admin Management Sections via Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Registered Students Registry ({metrics.usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'skills'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Skill Swap Moderation ({skillsList.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'notes'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Notes Moderation ({notesList.length})
        </button>
        <button
          onClick={() => setActiveTab('guidance')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'guidance'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Guidance Moderation ({doubtsList.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Verified Payments Ledger ({transactionsList.length})
        </button>
      </div>

      {/* Tab: Student Registrations */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-left">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Registered Student Accounts</h3>
            <p className="text-xs text-slate-500">Live roster of all student and faculty accounts in the college database.</p>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Class / Year</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Joined At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {metrics.usersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{usr.name}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{usr.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        usr.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{usr.collegeYear}</td>
                  <td className="py-3 px-4 text-slate-600">{usr.department}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(usr.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Skill Moderation */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-left">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Skill Swap Listings Moderation</h3>
            <p className="text-xs text-slate-500">Review student offerings and remove outdated or non-compliant listings.</p>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Offered Skill</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Offered By</th>
                <th className="py-3 px-4 font-semibold">Requested In Return</th>
                <th className="py-3 px-4 font-semibold">Exchange Type</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skillsList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{s.skillOffered}</td>
                  <td className="py-3 px-4 text-slate-600">{s.category}</td>
                  <td className="py-3 px-4 text-slate-600">{s.userName} ({s.userYear})</td>
                  <td className="py-3 px-4 text-slate-600">{s.skillRequested}</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-slate-700">
                      {s.exchangeType === 'free' ? 'Free Swap' : `Paid (₹${s.hourlyRate})`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleAdminDeleteSkill(s.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                      title="Admin Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Notes Moderation */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-left">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Uploaded Study Notes Moderation</h3>
            <p className="text-xs text-slate-500">Inspect syllabus alignment, PDF file sizes, and year classifications.</p>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Note Title</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Class / Year</th>
                <th className="py-3 px-4 font-semibold">Pages / Size</th>
                <th className="py-3 px-4 font-semibold">Uploader</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notesList.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{n.title}</td>
                  <td className="py-3 px-4 text-slate-600">{n.subject}</td>
                  <td className="py-3 px-4 font-medium text-blue-700">{n.engineeringYear}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {n.totalPages}p ({(n.fileSize / (1024 * 1024)).toFixed(1)} MB)
                  </td>
                  <td className="py-3 px-4 text-slate-600">{n.uploaderName}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleAdminDeleteNote(n.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                      title="Admin Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Guidance Moderation */}
      {activeTab === 'guidance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-left">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Academic Guidance Doubts Moderation</h3>
            <p className="text-xs text-slate-500">Ensure campus discussions remain respectful, academic, and well-categorized.</p>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Question Title</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Author</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Answers</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doubtsList.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{d.title}</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">{d.category}</td>
                  <td className="py-3 px-4 text-slate-600">{d.studentName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${d.status === 'resolved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 tabular-nums">{d.answers.length}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleAdminDeleteDoubt(d.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                      title="Admin Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Payments Ledger */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-left">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verified Payment Transactions Audit</h3>
              <p className="text-xs text-slate-500">All real recorded payments for study notes and skill swap sessions.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Gross Processed: </span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">₹{metrics.totalPaymentsVolume}</span>
            </div>
          </div>
          {transactionsList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No transactions recorded in the ledger yet.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Item Purchased</th>
                  <th className="py-3 px-4 font-semibold">Payment Gateway / Method</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Audit Status</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {transactionsList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{tx.orderId}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{tx.userName}</td>
                    <td className="py-3 px-4 text-slate-700">{tx.itemTitle}</td>
                    <td className="py-3 px-4 text-slate-500">{tx.paymentMethod}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">₹{tx.amount}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(tx.verifiedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
};
