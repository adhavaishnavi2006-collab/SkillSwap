import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GuidanceCategory, GuidanceDoubt } from '../types';
import {
  getGuidanceDoubts,
  createGuidanceDoubt,
  addGuidanceAnswer,
  toggleAcceptAnswer,
  deleteGuidanceDoubt,
} from '../services/storage';
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  HelpCircle,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
  Send,
  Check,
} from 'lucide-react';

const GUIDANCE_CATEGORIES: GuidanceCategory[] = [
  'Programming',
  'DSA',
  'Web Development',
  'Database',
  'Academics',
  'Projects',
  'Career',
  'Other',
];

export const GuidancePage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  const [doubts, setDoubts] = useState<GuidanceDoubt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'open' | 'resolved'>('All');

  // Modal & Answer State
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Ask Question Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GuidanceCategory>('DSA');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Notifications
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    const fetched = await getGuidanceDoubts();
    setDoubts(fetched);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !currentUser) {
      setAlert({ type: 'error', message: 'You must log in to submit a guidance question.' });
      return;
    }

    if (!title.trim() || !description.trim()) {
      setAlert({ type: 'error', message: 'Please provide a title and detailed description of your doubt.' });
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const res = await createGuidanceDoubt({
      title,
      category,
      description,
      tags: tags.length > 0 ? tags : [category],
      user: currentUser,
    });

    if (res.success) {
      setAlert({ type: 'success', message: 'Your academic doubt has been posted in Firestore! Fellow students can now help.' });
      setIsAskModalOpen(false);
      setTitle('');
      setDescription('');
      setTagsInput('');
      await loadData();
    } else {
      setAlert({ type: 'error', message: res.error || 'Failed to submit question.' });
    }
  };

  const handlePostAnswer = async (doubtId: string) => {
    if (!isAuthenticated || !currentUser) {
      setAlert({ type: 'error', message: 'Please log in to respond to guidance queries.' });
      return;
    }

    const reply = replyTextMap[doubtId]?.trim();
    if (!reply) {
      setAlert({ type: 'error', message: 'Please type your answer before submitting.' });
      return;
    }

    const res = await addGuidanceAnswer(doubtId, reply, currentUser);
    if (res.success) {
      setAlert({ type: 'success', message: 'Your solution has been submitted in Firestore to help this student!' });
      setReplyTextMap((prev) => ({ ...prev, [doubtId]: '' }));
      await loadData();
    } else {
      setAlert({ type: 'error', message: res.error || 'Failed to submit answer.' });
    }
  };

  const handleToggleAccept = async (doubtId: string, answerId: string) => {
    if (!currentUser) return;
    const res = await toggleAcceptAnswer(doubtId, answerId, currentUser);
    if (res.success) {
      setAlert({ type: 'success', message: 'Answer status updated in Firestore.' });
      await loadData();
    } else {
      setAlert({ type: 'error', message: res.error || 'Could not update answer status.' });
    }
  };

  const handleDeleteDoubt = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const res = await deleteGuidanceDoubt(id);
      if (res.success) {
        setAlert({ type: 'success', message: 'Question removed from Firestore.' });
        await loadData();
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to delete.' });
      }
    }
  };

  // Filter doubts
  const filteredDoubts = doubts.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.studentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesStatus = filterStatus === 'All' || d.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header (Mint Green & Purple Accents Theme) */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Service 3: 100% Free Peer Academic Guidance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Academic Guidance & Doubts
          </h1>
          <p className="text-sm text-emerald-100 leading-relaxed max-w-2xl">
            Ask technical and semester questions, get assistance from fellow computer engineering students, and find verified answers for DSA, Web, Databases, and Lab Mini-Projects. Free for all students.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setAlert({ type: 'error', message: 'Please log in to ask a guidance question.' });
                } else {
                  setIsAskModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ask a Question (Free)</span>
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
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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

      {/* Search & Filter Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doubts by topic, keyword (e.g. Trees, SQL, Normalization, Git)..."
              className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 text-xs w-full sm:w-auto">
            {(['All', 'open', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'All' ? 'All Questions' : st === 'open' ? 'Open Doubts' : 'Resolved'}
              </button>
            ))}
          </div>

        </div>

        {/* Category Horizontal Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-lg shrink-0 transition-colors ${
              selectedCategory === 'All'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Categories
          </button>
          {GUIDANCE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Doubts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Student Guidance Questions ({filteredDoubts.length})
          </h2>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            100% Free Peer Help
          </span>
        </div>

        {filteredDoubts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Guidance Doubts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Have an academic question in DSA, Web Dev, Databases, or Lab exams? Submit your doubt to receive free peer guidance!
            </p>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ask First Question</span>
            </button>
          </div>
        ) : (
          filteredDoubts.map((item) => {
            const isAuthor = currentUser?.id === item.studentId;
            const isExpanded = expandedDoubtId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-200 shadow-xs hover:shadow-sm transition-all space-y-4 text-left"
              >
                {/* Header row: category, status, author */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        item.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.status === 'resolved' ? 'Resolved' : 'Open for Answers'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <span className="font-medium text-slate-700">{item.studentName}</span>
                    <span>·</span>
                    <span>{item.studentYear}</span>
                    {isAuthor && (
                      <button
                        onClick={() => handleDeleteDoubt(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Answers Count & Toggle */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedDoubtId(isExpanded ? null : item.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {item.answers.length} {item.answers.length === 1 ? 'Answer' : 'Answers'}
                    </span>
                    <span className="text-slate-400 font-normal">
                      ({isExpanded ? 'Hide' : 'View & Reply'})
                    </span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Asked on {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Expanded Answers & Reply Area */}
                {isExpanded && (
                  <div className="pt-3 space-y-4 border-t border-slate-100">
                    
                    {/* Existing Answers */}
                    <div className="space-y-3">
                      {item.answers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">
                          No solutions submitted yet. Be the first student to help!
                        </p>
                      ) : (
                        item.answers.map((ans) => (
                          <div
                            key={ans.id}
                            className={`p-4 rounded-xl text-xs space-y-2 border transition-all ${
                              ans.isAccepted
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{ans.authorName}</span>
                                <span className="text-slate-400">· {ans.authorYear}</span>
                              </div>

                              {ans.isAccepted ? (
                                <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Accepted Solution</span>
                                </span>
                              ) : isAuthor ? (
                                <button
                                  onClick={() => handleToggleAccept(item.id, ans.id)}
                                  className="text-[11px] text-emerald-700 hover:underline font-semibold"
                                >
                                  Mark as Accepted Solution
                                </button>
                              ) : null}
                            </div>

                            <p className="text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                              {ans.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Submit Reply / Solution Form */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Academic Solution / Guidance
                      </label>
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={replyTextMap[item.id] || ''}
                          onChange={(e) =>
                            setReplyTextMap((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Provide a clear, respectful explanation with code snippets, derivations, or step-by-step guidance..."
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handlePostAnswer(item.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Post Answer (Free)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Modal: Ask Question Form */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Ask Academic Question</h3>
                <p className="text-[11px] text-emerald-600 font-medium">Free for all college students</p>
              </div>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAskSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question / Doubt Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Why is 3NF preferred over BCNF when functional dependencies must be preserved?"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GuidanceCategory)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {GUIDANCE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Explanation / What have you tried so far? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your question, specific theorem, homework problem, or code error in detail..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. DBMS, Normalization, SQL, ExamPrep"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Post Question (Free)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
