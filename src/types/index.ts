export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeYear: string; // e.g. "2nd Year"
  department: string;  // e.g. "Computer Engineering"
  collegeName?: string;
  bio?: string;
  avatarSeed?: string;
  joinedAt: string;
}

export type SkillCategory =
  | 'Programming'
  | 'Design'
  | 'Academics'
  | 'Communication'
  | 'Music'
  | 'Photography'
  | 'Fitness'
  | 'Other';

export type ExchangeType = 'free' | 'paid';

export interface SkillSwapListing {
  id: string;
  userId: string;
  userName: string;
  userYear: string;
  userDepartment: string;
  skillOffered: string;
  category: SkillCategory;
  description: string;
  skillRequested: string;
  exchangeType: ExchangeType;
  hourlyRate?: number; // In ₹ (e.g., 100) if paid
  status: 'active' | 'closed';
  createdAt: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface SkillSwapRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  ownerId: string;
  requesterId: string;
  requesterName: string;
  requesterYear: string;
  requesterEmail: string;
  proposedSkill: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
}

export type EngineeringYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export interface NotePageSample {
  pageNumber: number;
  title: string;
  content: string; // Preview excerpt or diagrams
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  engineeringYear: EngineeringYear;
  description: string;
  uploaderId: string;
  uploaderName: string;
  uploaderYear: string;
  totalPages: number;
  freePreviewPages: number; // exactly 5
  fileName: string;
  fileSize: number; // in bytes
  fileDataUrl?: string; // stored data URI or sample representation
  fileUrl?: string; // Firebase Storage download URL
  accessType: 'free_exchange' | 'paid';
  price?: number; // in ₹ if paid access
  samplePages: NotePageSample[];
  lockedContentExcerpt?: string;
  downloadsCount: number;
  createdAt: string;
}

export interface NoteAccessRecord {
  id: string;
  noteId: string;
  userId: string;
  accessMethod: 'uploader' | 'free_exchange' | 'paid';
  transactionId?: string;
  unlockedAt: string;
}

export type GuidanceCategory =
  | 'Programming'
  | 'DSA'
  | 'Web Development'
  | 'Database'
  | 'Academics'
  | 'Projects'
  | 'Career'
  | 'Other';

export interface GuidanceAnswer {
  id: string;
  doubtId: string;
  authorId: string;
  authorName: string;
  authorYear: string;
  content: string;
  isAccepted?: boolean;
  createdAt: string;
}

export interface GuidanceDoubt {
  id: string;
  title: string;
  category: GuidanceCategory;
  description: string;
  tags: string[];
  studentId: string;
  studentName: string;
  studentYear: string;
  status: 'open' | 'resolved';
  answers: GuidanceAnswer[];
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  itemType: 'note_access' | 'skill_swap_session';
  itemId: string;
  itemTitle: string;
  amount: number; // in INR ₹
  status: 'verified' | 'failed' | 'pending';
  gateway: string; // e.g. "Razorpay / UPI Sandbox"
  paymentMethod: string;
  verifiedAt: string;
}
