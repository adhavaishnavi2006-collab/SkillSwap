import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { EngineeringYear, StudyNote } from '../types';
import {
  getStudyNotes,
  getNoteAccessRecords,
  uploadStudyNoteWithStorage,
  deleteStudyNote,
  unlockNoteViaExchange,
} from '../services/storage';
import { PaymentModal } from '../components/PaymentModal';
import { downloadNotePDF } from '../services/pdfService';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Loader2,
  Lock,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Unlock,
  Upload,
  X,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

const ENGINEERING_YEARS: EngineeringYear[] = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
];

export const NotesPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Modals & Reader
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeReadingNote, setActiveReadingNote] = useState<StudyNote | null>(null);
  const [readerCurrentPage, setReaderCurrentPage] = useState<number>(1);
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    note: StudyNote | null;
  }>({ isOpen: false, note: null });

  // Upload Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState<EngineeringYear>('2nd Year');
  const [description, setDescription] = useState('');
  const [accessType, setAccessType] = useState<'free_exchange' | 'paid'>('free_exchange');
  const [price, setPrice] = useState<number>(30);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Notifications & Download Progress
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [downloadingNoteId, setDownloadingNoteId] = useState<string | null>(null);

  const loadData = async () => {
    const [fetchedNotes, accessRecords] = await Promise.all([
      getStudyNotes(),
      getNoteAccessRecords(),
    ]);
    setNotes(fetchedNotes);
    if (currentUser) {
      const myAccess = accessRecords
        .filter((r) => r.userId === currentUser.id)
        .map((r) => r.noteId);
      setUnlockedNoteIds(myAccess);
    } else {
      setUnlockedNoteIds([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFile = e.target.files[0];

    // Check PDF extension / type
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setFileError('Invalid file type. Only PDF documents (.pdf) are accepted.');
      setFile(null);
      return;
    }

    // 20 MB Limit = 20 * 1024 * 1024 bytes
    const MAX_BYTES = 20 * 1024 * 1024;
    if (selectedFile.size > MAX_BYTES) {
      setFileError(`File exceeds maximum permitted size of 20 MB (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB).`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !currentUser) {
      setAlert({ type: 'error', message: 'You must log in to upload study notes.' });
      return;
    }

    if (!file) {
      setFileError('Please select a valid PDF file under 20 MB.');
      return;
    }

    setIsUploading(true);
    const res = await uploadStudyNoteWithStorage({
      title,
      subject,
      engineeringYear: year,
      description,
      file,
      accessType,
      price: accessType === 'paid' ? Number(price) : undefined,
      sampleOutline: [
        { title: `${subject} - Unit 1 Fundamentals`, content: `Introduction to ${subject}, key definitions, axioms, and preliminary syllabus overview.` },
        { title: `${subject} - Theoretical Framework`, content: `Core theorems, mathematical formulas, and standard engineering notations.` },
        { title: `${subject} - Solved Examples & Lab Exercises`, content: `Step-by-step worked university numericals and practical experiment setups.` },
        { title: `${subject} - Intermediate Problem Sets`, content: `Mid-semester review problems and exam patterns analysis.` },
        { title: `${subject} - Unit Summary & Key Formulas`, content: `Summary formula sheet, cheat-sheet references, and reference textbooks.` },
      ],
      user: currentUser,
    });
    setIsUploading(false);

    if (res.success) {
      const storageNote = res.storageUploaded
        ? 'Uploaded to Firebase Storage & registered in Firestore!'
        : 'Registered in Firestore successfully!';
      setAlert({ type: 'success', message: `${storageNote} First 5 pages are open to preview.` });
      setIsUploadModalOpen(false);
      setTitle('');
      setSubject('');
      setDescription('');
      setFile(null);
      await loadData();
    } else {
      setAlert({ type: 'error', message: res.error || 'Failed to upload notes.' });
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this study note?')) {
      const res = await deleteStudyNote(id);
      if (res.success) {
        setAlert({ type: 'success', message: 'Note removed successfully from Firestore.' });
        await loadData();
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to delete note.' });
      }
    }
  };

  const handleOpenReader = (note: StudyNote) => {
    setActiveReadingNote(note);
    setReaderCurrentPage(1);
  };

  const handleDownloadNote = async (note: StudyNote) => {
    if (downloadingNoteId === note.id) return; // Prevent duplicate concurrent downloads
    if (!currentUser) {
      setAlert({ type: 'error', message: 'You do not have permission to download this file. Please sign in first.' });
      return;
    }

    setDownloadingNoteId(note.id);
    setAlert({ type: 'info', message: 'Preparing your PDF download…' });

    const result = await downloadNotePDF(note, currentUser, currentUser.role === 'admin');
    setDownloadingNoteId(null);

    if (result.success) {
      setAlert({ type: 'success', message: 'Download started successfully.' });
      await loadData();
    } else {
      setAlert({ type: 'error', message: result.error || 'Download failed. Please try again.' });
    }
  };

  const handleUnlockViaExchange = async (noteId: string) => {
    if (!isAuthenticated || !currentUser) {
      setAlert({ type: 'error', message: 'Please log in to unlock notes via exchange.' });
      return;
    }

    const res = await unlockNoteViaExchange(noteId, currentUser);
    if (res.success) {
      setAlert({
        type: 'success',
        message: 'Full access unlocked in Firestore through notes exchange! All pages are now viewable and downloadable.',
      });
      await loadData();
      const targetNote = notes.find((n) => n.id === noteId);
      if (targetNote) {
        await handleDownloadNote(targetNote);
      }
    } else {
      setAlert({ type: 'error', message: res.error || 'Failed to unlock notes.' });
    }
  };

  const handlePaymentSuccess = async () => {
    const purchasedNote = paymentModalData.note;
    setAlert({
      type: 'success',
      message: 'Verified campus payment recorded in Firestore! Full PDF notes access has been unlocked.',
    });
    await loadData();
    if (purchasedNote) {
      await handleDownloadNote(purchasedNote);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.uploaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear = selectedYear === 'All' || n.engineeringYear === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header (Blue & Lavender Theme) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Service 2: Engineering Notes Repository</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Course Notes Library
          </h1>
          <p className="text-sm text-blue-100 leading-relaxed max-w-2xl">
            Browse and share verified engineering study notes organized by semester year (1st, 2nd, 3rd, and 4th Year). Preview the first 5 pages for free, then unlock full access through peer exchange or fair student access.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setAlert({ type: 'error', message: 'Please log in to upload your notes.' });
                } else {
                  setIsUploadModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF Notes (Max 20MB)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alert && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between shadow-xs ${
            alert.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : alert.type === 'info'
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : alert.type === 'info' ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Engineering Year Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by subject (e.g. DSA, DBMS, Maths, Networks), title, or student author..."
            className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* 1st to 4th Year Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar border-t border-slate-100 pt-3">
          <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Select Year:</span>
          </span>

          <button
            onClick={() => setSelectedYear('All')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
              selectedYear === 'All'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Years ({notes.length})
          </button>

          {ENGINEERING_YEARS.map((yr) => {
            const count = notes.filter((n) => n.engineeringYear === yr).length;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {yr} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            {selectedYear === 'All' ? 'All Engineering Notes' : `${selectedYear} Study Notes`} ({filteredNotes.length})
          </h2>
          <span className="text-xs text-slate-500">
            PDF format · First 5 pages previewable
          </span>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Notes Uploaded for {selectedYear}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No verified PDF notes have been shared for this engineering year yet. Share your notes to help peers and unlock notes in return!
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors mt-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload {selectedYear} Notes</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => {
              const isOwner = currentUser?.id === note.uploaderId;
              const hasFullAccess = isOwner || unlockedNoteIds.includes(note.id) || currentUser?.role === 'admin';

              return (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    
                    {/* Top metadata */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {note.engineeringYear}
                      </span>
                      <span className="text-slate-500 font-medium text-[11px]">
                        {note.subject}
                      </span>
                    </div>

                    {/* Note Title */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2" title={note.title}>
                        {note.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {note.description}
                    </p>

                    {/* Document Stats & Access Status */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Total Pages: {note.totalPages} pages</span>
                        <span>{(note.fileSize / (1024 * 1024)).toFixed(1)} MB PDF</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-[11px] text-slate-600">Access Model:</span>
                        {hasFullAccess ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Unlock className="w-3 h-3" />
                            <span>Fully Unlocked</span>
                          </span>
                        ) : note.accessType === 'free_exchange' ? (
                          <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Free Exchange / 5p Preview</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>₹{note.price} to Unlock (5p Free)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Uploader Details */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                        {note.uploaderName.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{note.uploaderName}</span>
                      <span className="text-slate-400 text-[11px]">· {note.uploaderYear}</span>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenReader(note)}
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Preview PDF</span>
                      </button>

                      {hasFullAccess ? (
                        <button
                          disabled={downloadingNoteId === note.id}
                          onClick={() => handleDownloadNote(note)}
                          className="py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                          title="Download authorized PDF notes"
                        >
                          {downloadingNoteId === note.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                              <span>Preparing…</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </button>
                      ) : note.accessType === 'free_exchange' ? (
                        <button
                          onClick={() => handleUnlockViaExchange(note.id)}
                          className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                          title="Swap with one of your uploaded notes"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Swap to Unlock</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              setAlert({ type: 'error', message: 'Please log in to purchase notes access.' });
                            } else {
                              setPaymentModalData({ isOpen: true, note });
                            }
                          }}
                          className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock ₹{note.price}</span>
                        </button>
                      )}
                    </div>

                    {isOwner && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-indigo-600 font-medium">Your Upload</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete Uploaded Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accessible Interactive PDF Document Reader / Previewer */}
      {activeReadingNote && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-150">
            
            {/* Reader Header */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3 truncate max-w-[70%]">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold truncate text-white">{activeReadingNote.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    {activeReadingNote.subject} · {activeReadingNote.engineeringYear} · Uploaded by {activeReadingNote.uploaderName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Page {readerCurrentPage} of {(activeReadingNote.uploaderId === currentUser?.id || unlockedNoteIds.includes(activeReadingNote.id) || currentUser?.role === 'admin') ? activeReadingNote.totalPages : activeReadingNote.freePreviewPages}
                </span>

                {(activeReadingNote.uploaderId === currentUser?.id || unlockedNoteIds.includes(activeReadingNote.id) || currentUser?.role === 'admin') && (
                  <button
                    disabled={downloadingNoteId === activeReadingNote.id}
                    onClick={() => handleDownloadNote(activeReadingNote)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                    title="Download complete PDF"
                  >
                    {downloadingNoteId === activeReadingNote.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Download PDF</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveReadingNote(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Stage / Body */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 flex items-center justify-center">
              
              {/* Document Page Canvas Simulator */}
              <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 min-h-[500px] p-8 flex flex-col justify-between text-left">
                
                {/* Simulated PDF Header on page */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 text-xs text-slate-400 font-mono">
                    <span>{activeReadingNote.fileName}</span>
                    <span>PAGE {readerCurrentPage} / {activeReadingNote.totalPages}</span>
                  </div>

                  {/* Page Title & Excerpt */}
                  {readerCurrentPage <= 5 ? (
                    <div className="space-y-4">
                      <div className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
                        {activeReadingNote.samplePages[readerCurrentPage - 1]?.title || `Topic Section ${readerCurrentPage}`}
                      </div>

                      <h4 className="text-xl font-bold text-slate-900 leading-snug">
                        {activeReadingNote.samplePages[readerCurrentPage - 1]?.title || 'Course Lecture Module Notes'}
                      </h4>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm leading-relaxed space-y-3 font-sans">
                        <p>
                          {activeReadingNote.samplePages[readerCurrentPage - 1]?.content ||
                            'Standard core curriculum concepts, derivations, circuit diagrams, and exam pointers.'}
                        </p>
                        <p className="text-xs text-slate-500 italic">
                          Reference from lecture notes by {activeReadingNote.uploaderName} for {activeReadingNote.engineeringYear} students.
                        </p>
                      </div>

                      {/* Technical Diagram Simulation */}
                      <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs text-indigo-900 space-y-2">
                        <p className="font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Mathematical Notation & Formula Breakdown</span>
                        </p>
                        <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-indigo-100 text-slate-800">
                          {activeReadingNote.subject.includes('Data')
                            ? 'T(n) = 2T(n/2) + O(n) => O(n log n) by Master Theorem Case 2'
                            : activeReadingNote.subject.includes('Database')
                            ? 'R(A, B, C, D) with FDs: {A -> B, B -> C, C -> D}. Candidate Key = {A}.'
                            : 'f(x) = sum(a_n * cos(nx) + b_n * sin(nx)) from n=1 to infinity'}
                        </div>
                      </div>
                    </div>
                  ) : (activeReadingNote.uploaderId === currentUser?.id || unlockedNoteIds.includes(activeReadingNote.id) || currentUser?.role === 'admin') ? (
                    <div className="space-y-4">
                      <div className="inline-block px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        Unlocked Full Content · Page {readerCurrentPage}
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">
                        Advanced University Exam Solutions & Question Bank
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {activeReadingNote.lockedContentExcerpt}
                      </p>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <p className="font-semibold text-slate-800">Previous Year Exam Practice Solutions:</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                          <li>Comprehensive 10-mark question derivations with step markings</li>
                          <li>Annotated system block diagrams and truth tables</li>
                          <li>Model answers prepared according to university grading guidelines</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        Remaining Pages Locked (Pages 6 to {activeReadingNote.totalPages})
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        In accordance with the college peer learning policy, the first 5 preview pages are free. Full notes can be accessed by swapping notes or student access.
                      </p>
                      <div className="pt-2 flex justify-center gap-3">
                        {activeReadingNote.accessType === 'free_exchange' ? (
                          <button
                            onClick={() => handleUnlockViaExchange(activeReadingNote.id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                          >
                            Swap Notes to Unlock
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveReadingNote(null);
                              setPaymentModalData({ isOpen: true, note: activeReadingNote });
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl"
                          >
                            Unlock for ₹{activeReadingNote.price}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer on page */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>SkillSwap Verified Academic Notes</span>
                  <span>Page {readerCurrentPage}</span>
                </div>

              </div>
            </div>

            {/* Reader Controls Footer */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                disabled={readerCurrentPage <= 1}
                onClick={() => setReaderCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Page</span>
              </button>

              <span className="text-xs font-semibold text-slate-700">
                Page {readerCurrentPage} / {(activeReadingNote.uploaderId === currentUser?.id || unlockedNoteIds.includes(activeReadingNote.id) || currentUser?.role === 'admin') ? activeReadingNote.totalPages : activeReadingNote.freePreviewPages}
              </span>

              <button
                disabled={
                  readerCurrentPage >=
                  ((activeReadingNote.uploaderId === currentUser?.id || unlockedNoteIds.includes(activeReadingNote.id) || currentUser?.role === 'admin')
                    ? activeReadingNote.totalPages
                    : activeReadingNote.freePreviewPages)
                }
                onClick={() => setReaderCurrentPage((p) => p + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Upload Notes Form */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Upload Study Notes (PDF)</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Unit 1-3 Complete Revision Guide"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Year *</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value as EngineeringYear)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {ENGINEERING_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PDF File Picker with 20MB limit constraint */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PDF Document (Max 20 MB) *
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    required
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <FileText className="w-8 h-8 text-blue-500 mx-auto" />
                    {file ? (
                      <p className="text-xs font-semibold text-slate-800">
                        {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-slate-700">
                          Click to browse or drop PDF here
                        </p>
                        <p className="text-[11px] text-slate-400">PDF documents only, up to 20 MB</p>
                      </>
                    )}
                  </div>
                </div>
                {fileError && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fileError}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Access Model *</label>
                  <select
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value as 'free_exchange' | 'paid')}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="free_exchange">Free Exchange (Swap Notes)</option>
                    <option value="paid">Paid Student Access</option>
                  </select>
                </div>

                {accessType === 'paid' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unlock Price (₹) *</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline syllabus units covered, handwritten vs typed, lab codes included..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Upload & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal for Paid Notes */}
      {paymentModalData.isOpen && paymentModalData.note && (
        <PaymentModal
          isOpen={paymentModalData.isOpen}
          onClose={() => setPaymentModalData({ isOpen: false, note: null })}
          itemType="note_access"
          itemId={paymentModalData.note.id}
          itemTitle={paymentModalData.note.title}
          amount={paymentModalData.note.price || 30}
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
};
