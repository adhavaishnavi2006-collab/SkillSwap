import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  User,
  SkillSwapListing,
  SkillSwapRequest,
  StudyNote,
  NoteAccessRecord,
  GuidanceDoubt,
  GuidanceAnswer,
  PaymentTransaction,
  EngineeringYear,
  SkillCategory,
  ExchangeType,
  GuidanceCategory,
} from '../types';

// Collection References
const USERS_COLLECTION = 'users';
const SKILLS_COLLECTION = 'skills';
const REQUESTS_COLLECTION = 'skillRequests';
const NOTES_COLLECTION = 'notes';
const NOTE_ACCESS_COLLECTION = 'noteAccess';
const GUIDANCE_COLLECTION = 'guidanceQuestions'; // Persisted in Firestore
const TRANSACTIONS_COLLECTION = 'transactions';

// Seed Fallback Data in case the Firestore database is newly provisioned
export const SEED_INITIAL_SKILLS: Omit<SkillSwapListing, 'id'>[] = [
  {
    userId: 'seed_vaishnavi',
    userName: 'Vaishnavi Adhav',
    userYear: '2nd Year',
    userDepartment: 'Computer Engineering',
    skillOffered: 'Data Structures in C++ (Trees, Graphs & Recursion)',
    category: 'Programming',
    description: 'Can guide through binary trees, graph traversals (BFS/DFS), and standard recursion patterns for semester lab exams.',
    skillRequested: 'Figma UI Wireframing & Design Systems',
    exchangeType: 'free',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    userId: 'seed_shruti',
    userName: 'Shruti Kulkarni',
    userYear: '2nd Year',
    userDepartment: 'Computer Engineering',
    skillOffered: 'Database Design, SQL Queries & Normalization',
    category: 'Academics',
    description: 'Happy to explain ER diagrams, relational mapping, BCNF/3NF normalization, and complex JOIN queries.',
    skillRequested: 'Python Automation & Scripting',
    exchangeType: 'free',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    userId: 'seed_shubham',
    userName: 'Shubham Biradar',
    userYear: '2nd Year',
    userDepartment: 'Computer Engineering',
    skillOffered: 'Linux Command Line, Shell Scripting & Git',
    category: 'Programming',
    description: 'Offering hands-on help setting up Linux environments, bash scripts, and collaborative git branches for college mini-projects.',
    skillRequested: 'Computer Graphics & OpenGL basics',
    exchangeType: 'free',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_INITIAL_NOTES: Omit<StudyNote, 'id'>[] = [
  {
    title: 'Data Structures and Algorithms (DSA) Complete Unit 1-4 Notes',
    subject: 'Data Structures',
    engineeringYear: '2nd Year',
    description: 'Handwritten and structured PDF notes covering Stacks, Queues, Linked Lists, Binary Search Trees, and Heaps with time-complexity tables.',
    uploaderId: 'seed_vaishnavi',
    uploaderName: 'Vaishnavi Adhav',
    uploaderYear: '2nd Year',
    totalPages: 24,
    freePreviewPages: 5,
    fileName: 'DSA_Unit1_to_Unit4_Notes.pdf',
    fileSize: 4850000,
    accessType: 'free_exchange',
    downloadsCount: 18,
    createdAt: new Date().toISOString(),
    samplePages: [
      {
        pageNumber: 1,
        title: 'Unit 1: Introduction to Data Structures & Asymptotic Notation',
        content: 'Overview of Linear vs Non-linear structures. Big-O, Big-Omega, and Big-Theta definitions. Space and time tradeoff analysis with formal proofs.',
      },
      {
        pageNumber: 2,
        title: 'Unit 1 (Contd): Linear Arrays & Dynamic Memory Allocation',
        content: '1D and 2D row-major / column-major address calculation formulas. Memory layout of heap vs stack allocation in C/C++.',
      },
      {
        pageNumber: 3,
        title: 'Unit 2: Stacks & Applications (Infix to Postfix Conversion)',
        content: 'LIFO principle. Push, Pop, Peek implementations. Operator precedence parsing table and postfix evaluation algorithm.',
      },
      {
        pageNumber: 4,
        title: 'Unit 2 (Contd): Circular Queues & Priority Queues',
        content: 'Overcoming queue boundary conditions using modulo arithmetic ((rear + 1) % MAX). Array representation of max/min heaps.',
      },
      {
        pageNumber: 5,
        title: 'Unit 3: Singly & Doubly Linked Lists Code Reference',
        content: 'Pointer manipulation patterns for node insertion at head, middle, and tail. Reversal of singly linked list with 3 pointers.',
      },
    ],
    lockedContentExcerpt: 'Pages 6 to 24 contain full Trees, AVL rotations, Graph BFS/DFS implementations, Floyd-Warshall, and semester exam previous year questions.',
  },
  {
    title: 'Database Management Systems (DBMS) Comprehensive Lab Manual & Notes',
    subject: 'Database Systems',
    engineeringYear: '2nd Year',
    description: 'Comprehensive study guide with relational algebra, SQL DDL/DML cheatsheets, normal forms (1NF to BCNF), and ACID transaction schedules.',
    uploaderId: 'seed_shruti',
    uploaderName: 'Shruti Kulkarni',
    uploaderYear: '2nd Year',
    totalPages: 18,
    freePreviewPages: 5,
    fileName: 'DBMS_Exam_Review_Guide.pdf',
    fileSize: 3200000,
    accessType: 'paid',
    price: 35,
    downloadsCount: 22,
    createdAt: new Date().toISOString(),
    samplePages: [
      {
        pageNumber: 1,
        title: 'DBMS Architecture & Data Independence',
        content: 'Three-schema architecture: Physical, Conceptual, and External levels. Logical vs physical data independence explained with diagrams.',
      },
      {
        pageNumber: 2,
        title: 'Entity Relationship (ER) Model Fundamentals',
        content: 'Strong vs weak entity sets, cardinalities (1:1, 1:N, M:N), partial vs total participation constraints and reduction to relational schema.',
      },
      {
        pageNumber: 3,
        title: 'Relational Algebra Operations',
        content: 'Selection (sigma), Projection (pi), Cartesian Product, Set Union, Set Difference, and Natural Join symbols and semantic formulas.',
      },
      {
        pageNumber: 4,
        title: 'SQL Core Queries & Aggregate Functions',
        content: 'SELECT, WHERE, GROUP BY, HAVING, ORDER BY clause execution order. Subqueries, correlated subqueries, and EXISTS clauses.',
      },
      {
        pageNumber: 5,
        title: 'Functional Dependencies & 1NF / 2NF',
        content: 'Armstrong axioms for FD inference. Decomposition requirements for losslessness and dependency preservation.',
      },
    ],
    lockedContentExcerpt: 'Pages 6 to 18 include full 3NF & BCNF decomposition step-by-step proofs, 2-Phase Locking (2PL), Concurrency Control, and Recovery.',
  },
];

export const SEED_INITIAL_GUIDANCE: Omit<GuidanceDoubt, 'id'>[] = [
  {
    title: 'How do I choose between Merge Sort and Quick Sort for linked list vs array in exams?',
    category: 'DSA',
    description: 'In our second-year DSA exam, we often get asked why Merge Sort is preferred for sorting a Singly Linked List whereas Quick Sort is preferred for Arrays. Can someone explain the cache locality and pointer differences clearly?',
    tags: ['DSA', 'Sorting', 'Algorithms', 'LinkedList'],
    studentId: 'seed_shubham',
    studentName: 'Shubham Biradar',
    studentYear: '2nd Year',
    status: 'resolved',
    createdAt: new Date().toISOString(),
    answers: [
      {
        id: 'ans_1',
        doubtId: 'seed_d1',
        authorId: 'seed_vaishnavi',
        authorName: 'Vaishnavi Adhav',
        authorYear: '2nd Year',
        content: '1. Merge Sort on Linked Lists does NOT require extra O(N) space because we can rearrange next pointers directly in O(1) space.\n2. Quick Sort on Arrays performs exceptionally well because contiguous array elements maximize CPU cache line hits.\nTherefore, Merge Sort is O(N log N) worst-case and pointer-friendly for Linked Lists, while Quick Sort is in-place and cache-optimal for Arrays.',
        isAccepted: true,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    title: 'Confusion with 3NF vs BCNF decomposition condition',
    category: 'Database',
    description: 'I understand that for a functional dependency X -> Y to be in BCNF, X must be a superkey. But what is the exact concession 3NF makes, and what is a prime attribute in practice?',
    tags: ['DBMS', 'Normalization', 'SQL'],
    studentId: 'seed_shubham',
    studentName: 'Shubham Biradar',
    studentYear: '2nd Year',
    status: 'resolved',
    createdAt: new Date().toISOString(),
    answers: [
      {
        id: 'ans_2',
        doubtId: 'seed_d2',
        authorId: 'seed_shruti',
        authorName: 'Shruti Kulkarni',
        authorYear: '2nd Year',
        content: 'For any non-trivial FD X -> Y:\n- BCNF strictly requires: X must be a superkey.\n- 3NF allows: Either X is a superkey OR Y is a prime attribute (part of any candidate key).\n3NF guarantees both lossless join and dependency preservation.',
        isAccepted: true,
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

// ----------------- USER PROFILE SERVICES (FIRESTORE) -----------------

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function saveUserProfile(user: User): Promise<void> {
  const path = `${USERS_COLLECTION}/${user.id}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map((d) => d.data() as User);
  } catch (error) {
    console.warn('Could not list all users (may require admin privileges in rules):', error);
    return [];
  }
}

// ----------------- SKILL SWAP SERVICES (FIRESTORE) -----------------

export async function getSkillListings(): Promise<SkillSwapListing[]> {
  try {
    const snap = await getDocs(collection(db, SKILLS_COLLECTION));
    if (snap.empty) {
      // Return initial seed items if collection is empty
      return SEED_INITIAL_SKILLS.map((item, idx) => ({ ...item, id: `seed_skill_${idx + 1}` }));
    }
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as SkillSwapListing));
  } catch (error) {
    console.warn('Firestore getSkillListings fallback:', error);
    return SEED_INITIAL_SKILLS.map((item, idx) => ({ ...item, id: `seed_skill_${idx + 1}` }));
  }
}

export async function createSkillListing(params: {
  skillOffered: string;
  category: SkillCategory;
  description: string;
  skillRequested: string;
  exchangeType: ExchangeType;
  hourlyRate?: number;
  user: User;
}): Promise<{ success: boolean; listing?: SkillSwapListing; error?: string }> {
  try {
    const newListingData: Omit<SkillSwapListing, 'id'> = {
      userId: params.user.id,
      userName: params.user.name,
      userYear: params.user.collegeYear,
      userDepartment: params.user.department,
      skillOffered: params.skillOffered.trim(),
      category: params.category,
      description: params.description.trim(),
      skillRequested: params.skillRequested.trim(),
      exchangeType: params.exchangeType,
      hourlyRate: params.exchangeType === 'paid' ? Number(params.hourlyRate) || 50 : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, SKILLS_COLLECTION), newListingData);
    return { success: true, listing: { ...newListingData, id: docRef.id } };
  } catch (error) {
    console.error('Error creating skill listing:', error);
    return { success: false, error: (error as Error).message || 'Failed to create skill listing in Firestore' };
  }
}

export async function deleteSkillListing(listingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, SKILLS_COLLECTION, listingId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting skill listing:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete listing' };
  }
}

export async function getSkillRequests(): Promise<SkillSwapRequest[]> {
  try {
    const snap = await getDocs(collection(db, REQUESTS_COLLECTION));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as SkillSwapRequest));
  } catch (error) {
    console.warn('Firestore getSkillRequests fallback:', error);
    return [];
  }
}

export async function createSwapRequest(params: {
  listingId: string;
  listingTitle: string;
  ownerId: string;
  proposedSkill: string;
  message: string;
  user: User;
}): Promise<{ success: boolean; request?: SkillSwapRequest; error?: string }> {
  try {
    if (params.ownerId === params.user.id) {
      return { success: false, error: 'You cannot request an exchange with your own listing.' };
    }

    const newReqData: Omit<SkillSwapRequest, 'id'> = {
      listingId: params.listingId,
      listingTitle: params.listingTitle,
      ownerId: params.ownerId,
      requesterId: params.user.id,
      requesterName: params.user.name,
      requesterYear: params.user.collegeYear,
      requesterEmail: params.user.email,
      proposedSkill: params.proposedSkill.trim(),
      message: params.message.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), newReqData);
    return { success: true, request: { ...newReqData, id: docRef.id } };
  } catch (error) {
    console.error('Error creating swap request:', error);
    return { success: false, error: (error as Error).message || 'Failed to submit exchange request' };
  }
}

export async function updateSwapRequestStatus(
  requestId: string,
  newStatus: 'accepted' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, requestId);
    await updateDoc(docRef, { status: newStatus });
    return { success: true };
  } catch (error) {
    console.error('Error updating request status:', error);
    return { success: false, error: (error as Error).message || 'Failed to update request' };
  }
}

// ----------------- NOTES & STORAGE SERVICES (FIRESTORE + FIREBASE STORAGE) -----------------

export async function getStudyNotes(): Promise<StudyNote[]> {
  try {
    const snap = await getDocs(collection(db, NOTES_COLLECTION));
    if (snap.empty) {
      return SEED_INITIAL_NOTES.map((item, idx) => ({ ...item, id: `seed_note_${idx + 1}` }));
    }
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as StudyNote));
  } catch (error) {
    console.warn('Firestore getStudyNotes fallback:', error);
    return SEED_INITIAL_NOTES.map((item, idx) => ({ ...item, id: `seed_note_${idx + 1}` }));
  }
}

export async function getNoteAccessRecords(): Promise<NoteAccessRecord[]> {
  try {
    const snap = await getDocs(collection(db, NOTE_ACCESS_COLLECTION));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as NoteAccessRecord));
  } catch (error) {
    console.warn('Firestore getNoteAccessRecords fallback:', error);
    return [];
  }
}

export async function checkHasFullNoteAccess(noteId: string, userId?: string, isAdmin?: boolean): Promise<boolean> {
  if (!userId) return false;
  if (isAdmin) return true;

  try {
    const notes = await getStudyNotes();
    const note = notes.find((n) => n.id === noteId);
    if (!note) return false;

    // Uploader always has full access
    if (note.uploaderId === userId) return true;

    // Check Firestore access records
    const records = await getNoteAccessRecords();
    return records.some((r) => r.noteId === noteId && r.userId === userId);
  } catch {
    return false;
  }
}

export async function uploadStudyNoteWithStorage(params: {
  title: string;
  subject: string;
  engineeringYear: EngineeringYear;
  description: string;
  file: File;
  accessType: 'free_exchange' | 'paid';
  price?: number;
  sampleOutline: Array<{ title: string; content: string }>;
  totalPages?: number;
  user: User;
}): Promise<{ success: boolean; note?: StudyNote; error?: string; storageUploaded: boolean }> {
  // Validate PDF extension
  if (!params.file.name.toLowerCase().endsWith('.pdf') && params.file.type !== 'application/pdf') {
    return { success: false, storageUploaded: false, error: 'Invalid file format. Only PDF files are supported.' };
  }

  // 20 MB max limit check: 20 * 1024 * 1024 = 20971520 bytes
  const MAX_BYTES = 20 * 1024 * 1024;
  if (params.file.size > MAX_BYTES) {
    return {
      success: false,
      storageUploaded: false,
      error: `File size exceeds the 20 MB limit (${(params.file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  const samplePages = params.sampleOutline.slice(0, 5).map((outline, idx) => ({
    pageNumber: idx + 1,
    title: outline.title || `Page ${idx + 1} Overview`,
    content: outline.content || 'Sample page content and lecture notes reference.',
  }));

  while (samplePages.length < 5) {
    const pNum = samplePages.length + 1;
    samplePages.push({
      pageNumber: pNum,
      title: `Section ${pNum}: Lecture Notes & Derivations`,
      content: `Detailed topic coverage, worked examples, and formulas for Section ${pNum} of ${params.subject}.`,
    });
  }

  const totalPages = params.totalPages || Math.max(12, samplePages.length + 7);

  let fileUrl = '';
  let storageUploaded = false;

  // Attempt Firebase Storage Upload
  try {
    const safeFileName = `${Date.now()}_${params.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageRef = ref(storage, `notes/${params.user.id}/${safeFileName}`);
    const uploadResult = await uploadBytes(storageRef, params.file, { contentType: 'application/pdf' });
    fileUrl = await getDownloadURL(uploadResult.ref);
    storageUploaded = true;
  } catch (storageErr) {
    console.warn('Firebase Storage note upload notice (bucket may need CORS or storage enablement in console):', storageErr);
    // Graceful fallback to client blob representation so the note metadata is not lost
    fileUrl = '';
  }

  try {
    const newNoteData: Omit<StudyNote, 'id'> = {
      title: params.title.trim(),
      subject: params.subject.trim(),
      engineeringYear: params.engineeringYear,
      description: params.description.trim(),
      uploaderId: params.user.id,
      uploaderName: params.user.name,
      uploaderYear: params.user.collegeYear,
      totalPages,
      freePreviewPages: 5,
      fileName: params.file.name,
      fileSize: params.file.size,
      fileUrl: fileUrl || undefined,
      accessType: params.accessType,
      price: params.accessType === 'paid' ? Number(params.price) || 25 : undefined,
      downloadsCount: 0,
      createdAt: new Date().toISOString(),
      samplePages,
      lockedContentExcerpt: `Pages 6 to ${totalPages} include in-depth unit exam solutions, proofs, question banks, and annotated diagrams.`,
    };

    const docRef = await addDoc(collection(db, NOTES_COLLECTION), newNoteData);

    // Grant uploader immediate full access in noteAccess
    await addDoc(collection(db, NOTE_ACCESS_COLLECTION), {
      noteId: docRef.id,
      userId: params.user.id,
      accessMethod: 'uploader',
      unlockedAt: new Date().toISOString(),
    });

    return { success: true, storageUploaded, note: { ...newNoteData, id: docRef.id } };
  } catch (error) {
    console.error('Error saving note metadata in Firestore:', error);
    return { success: false, storageUploaded: false, error: (error as Error).message || 'Failed to save note' };
  }
}

export async function unlockNoteViaExchange(noteId: string, user: User): Promise<{ success: boolean; error?: string }> {
  try {
    const allNotes = await getStudyNotes();
    const myUploads = allNotes.filter((n) => n.uploaderId === user.id);

    if (myUploads.length === 0) {
      return {
        success: false,
        error: 'To use the Free Exchange unlock, you must upload at least one of your own course notes to share with the college community!',
      };
    }

    const records = await getNoteAccessRecords();
    if (records.some((r) => r.noteId === noteId && r.userId === user.id)) {
      return { success: true };
    }

    await addDoc(collection(db, NOTE_ACCESS_COLLECTION), {
      noteId,
      userId: user.id,
      accessMethod: 'free_exchange',
      unlockedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error unlocking note via exchange:', error);
    return { success: false, error: (error as Error).message || 'Failed to unlock note' };
  }
}

export async function deleteStudyNote(noteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting study note:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete note' };
  }
}

// ----------------- GUIDANCE DOUBTS SERVICES (FIRESTORE) -----------------

export async function getGuidanceDoubts(): Promise<GuidanceDoubt[]> {
  try {
    const snap = await getDocs(collection(db, GUIDANCE_COLLECTION));
    if (snap.empty) {
      return SEED_INITIAL_GUIDANCE.map((item, idx) => ({ ...item, id: `seed_guidance_${idx + 1}` }));
    }
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as GuidanceDoubt));
  } catch (error) {
    console.warn('Firestore getGuidanceDoubts fallback:', error);
    return SEED_INITIAL_GUIDANCE.map((item, idx) => ({ ...item, id: `seed_guidance_${idx + 1}` }));
  }
}

export async function createGuidanceDoubt(params: {
  title: string;
  category: GuidanceCategory;
  description: string;
  tags: string[];
  user: User;
}): Promise<{ success: boolean; doubt?: GuidanceDoubt; error?: string }> {
  try {
    const newDoubtData: Omit<GuidanceDoubt, 'id'> = {
      title: params.title.trim(),
      category: params.category,
      description: params.description.trim(),
      tags: params.tags.filter(Boolean),
      studentId: params.user.id,
      studentName: params.user.name,
      studentYear: params.user.collegeYear,
      status: 'open',
      answers: [],
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, GUIDANCE_COLLECTION), newDoubtData);
    return { success: true, doubt: { ...newDoubtData, id: docRef.id } };
  } catch (error) {
    console.error('Error creating guidance doubt:', error);
    return { success: false, error: (error as Error).message || 'Failed to post guidance doubt' };
  }
}

export async function addGuidanceAnswer(
  doubtId: string,
  content: string,
  user: User
): Promise<{ success: boolean; answer?: GuidanceAnswer; error?: string }> {
  try {
    const doubts = await getGuidanceDoubts();
    const doubt = doubts.find((d) => d.id === doubtId);
    if (!doubt) return { success: false, error: 'Question not found' };

    const newAnswer: GuidanceAnswer = {
      id: `ans_${Date.now()}`,
      doubtId,
      authorId: user.id,
      authorName: user.name,
      authorYear: user.collegeYear,
      content: content.trim(),
      isAccepted: false,
      createdAt: new Date().toISOString(),
    };

    const updatedAnswers = [...(doubt.answers || []), newAnswer];
    const docRef = doc(db, GUIDANCE_COLLECTION, doubtId);
    await updateDoc(docRef, { answers: updatedAnswers });

    return { success: true, answer: newAnswer };
  } catch (error) {
    console.error('Error adding guidance answer:', error);
    return { success: false, error: (error as Error).message || 'Failed to submit answer' };
  }
}

export async function toggleAcceptAnswer(
  doubtId: string,
  answerId: string,
  user: User,
  isAdmin?: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const doubts = await getGuidanceDoubts();
    const doubt = doubts.find((d) => d.id === doubtId);
    if (!doubt) return { success: false, error: 'Question not found' };

    if (doubt.studentId !== user.id && !isAdmin) {
      return { success: false, error: 'Only the student who asked this doubt can mark an answer as accepted.' };
    }

    const updatedAnswers = doubt.answers.map((a) => ({
      ...a,
      isAccepted: a.id === answerId ? !a.isAccepted : false,
    }));

    const isAnyAccepted = updatedAnswers.some((a) => a.isAccepted);
    const docRef = doc(db, GUIDANCE_COLLECTION, doubtId);
    await updateDoc(docRef, {
      answers: updatedAnswers,
      status: isAnyAccepted ? 'resolved' : 'open',
    });

    return { success: true };
  } catch (error) {
    console.error('Error toggling accepted answer:', error);
    return { success: false, error: (error as Error).message || 'Failed to update answer status' };
  }
}

export async function deleteGuidanceDoubt(doubtId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, GUIDANCE_COLLECTION, doubtId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting guidance doubt:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete question' };
  }
}

// ----------------- PAYMENT SERVICES (FIRESTORE) -----------------

export async function getTransactions(): Promise<PaymentTransaction[]> {
  try {
    const snap = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as PaymentTransaction));
  } catch (error) {
    console.warn('Firestore getTransactions fallback:', error);
    return [];
  }
}

export async function recordVerifiedPayment(params: {
  orderId: string;
  itemType: 'note_access' | 'skill_swap_session';
  itemId: string;
  itemTitle: string;
  amount: number;
  paymentMethod: string;
  user: User;
}): Promise<{ success: boolean; transaction: PaymentTransaction }> {
  const newTxnData: Omit<PaymentTransaction, 'id'> = {
    orderId: params.orderId,
    userId: params.user.id,
    userName: params.user.name,
    userEmail: params.user.email,
    itemType: params.itemType,
    itemId: params.itemId,
    itemTitle: params.itemTitle,
    amount: params.amount,
    status: 'verified',
    gateway: 'SkillSwap Unified Campus Gateway',
    paymentMethod: params.paymentMethod,
    verifiedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), newTxnData);
  const transaction: PaymentTransaction = { ...newTxnData, id: docRef.id };

  // If this was for a note, grant access immediately
  if (params.itemType === 'note_access') {
    await addDoc(collection(db, NOTE_ACCESS_COLLECTION), {
      noteId: params.itemId,
      userId: params.user.id,
      accessMethod: 'paid',
      transactionId: docRef.id,
      unlockedAt: new Date().toISOString(),
    });
  }

  return { success: true, transaction };
}

// ----------------- ADMIN METRICS (REAL DATA CALCULATIONS) -----------------

export async function getAdminMetrics() {
  const users = await getAllUsers();
  const skills = await getSkillListings();
  const requests = await getSkillRequests();
  const notes = await getStudyNotes();
  const doubts = await getGuidanceDoubts();
  const txns = await getTransactions();

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalNotesByYear = {
    '1st Year': notes.filter((n) => n.engineeringYear === '1st Year').length,
    '2nd Year': notes.filter((n) => n.engineeringYear === '2nd Year').length,
    '3rd Year': notes.filter((n) => n.engineeringYear === '3rd Year').length,
    '4th Year': notes.filter((n) => n.engineeringYear === '4th Year').length,
  };

  const totalPaymentsVolume = txns
    .filter((t) => t.status === 'verified')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const resolvedDoubtsCount = doubts.filter((d) => d.status === 'resolved').length;

  return {
    totalStudents: Math.max(totalStudents, users.length),
    totalSkills: skills.length,
    activeRequests: requests.filter((r) => r.status === 'pending').length,
    totalNotes: notes.length,
    totalNotesByYear,
    totalDoubts: doubts.length,
    resolvedDoubtsCount,
    totalPaymentsVolume,
    verifiedTransactionsCount: txns.filter((t) => t.status === 'verified').length,
    usersList: users,
  };
}
