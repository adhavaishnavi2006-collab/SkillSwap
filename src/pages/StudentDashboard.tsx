import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  SkillSwapListing,
  SkillSwapRequest,
  StudyNote,
  NoteAccessRecord,
  GuidanceDoubt,
  PaymentTransaction,
} from '../types';
import {
  getSkillListings,
  getSkillRequests,
  getStudyNotes,
  getNoteAccessRecords,
  getGuidanceDoubts,
  getTransactions,
  deleteSkillListing,
  deleteStudyNote,
  updateSwapRequestStatus,
  getStudyNoteById,
} from '../services/storage';
import { downloadNotePDF } from '../services/pdfService';
import {
  ArrowLeftRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  HelpCircle,
  Loader2,
  Mail,
  Plus,
  Shield,
  Trash2,
  Unlock,
  User,
  X,
  AlertCircle,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'notes' | 'guidance' | 'payments'>('overview');

  const [mySkills, setMySkills] = useState<SkillSwapListing[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<SkillSwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SkillSwapRequest[]>([]);
  const [myUploadedNotes, setMyUploadedNotes] = useState<StudyNote[]>([]);
  const [myUnlockedNotes, setMyUnlockedNotes] = useState<StudyNote[]>([]);
  const [myDoubts, setMyDoubts] = useState<GuidanceDoubt[]>([]);
  const [myAnswersCount, setMyAnswersCount] = useState<number>(0);
  const [myTransactions, setMyTransactions] = useState<PaymentTransaction[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [downloadingNoteId, setDownloadingNoteId] = useState<string | null>(null);

  const loadStudentData = async () => {
    if (!currentUser) return;

    const [allSkills, allRequests, allNotes, accessRecords, allDoubts, allTxns] = await Promise.all([
      getSkillListings(),
      getSkillRequests(),
      getStudyNotes(),
      getNoteAccessRecords(),
      getGuidanceDoubts(),
      getTransactions(),
    ]);

    setMySkills(allSkills.filter((s) => s.userId === currentUser.id));
    setIncomingRequests(allRequests.filter((r) => r.ownerId === currentUser.id));
    setOutgoingRequests(allRequests.filter((r) => r.requesterId === currentUser.id));
    setMyUploadedNotes(allNotes.filter((n) => n.uploaderId === currentUser.id));

    const myAccessIds = accessRecords
      .filter((r) => r.userId === currentUser.id && r.accessMethod !== 'uploader')
      .map((r) => r.noteId);
    setMyUnlockedNotes(allNotes.filter((n) => myAccessIds.includes(n.id)));

    setMyDoubts(allDoubts.filter((d) => d.studentId === currentUser.id));

    let ansCount = 0;
    allDoubts.forEach((d) => {
      d.answers.forEach((a) => {
        if (a.authorId === currentUser.id) ansCount++;
      });
    });
    setMyAnswersCount(ansCount);

    setMyTransactions(allTxns.filter((t) => t.userId === currentUser.id));
  };

  useEffect(() => {
    loadStudentData();
  }, [currentUser]);

  const handleDownloadNote = async (note: StudyNote) => {
    if (downloadingNoteId === note.id) return;
    if (!currentUser) return;

    setDownloadingNoteId(note.id);
    setAlert('Preparing your PDF download…');

    const res = await downloadNotePDF(note, currentUser, currentUser.role === 'admin');
    setDownloadingNoteId(null);

    if (res.success) {
      setAlert('Download started successfully.');
      await loadStudentData();
    } else {
      setAlert(res.error || 'Download failed. Please try again.');
    }
  };

  const handleDownloadById = async (noteId: string) => {
    setAlert('Preparing your PDF download…');
    const note = await getStudyNoteById(noteId);
    if (!note) {
      setAlert('This file is no longer available.');
      return;
    }
    await handleDownloadNote(note);
  };

  const handleRequestStatus = async (reqId: string, status: 'accepted' | 'rejected' | 'completed') => {
    const res = await updateSwapRequestStatus(reqId, status);
    if (res.success) {
      setAlert(
        status === 'completed'
          ? 'Skill exchange marked as completed! Any shared course resources have been unlocked.'
          : `Request ${status} successfully in Firestore.`
      );
      await loadStudentData();
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this skill listing?')) {
      await deleteSkillListing(id);
      await loadStudentData();
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this study note?')) {
      await deleteStudyNote(id);
      await loadStudentData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Student Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-100">
            {currentUser?.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {currentUser?.name}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {currentUser?.collegeYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{currentUser?.department}</span>
              <span>·</span>
              <span>{currentUser?.email}</span>
            </p>
          </div>
        </div>

        {/* Quick Summary Pill Row (Real Data only) */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/skill-swap"
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Skill</span>
          </Link>
          <Link
            to="/notes"
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Notes</span>
          </Link>
          <Link
            to="/guidance"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ask Doubt</span>
          </Link>
        </div>
      </div>

      {alert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <span>{alert}</span>
          <button onClick={() => setAlert(null)} className="text-emerald-600 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Activity Overview
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'skills'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Skills & Requests ({mySkills.length + incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'notes'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Notes ({myUploadedNotes.length + myUnlockedNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('guidance')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'guidance'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Guidance ({myDoubts.length} asked, {myAnswersCount} answers)
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Payments & Transactions ({myTransactions.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Real Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
              <span className="text-xs text-slate-500 font-medium">Skills Offered</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{mySkills.length}</p>
              <span className="text-[11px] text-indigo-600 mt-1 block">Active on Skill Swap</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
              <span className="text-xs text-slate-500 font-medium">Uploaded Notes</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{myUploadedNotes.length}</p>
              <span className="text-[11px] text-blue-600 mt-1 block">Verified PDFs</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
              <span className="text-xs text-slate-500 font-medium">Guidance Answered</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{myAnswersCount}</p>
              <span className="text-[11px] text-emerald-600 mt-1 block">Community Solutions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
              <span className="text-xs text-slate-500 font-medium">Pending Inbound Requests</span>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {incomingRequests.filter((r) => r.status === 'pending').length}
              </p>
              <span className="text-[11px] text-amber-600 mt-1 block">Awaiting your response</span>
            </div>
          </div>

          {/* Incoming requests review strip if any */}
          {incomingRequests.filter((r) => r.status === 'pending').length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs text-left space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Pending Skill Exchange Requests</span>
              </h3>
              <div className="space-y-2">
                {incomingRequests
                  .filter((r) => r.status === 'pending')
                  .map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {req.requesterName} ({req.requesterYear}) requested: <span className="text-indigo-600">{req.listingTitle}</span>
                        </p>
                        <p className="text-slate-600 mt-0.5">Offered in return: <span className="font-medium text-slate-800">{req.proposedSkill}</span></p>
                        <p className="text-slate-400 italic">"{req.message}"</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRequestStatus(req.id, 'rejected')}
                          className="px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRequestStatus(req.id, 'accepted')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                        >
                          Accept Swap
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: My Skills */}
      {activeTab === 'skills' && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">My Skill Swap Listings ({mySkills.length})</h3>
            <Link
              to="/skill-swap"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Skill</span>
            </Link>
          </div>

          {mySkills.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-xs text-slate-500">
              You haven't posted any skill listings yet. Offer a skill on the Skill Swap page to begin peer exchanging!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySkills.map((s) => (
                <div key={s.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-700">{s.category}</span>
                    <button onClick={() => handleDeleteListing(s.id)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{s.skillOffered}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{s.description}</p>
                  <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                    Seeking: <span className="font-medium text-slate-800">{s.skillRequested}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Incoming Requests on Your Skills */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Incoming Exchange Requests Received ({incomingRequests.length})</h3>
            {incomingRequests.length === 0 ? (
              <p className="text-xs text-slate-400">No students have requested exchanges on your skills yet.</p>
            ) : (
              <div className="space-y-2">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{req.requesterName} ({req.requesterYear})</p>
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            req.status === 'completed'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : req.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : req.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">Requested: <span className="text-indigo-600 font-medium">{req.listingTitle}</span></p>
                      <p className="text-slate-500">Offered in return: <span className="font-medium text-slate-800">{req.proposedSkill}</span></p>
                      {req.sharedNoteTitle && (
                        <p className="text-indigo-600 text-[11px] font-medium">Attached study guide: {req.sharedNoteTitle}</p>
                      )}
                      <p className="text-slate-400 italic">"{req.message}"</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestStatus(req.id, 'rejected')}
                            className="px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRequestStatus(req.id, 'accepted')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                          >
                            Accept Swap
                          </button>
                        </>
                      )}
                      {req.status === 'accepted' && (
                        <button
                          onClick={() => handleRequestStatus(req.id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}
                      {req.status === 'completed' && req.sharedNoteId && (
                        <button
                          disabled={downloadingNoteId === req.sharedNoteId}
                          onClick={() => handleDownloadById(req.sharedNoteId!)}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          {downloadingNoteId === req.sharedNoteId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>Download Exchanged PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Outgoing Exchange Requests Sent ({outgoingRequests.length})</h3>
            {outgoingRequests.length === 0 ? (
              <p className="text-xs text-slate-400">You haven't requested any skill swaps from other students yet.</p>
            ) : (
              <div className="space-y-2">
                {outgoingRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{req.listingTitle}</p>
                      <p className="text-slate-500">Your proposed skill: {req.proposedSkill}</p>
                      {req.sharedNoteTitle && (
                        <p className="text-indigo-600 text-[11px] font-medium">Exchanged resource: {req.sharedNoteTitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          req.status === 'completed'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : req.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                      {req.status === 'completed' && req.sharedNoteId && (
                        <button
                          disabled={downloadingNoteId === req.sharedNoteId}
                          onClick={() => handleDownloadById(req.sharedNoteId!)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          {downloadingNoteId === req.sharedNoteId ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          <span>Download Exchanged PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: My Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6 text-left">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Notes You Have Uploaded ({myUploadedNotes.length})</h3>
              <Link to="/notes" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Notes</span>
              </Link>
            </div>
            {myUploadedNotes.length === 0 ? (
              <p className="text-xs text-slate-400 bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                You haven't uploaded any study notes yet. Upload your PDF notes to help peers and enable free note exchanges!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myUploadedNotes.map((n) => (
                  <div key={n.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-700">{n.engineeringYear} · {n.subject}</span>
                      <span className="text-slate-400 text-[11px]">{n.downloadsCount || 0} downloads</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-500">{n.totalPages} pages · {(n.fileSize / (1024 * 1024)).toFixed(1)} MB PDF</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        disabled={downloadingNoteId === n.id}
                        onClick={() => handleDownloadNote(n)}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {downloadingNoteId === n.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>Download PDF</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Unlocked / Purchased Notes ({myUnlockedNotes.length})</h3>
            {myUnlockedNotes.length === 0 ? (
              <p className="text-xs text-slate-400">You have not unlocked any peer notes through swap or purchase yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myUnlockedNotes.map((n) => (
                  <div key={n.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Fully Unlocked
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-500">By {n.uploaderName} · {n.totalPages} pages</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        disabled={downloadingNoteId === n.id}
                        onClick={() => handleDownloadNote(n)}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {downloadingNoteId === n.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>Download PDF</span>
                      </button>
                      <Link
                        to="/notes"
                        className="inline-block text-xs font-semibold text-blue-600 hover:underline px-2 py-1.5"
                      >
                        Open Reader →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Guidance */}
      {activeTab === 'guidance' && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Questions You Asked ({myDoubts.length})</h3>
            <Link to="/guidance" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Ask a Question</span>
            </Link>
          </div>

          {myDoubts.length === 0 ? (
            <p className="text-xs text-slate-400 bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center">
              You haven't submitted any guidance questions yet. Guidance is 100% free for all students!
            </p>
          ) : (
            <div className="space-y-3">
              {myDoubts.map((d) => (
                <div key={d.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-700">{d.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${d.status === 'resolved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                      {d.status === 'resolved' ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{d.title}</h4>
                  <p className="text-slate-500">{d.answers.length} answers received</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Payments History (Real Transactions only) */}
      {activeTab === 'payments' && (
        <div className="space-y-4 text-left">
          <h3 className="text-base font-bold text-slate-900">Your Verified Transaction History ({myTransactions.length})</h3>
          <p className="text-xs text-slate-500">
            Records of verified payments for full notes unlocks or 1-on-1 skill assistance sessions.
          </p>

          {myTransactions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-xs text-slate-400">
              No transactions recorded. All peer swaps and free guidance generate zero charges.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Order / Txn ID</th>
                    <th className="py-3 px-4 font-semibold">Item Details</th>
                    <th className="py-3 px-4 font-semibold">Method</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {myTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{tx.orderId}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{tx.itemTitle}</td>
                      <td className="py-3 px-4 text-slate-500">{tx.paymentMethod}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">₹{tx.amount}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(tx.verifiedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
