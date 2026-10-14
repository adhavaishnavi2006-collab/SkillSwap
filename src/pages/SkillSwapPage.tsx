import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  SkillCategory,
  ExchangeType,
  SkillSwapListing,
  SkillSwapRequest,
} from '../types';
import {
  getSkillListings,
  createSkillListing,
  deleteSkillListing,
  getSkillRequests,
  createSwapRequest,
  updateSwapRequestStatus,
} from '../services/storage';
import {
  ArrowLeftRight,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
  Clock,
  Check,
  Ban,
  User,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES: SkillCategory[] = [
  'Programming',
  'Design',
  'Academics',
  'Communication',
  'Music',
  'Photography',
  'Fitness',
  'Other',
];

export const SkillSwapPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  const [listings, setListings] = useState<SkillSwapListing[]>([]);
  const [requests, setRequests] = useState<SkillSwapRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExchangeType, setSelectedExchangeType] = useState<string>('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [targetListing, setTargetListing] = useState<SkillSwapListing | null>(null);

  // New Listing Form State
  const [skillOffered, setSkillOffered] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Programming');
  const [description, setDescription] = useState('');
  const [skillRequested, setSkillRequested] = useState('');
  const [exchangeType, setExchangeType] = useState<ExchangeType>('free');
  const [hourlyRate, setHourlyRate] = useState<number>(50);

  // Exchange Request Form State
  const [proposedSkill, setProposedSkill] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  // Feedback Notifications
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    setListings(getSkillListings());
    setRequests(getSkillRequests());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAlert({ type: 'error', message: 'You must log in to post a skill exchange listing.' });
      return;
    }

    if (!skillOffered.trim() || !skillRequested.trim() || !description.trim()) {
      setAlert({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const res = createSkillListing({
      skillOffered,
      category,
      description,
      skillRequested,
      exchangeType,
      hourlyRate: exchangeType === 'paid' ? Number(hourlyRate) : undefined,
    });

    if (res.success) {
      setAlert({ type: 'success', message: 'Your skill listing has been posted successfully!' });
      setIsAddModalOpen(false);
      setSkillOffered('');
      setDescription('');
      setSkillRequested('');
      setExchangeType('free');
      loadData();
    } else {
      setAlert({ type: 'error', message: res.error || 'Failed to post listing.' });
    }
  };

  const handleDeleteListing = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      const res = deleteSkillListing(id);
      if (res.success) {
        setAlert({ type: 'success', message: 'Listing removed successfully.' });
        loadData();
      } else {
        setAlert({ type: 'error', message: res.error || 'Failed to remove listing.' });
      }
    }
  };

  const handleOpenRequestModal = (listing: SkillSwapListing) => {
    if (!isAuthenticated) {
      setAlert({ type: 'error', message: 'Please log in to send a skill exchange request.' });
      return;
    }
    setTargetListing(listing);
    setProposedSkill('');
    setRequestMessage(`Hi ${listing.userName}, I would love to learn ${listing.skillOffered} and can exchange skills with you!`);
    setIsRequestModalOpen(true);
  };

  const handleSendSwapRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetListing) return;

    if (!proposedSkill.trim()) {
      setAlert({ type: 'error', message: 'Please describe the skill you can offer in return.' });
      return;
    }

    const res = createSwapRequest({
      listingId: targetListing.id,
      proposedSkill,
      message: requestMessage,
    });

    if (res.success) {
      setAlert({ type: 'success', message: `Exchange request sent to ${targetListing.userName}!` });
      setIsRequestModalOpen(false);
      setTargetListing(null);
      loadData();
    } else {
      setAlert({ type: 'error', message: res.error || 'Failed to send request.' });
    }
  };

  const handleRequestStatusChange = (reqId: string, status: 'accepted' | 'rejected') => {
    const res = updateSwapRequestStatus(reqId, status);
    if (res.success) {
      setAlert({
        type: 'success',
        message: `Request status updated to ${status}.`,
      });
      loadData();
    } else {
      setAlert({ type: 'error', message: res.error || 'Failed to update request.' });
    }
  };

  // Filter listings
  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.skillOffered.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.skillRequested.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || l.category === selectedCategory;
    const matchesType =
      selectedExchangeType === 'All' ||
      (selectedExchangeType === 'Free' && l.exchangeType === 'free') ||
      (selectedExchangeType === 'Paid' && l.exchangeType === 'paid');

    return matchesSearch && matchesCategory && matchesType;
  });

  // Incoming requests for current user's listings
  const myIncomingRequests = requests.filter((r) => r.ownerId === currentUser?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header (Lavender & Indigo Theme) */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Service 1: Student-to-Student Skill Swap</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Skill Swap Exchange
          </h1>
          <p className="text-sm text-indigo-100 leading-relaxed max-w-2xl">
            Offer technical skills and engineering knowledge you know, and learn skills you need from peers in your college. Free exchanges and fair peer assistance.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setAlert({ type: 'error', message: 'Please log in to add your skill listing.' });
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Offer a Skill / Add Listing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inline Feedback Alerts */}
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

      {/* Pending Incoming Requests Notification Banner */}
      {isAuthenticated && myIncomingRequests.filter((r) => r.status === 'pending').length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>You have {myIncomingRequests.filter((r) => r.status === 'pending').length} pending exchange request(s) on your skill listings!</span>
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {myIncomingRequests
              .filter((r) => r.status === 'pending')
              .map((req) => (
                <div key={req.id} className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-xs flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-900">{req.requesterName} ({req.requesterYear})</span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-medium border border-amber-200">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 font-medium">Offers in return: {req.proposedSkill}</p>
                    <p className="text-xs text-slate-600 italic mt-1">"{req.message}"</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleRequestStatusChange(req.id, 'rejected')}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleRequestStatusChange(req.id, 'accepted')}
                      className="px-3 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Accept Exchange</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Search and Filters Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, topics (e.g. C++, React, DSA, CAD), or students..."
              className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Exchange Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 text-xs w-full sm:w-auto">
            {['All', 'Free', 'Paid'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedExchangeType(type)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedExchangeType === type
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'All' ? 'All Types' : type === 'Free' ? 'Free Swaps' : 'Paid Assistance'}
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
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Swap Listings Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Available Skill Listings ({filteredListings.length})
          </h2>
          <span className="text-xs text-slate-500">
            Authentic peer submissions
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Skill Listings Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All'
                ? 'No skill exchanges match your current search criteria. Try resetting the filters.'
                : 'Be the first student to offer a skill in this category and start exchanging knowledge!'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Skill Listing</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => {
              const isOwner = currentUser?.id === item.userId;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category and Exchange Badge */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          item.exchangeType === 'free'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.exchangeType === 'free' ? 'Free Swap' : `Paid Help (₹${item.hourlyRate}/session)`}
                      </span>
                    </div>

                    {/* Skill Offered */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                        Can Teach / Offer:
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {item.skillOffered}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {/* Skill Requested */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Wants to Learn in Return:
                      </span>
                      <p className="font-semibold text-slate-800">
                        {item.skillRequested}
                      </p>
                    </div>

                    {/* Uploader Info */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                        {item.userName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-slate-800">{item.userName}</span>
                        <span className="text-slate-400 text-[11px] ml-1">· {item.userYear} ({item.userDepartment})</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    {isOwner ? (
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          Your Listing
                        </span>
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenRequestModal(item)}
                        className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>Request Skill Exchange</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Skill Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Post a Skill Listing</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill You Can Teach / Offer *
                </label>
                <input
                  type="text"
                  required
                  value={skillOffered}
                  onChange={(e) => setSkillOffered(e.target.value)}
                  placeholder="e.g. C++ STL & Binary Search Trees"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SkillCategory)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exchange Model *</label>
                  <select
                    value={exchangeType}
                    onChange={(e) => setExchangeType(e.target.value as ExchangeType)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="free">Free Exchange (Swap)</option>
                    <option value="paid">Paid Student Help</option>
                  </select>
                </div>
              </div>

              {exchangeType === 'paid' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Hourly / Session Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Keep rates fair for fellow college students (e.g. ₹50 - ₹100).</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill You Want to Learn in Return *
                </label>
                <input
                  type="text"
                  required
                  value={skillRequested}
                  onChange={(e) => setSkillRequested(e.target.value)}
                  placeholder="e.g. Figma UI Design or Python Pandas"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Topics Covered *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what specific topics, lab assignments, or concepts you can walk through..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Exchange */}
      {isRequestModalOpen && targetListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Skill Exchange</h3>
                <p className="text-xs text-slate-500">With {targetListing.userName}</p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSwapRequest} className="p-6 space-y-4 text-left">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs">
                <span className="font-semibold text-indigo-900 block">Requested Skill:</span>
                <span className="text-slate-700 font-medium">{targetListing.skillOffered}</span>
                <span className="text-slate-400 block mt-1">Their preferred return skill: {targetListing.skillRequested}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What skill or topic can you offer {targetListing.userName}? *
                </label>
                <input
                  type="text"
                  required
                  value={proposedSkill}
                  onChange={(e) => setProposedSkill(e.target.value)}
                  placeholder={`e.g. ${targetListing.skillRequested} or another skill you know well`}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Availability Note
                </label>
                <textarea
                  rows={3}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Share when you are free on campus or in the college library..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Send Exchange Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
