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

// Storage Keys
const USERS_KEY = 'skillswap_users_v2';
const CURRENT_USER_KEY = 'skillswap_current_user_v2';
const SKILLS_KEY = 'skillswap_skills_v2';
const REQUESTS_KEY = 'skillswap_requests_v2';
const NOTES_KEY = 'skillswap_notes_v2';
const NOTE_ACCESS_KEY = 'skillswap_note_access_v2';
const GUIDANCE_DOUBTS_KEY = 'skillswapGuidanceDoubts'; // As specifically requested in prompt
const TRANSACTIONS_KEY = 'skillswap_transactions_v2';

// Simple client-side cryptographic hashing simulation so plain-text passwords are never stored
export async function hashPassword(password: string, salt = 'skillswap_salt_2026'): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface StoredUserAccount extends User {
  passwordHash: string;
}

// Initial Seed Data
const SEED_USERS: StoredUserAccount[] = [
  {
    id: 'user_admin',
    name: 'Administrator',
    email: 'admin@skillswap.edu',
    role: 'admin',
    collegeYear: 'Staff',
    department: 'Computer Engineering Department',
    bio: 'Platform administration and academic review coordinator.',
    joinedAt: '2026-01-10T10:00:00.000Z',
    passwordHash: 'e7f864cfb1b11c911b3260c6d5668e1a2b724b08f4de13a0e41b3ec1c19b015e', // admin123
  },
  {
    id: 'user_vaishnavi',
    name: 'Vaishnavi Adhav',
    email: 'adhavaishnavi@gmail.com',
    role: 'student',
    collegeYear: '2nd Year',
    department: 'Computer Engineering',
    bio: '2nd year Computer Engineering student passionate about C++, DSA, and web development.',
    joinedAt: '2026-02-01T09:30:00.000Z',
    passwordHash: 'e7f864cfb1b11c911b3260c6d5668e1a2b724b08f4de13a0e41b3ec1c19b015e', // student123
  },
  {
    id: 'user_shruti',
    name: 'Shruti Kulkarni',
    email: 'shruti.kulkarni@college.edu',
    role: 'student',
    collegeYear: '2nd Year',
    department: 'Computer Engineering',
    bio: 'Passionate about Database Management Systems, SQL, and UI/UX prototyping in Figma.',
    joinedAt: '2026-02-05T14:15:00.000Z',
    passwordHash: 'e7f864cfb1b11c911b3260c6d5668e1a2b724b08f4de13a0e41b3ec1c19b015e',
  },
  {
    id: 'user_shubham',
    name: 'Shubham Biradar',
    email: 'shubham.biradar@college.edu',
    role: 'student',
    collegeYear: '2nd Year',
    department: 'Computer Engineering',
    bio: 'Focused on Python, Operating Systems, Linux shell scripting, and microcontrollers.',
    joinedAt: '2026-02-10T11:00:00.000Z',
    passwordHash: 'e7f864cfb1b11c911b3260c6d5668e1a2b724b08f4de13a0e41b3ec1c19b015e',
  },
];

const SEED_SKILLS: SkillSwapListing[] = [
  {
    id: 'skill_1',
    userId: 'user_vaishnavi',
    userName: 'Vaishnavi Adhav',
    userYear: '2nd Year',
    userDepartment: 'Computer Engineering',
    skillOffered: 'Data Structures in C++ (Trees, Graphs & Recursion)',
    category: 'Programming',
    description: 'Can guide through binary trees, graph traversals (BFS/DFS), and standard recursion patterns for semester lab exams.',
    skillRequested: 'Figma UI Wireframing & Design Systems',
    exchangeType: 'free',
    status: 'active',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'skill_2',
    userId: 'user_shruti',
    userName: 'Shruti Kulkarni',
    userYear: '2nd Year',
    userDepartment: 'Computer Engineering',
    skillOffered: 'Database Design, SQL Queries & Normalization',
    category: 'Academics',
    description: 'Happy to explain ER diagrams, relational mapping, BCNF/3NF normalization, and complex JOIN queries.',
    skillRequested: 'Python Automation & Scripting',
    exchangeType: 'free',
    status: 'active',
    createdAt: '2026-03-05T11:20:00.000Z',
  },
  {
    id: 'skill_3',
    userId: 'user_shubham',
    userName: 'Shubham Biradar',
    userYear: '2nd Year',
    userDepartment: 'Computer Engineering',
    skillOffered: 'Linux Command Line, Shell Scripting & Git',
    category: 'Programming',
    description: 'Offering hands-on help setting up Linux environments, bash scripts, and collaborative git branches for college mini-projects.',
    skillRequested: 'Computer Graphics & OpenGL basics',
    exchangeType: 'free',
    status: 'active',
    createdAt: '2026-03-08T15:45:00.000Z',
  },
  {
    id: 'skill_4',
    userId: 'user_vaishnavi',
    userName: 'Vaishnavi Adhav',
    userYear: '2nd Year',
    userDepartment: 'Computer Engineering',
    skillOffered: 'Comprehensive Frontend Development (HTML/Tailwind/React)',
    category: 'Design',
    description: 'Structured 1-on-1 code walkthrough to build responsive web apps from scratch with clean styling and state management.',
    skillRequested: 'Machine Learning Fundamentals',
    exchangeType: 'paid',
    hourlyRate: 80,
    status: 'active',
    createdAt: '2026-03-12T16:00:00.000Z',
  },
];

const SEED_NOTES: StudyNote[] = [
  {
    id: 'note_1',
    title: 'Data Structures and Algorithms (DSA) Complete Unit 1-4 Notes',
    subject: 'Data Structures',
    engineeringYear: '2nd Year',
    description: 'Handwritten and structured PDF notes covering Stacks, Queues, Linked Lists, Binary Search Trees, and Heaps with time-complexity tables.',
    uploaderId: 'user_vaishnavi',
    uploaderName: 'Vaishnavi Adhav',
    uploaderYear: '2nd Year',
    totalPages: 24,
    freePreviewPages: 5,
    fileName: 'DSA_Unit1_to_Unit4_Notes.pdf',
    fileSize: 4850000,
    accessType: 'free_exchange',
    downloadsCount: 18,
    createdAt: '2026-03-02T12:00:00.000Z',
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
    id: 'note_2',
    title: 'Database Management Systems (DBMS) Comprehensive Lab Manual & Notes',
    subject: 'Database Systems',
    engineeringYear: '2nd Year',
    description: 'Comprehensive study guide with relational algebra, SQL DDL/DML cheatsheets, normal forms (1NF to BCNF), and ACID transaction schedules.',
    uploaderId: 'user_shruti',
    uploaderName: 'Shruti Kulkarni',
    uploaderYear: '2nd Year',
    totalPages: 18,
    freePreviewPages: 5,
    fileName: 'DBMS_Exam_Review_Guide.pdf',
    fileSize: 3200000,
    accessType: 'paid',
    price: 35,
    downloadsCount: 22,
    createdAt: '2026-03-06T14:30:00.000Z',
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
  {
    id: 'note_3',
    title: 'Engineering Mathematics - I (Calculus & Linear Algebra)',
    subject: 'Applied Mathematics',
    engineeringYear: '1st Year',
    description: 'Fundamental first-year engineering mathematics: Matrices, Eigenvalues, Cayley-Hamilton Theorem, Partial Differentiation, and Taylor Series.',
    uploaderId: 'user_shubham',
    uploaderName: 'Shubham Biradar',
    uploaderYear: '2nd Year',
    totalPages: 28,
    freePreviewPages: 5,
    fileName: 'Engg_Maths_1_Calculus.pdf',
    fileSize: 6100000,
    accessType: 'free_exchange',
    downloadsCount: 34,
    createdAt: '2026-02-15T09:00:00.000Z',
    samplePages: [
      {
        pageNumber: 1,
        title: 'Chapter 1: Matrices & Rank of a Matrix',
        content: 'Echelon form transformation, canonical forms, finding rank using elementary row transformations without determinant calculation.',
      },
      {
        pageNumber: 2,
        title: 'Chapter 1 (Contd): System of Linear Equations',
        content: 'Homogeneous (AX = 0) and non-homogeneous (AX = B) systems. Consistency check using augmented matrix [A|B].',
      },
      {
        pageNumber: 3,
        title: 'Chapter 2: Eigenvalues & Eigenvectors',
        content: 'Characteristic polynomial det(A - lambda*I) = 0. Properties of eigenvalues for symmetric, orthogonal, and skew-symmetric matrices.',
      },
      {
        pageNumber: 4,
        title: 'Chapter 2 (Contd): Cayley-Hamilton Theorem',
        content: 'Every square matrix satisfies its own characteristic equation. Formula for finding matrix inverse and high powers using C-H theorem.',
      },
      {
        pageNumber: 5,
        title: 'Chapter 3: Successive Differentiation & Leibniz Rule',
        content: 'Standard formulas for nth derivatives of polynomials, exponentials, and trigonometric functions. Leibniz product expansion rule.',
      },
    ],
    lockedContentExcerpt: 'Pages 6 to 28 cover Partial Derivatives, Euler Theorem on Homogeneous Functions, Jacobians, and Maxima/Minima of multivariable functions.',
  },
  {
    id: 'note_4',
    title: 'Computer Networks & Internet Protocols (OSI, TCP/IP & Routing)',
    subject: 'Computer Networks',
    engineeringYear: '3rd Year',
    description: 'Third-year core networking study module covering OSI layers, IP subnetting, CIDR, TCP sliding window, and Dijkstra routing algorithms.',
    uploaderId: 'user_vaishnavi',
    uploaderName: 'Vaishnavi Adhav',
    uploaderYear: '2nd Year',
    totalPages: 22,
    freePreviewPages: 5,
    fileName: 'Computer_Networks_Core_Notes.pdf',
    fileSize: 5200000,
    accessType: 'free_exchange',
    downloadsCount: 15,
    createdAt: '2026-03-10T10:15:00.000Z',
    samplePages: [
      {
        pageNumber: 1,
        title: 'Module 1: Reference Models Comparison (OSI vs TCP/IP)',
        content: 'Layer-by-layer function breakdown: Physical, Data Link, Network, Transport, Session, Presentation, Application. PDU encapsulation.',
      },
      {
        pageNumber: 2,
        title: 'Module 2: Data Link Layer & Framing Protocols',
        content: 'Character count, byte stuffing, and bit stuffing mechanisms. Error detection: CRC (Cyclic Redundancy Check) calculation walkthrough.',
      },
      {
        pageNumber: 3,
        title: 'Module 2 (Contd): Sliding Window Protocols',
        content: 'Stop-and-Wait, Go-Back-N, and Selective Repeat protocols. Efficiency calculations and sequence number range requirements.',
      },
      {
        pageNumber: 4,
        title: 'Module 3: IPv4 Addressing & Subnet Masking',
        content: 'Classful addressing classes (A, B, C, D, E). Classless Inter-Domain Routing (CIDR) subnet division calculations.',
      },
      {
        pageNumber: 5,
        title: 'Module 3 (Contd): Routing Algorithms (Distance Vector & Link State)',
        content: 'Bellman-Ford count-to-infinity problem and solutions. Dijkstra shortest path algorithm matrix execution steps.',
      },
    ],
    lockedContentExcerpt: 'Pages 6 to 22 contain TCP 3-Way Handshake, Congestion Control (Tahoe/Reno), UDP headers, DNS resolution, and HTTP/1.1 vs HTTP/2.',
  },
];

const SEED_GUIDANCE: GuidanceDoubt[] = [
  {
    id: 'guidance_1',
    title: 'How do I choose between Merge Sort and Quick Sort for linked list vs array in exams?',
    category: 'DSA',
    description: 'In our second-year DSA exam, we often get asked why Merge Sort is preferred for sorting a Singly Linked List whereas Quick Sort is preferred for Arrays. Can someone explain the cache locality and pointer differences clearly?',
    tags: ['DSA', 'Sorting', 'Algorithms', 'LinkedList'],
    studentId: 'user_shubham',
    studentName: 'Shubham Biradar',
    studentYear: '2nd Year',
    status: 'resolved',
    createdAt: '2026-03-04T08:30:00.000Z',
    answers: [
      {
        id: 'ans_1',
        doubtId: 'guidance_1',
        authorId: 'user_vaishnavi',
        authorName: 'Vaishnavi Adhav',
        authorYear: '2nd Year',
        content: 'Great question Shubham! Here are the two key reasons:\n1. Merge Sort on Linked Lists does NOT require extra O(N) space because we can rearrange next pointers directly in O(1) auxiliary space without allocating a new array.\n2. Quick Sort on Arrays performs exceptionally well because array elements are contiguous in physical memory, maximizing CPU cache line hits. In a linked list, random pointer chasing hurts Quick Sort partitioning since we cannot do O(1) random index access.\nTherefore, Merge Sort is O(N log N) worst-case and pointer-friendly for Linked Lists, while Quick Sort is in-place and cache-optimal for Arrays.',
        isAccepted: true,
        createdAt: '2026-03-04T10:15:00.000Z',
      },
    ],
  },
  {
    id: 'guidance_2',
    title: 'Confusion with 3NF vs BCNF decomposition condition',
    category: 'Database',
    description: 'I understand that for a functional dependency X -> Y to be in BCNF, X must be a superkey. But what is the exact concession 3NF makes, and what is a prime attribute in practice?',
    tags: ['DBMS', 'Normalization', 'SQL'],
    studentId: 'user_shubham',
    studentName: 'Shubham Biradar',
    studentYear: '2nd Year',
    status: 'resolved',
    createdAt: '2026-03-07T12:00:00.000Z',
    answers: [
      {
        id: 'ans_2',
        doubtId: 'guidance_2',
        authorId: 'user_shruti',
        authorName: 'Shruti Kulkarni',
        authorYear: '2nd Year',
        content: 'For any non-trivial FD X -> Y:\n- BCNF strictly requires: X must be a candidate key or superkey. No exceptions!\n- 3NF is more lenient: Either X is a superkey OR Y is a "prime attribute" (which means Y is part of ANY candidate key of the relation).\n\nWhy does 3NF allow this? Because decomposing down to BCNF might sometimes lose functional dependency preservation. 3NF guarantees both lossless join AND dependency preservation at the cost of slight redundancy.',
        isAccepted: true,
        createdAt: '2026-03-07T13:40:00.000Z',
      },
    ],
  },
  {
    id: 'guidance_3',
    title: 'How should 2nd year students start preparing for Web Development projects?',
    category: 'Projects',
    description: 'We need to submit a mini-project by the end of the semester. Should we use vanilla HTML/CSS/JS or jump directly into React and Express? Any best practices for team repo setup?',
    tags: ['Web Development', 'Projects', 'React', 'Git'],
    studentId: 'user_shruti',
    studentName: 'Shruti Kulkarni',
    studentYear: '2nd Year',
    status: 'open',
    createdAt: '2026-03-11T14:00:00.000Z',
    answers: [
      {
        id: 'ans_3',
        doubtId: 'guidance_3',
        authorId: 'user_vaishnavi',
        authorName: 'Vaishnavi Adhav',
        authorYear: '2nd Year',
        content: 'I recommend spending 1-2 weeks making sure DOM manipulation and async/await are solid, and then moving straight into a React + Vite setup. For the team repo:\n- Agree on a branch strategy (feature branches + pull requests)\n- Keep mock data in a clean service file first before connecting a full backend\n- Focus on completing a working core flow (like user auth + 1 main feature) before adding extra bells and whistles!',
        isAccepted: false,
        createdAt: '2026-03-11T16:20:00.000Z',
      },
    ],
  },
];

// Initialize Storage with seed data if empty
export function initStorage(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(SKILLS_KEY)) {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(SEED_SKILLS));
  }
  if (!localStorage.getItem(NOTES_KEY)) {
    localStorage.setItem(NOTES_KEY, JSON.stringify(SEED_NOTES));
  }
  if (!localStorage.getItem(GUIDANCE_DOUBTS_KEY)) {
    localStorage.setItem(GUIDANCE_DOUBTS_KEY, JSON.stringify(SEED_GUIDANCE));
  }
  if (!localStorage.getItem(REQUESTS_KEY)) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(NOTE_ACCESS_KEY)) {
    localStorage.setItem(NOTE_ACCESS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  }
}

// ----------------- AUTH SERVICES -----------------

export function getStoredUsers(): StoredUserAccount[] {
  initStorage();
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : SEED_USERS;
  } catch {
    return SEED_USERS;
  }
}

export function getCurrentUser(): User | null {
  initStorage();
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export async function registerStudent(params: {
  name: string;
  email: string;
  password: string;
  collegeYear: string;
  department: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  initStorage();
  const users = getStoredUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An account with this email address already exists. Please log in.' };
  }

  const passwordHash = await hashPassword(params.password);
  const newUser: StoredUserAccount = {
    id: `user_${Date.now()}`,
    name: params.name.trim(),
    email: normalizedEmail,
    role: 'student',
    collegeYear: params.collegeYear || '2nd Year',
    department: params.department || 'Computer Engineering',
    joinedAt: new Date().toISOString(),
    passwordHash,
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Strip passwordHash before setting session
  const { passwordHash: _, ...safeUser } = newUser;
  setCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  initStorage();
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'No account found with this email address. Please check or create an account.' };
  }

  const expectedHash = await hashPassword(password);
  if (user.passwordHash !== expectedHash) {
    return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
  }

  const { passwordHash: _, ...safeUser } = user;
  setCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

export function logoutUser(): void {
  setCurrentUser(null);
}

// ----------------- SKILL SWAP SERVICES -----------------

export function getSkillListings(): SkillSwapListing[] {
  initStorage();
  try {
    const raw = localStorage.getItem(SKILLS_KEY);
    return raw ? JSON.parse(raw) : SEED_SKILLS;
  } catch {
    return SEED_SKILLS;
  }
}

export function createSkillListing(params: {
  skillOffered: string;
  category: SkillCategory;
  description: string;
  skillRequested: string;
  exchangeType: ExchangeType;
  hourlyRate?: number;
}): { success: boolean; listing?: SkillSwapListing; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'You must be logged in to post a skill listing.' };
  }

  const listings = getSkillListings();
  const newListing: SkillSwapListing = {
    id: `skill_${Date.now()}`,
    userId: currentUser.id,
    userName: currentUser.name,
    userYear: currentUser.collegeYear,
    userDepartment: currentUser.department,
    skillOffered: params.skillOffered.trim(),
    category: params.category,
    description: params.description.trim(),
    skillRequested: params.skillRequested.trim(),
    exchangeType: params.exchangeType,
    hourlyRate: params.exchangeType === 'paid' ? Number(params.hourlyRate) || 50 : undefined,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  listings.unshift(newListing);
  localStorage.setItem(SKILLS_KEY, JSON.stringify(listings));
  return { success: true, listing: newListing };
}

export function deleteSkillListing(listingId: string): { success: boolean; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'Authentication required' };

  let listings = getSkillListings();
  const target = listings.find((l) => l.id === listingId);
  if (!target) return { success: false, error: 'Listing not found' };

  if (target.userId !== currentUser.id && currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized: you do not have permission to delete this listing.' };
  }

  listings = listings.filter((l) => l.id !== listingId);
  localStorage.setItem(SKILLS_KEY, JSON.stringify(listings));
  return { success: true };
}

export function getSkillRequests(): SkillSwapRequest[] {
  initStorage();
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createSwapRequest(params: {
  listingId: string;
  proposedSkill: string;
  message: string;
}): { success: boolean; request?: SkillSwapRequest; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'You must be logged in to request an exchange.' };
  }

  const listings = getSkillListings();
  const listing = listings.find((l) => l.id === params.listingId);
  if (!listing) return { success: false, error: 'Listing not found.' };

  if (listing.userId === currentUser.id) {
    return { success: false, error: 'You cannot request an exchange with your own listing.' };
  }

  const requests = getSkillRequests();
  const existing = requests.find(
    (r) => r.listingId === params.listingId && r.requesterId === currentUser.id && r.status === 'pending'
  );
  if (existing) {
    return { success: false, error: 'You already have a pending exchange request for this skill listing.' };
  }

  const newRequest: SkillSwapRequest = {
    id: `req_${Date.now()}`,
    listingId: listing.id,
    listingTitle: `${listing.skillOffered} (Offered by ${listing.userName})`,
    ownerId: listing.userId,
    requesterId: currentUser.id,
    requesterName: currentUser.name,
    requesterYear: currentUser.collegeYear,
    requesterEmail: currentUser.email,
    proposedSkill: params.proposedSkill.trim(),
    message: params.message.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  requests.unshift(newRequest);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  return { success: true, request: newRequest };
}

export function updateSwapRequestStatus(
  requestId: string,
  newStatus: 'accepted' | 'rejected'
): { success: boolean; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'Authentication required' };

  const requests = getSkillRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) return { success: false, error: 'Request not found' };

  if (req.ownerId !== currentUser.id && currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized: only the skill listing owner can accept or reject requests.' };
  }

  req.status = newStatus;
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  return { success: true };
}

// ----------------- STUDY NOTES SERVICES -----------------

export function getStudyNotes(): StudyNote[] {
  initStorage();
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : SEED_NOTES;
  } catch {
    return SEED_NOTES;
  }
}

export function getNoteAccessRecords(): NoteAccessRecord[] {
  initStorage();
  try {
    const raw = localStorage.getItem(NOTE_ACCESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function checkHasFullNoteAccess(noteId: string, userId?: string): boolean {
  if (!userId) return false;
  const user = getCurrentUser();
  if (user && user.role === 'admin') return true;

  const notes = getStudyNotes();
  const note = notes.find((n) => n.id === noteId);
  if (!note) return false;

  // Uploader always has full access
  if (note.uploaderId === userId) return true;

  // Check access records
  const records = getNoteAccessRecords();
  return records.some((r) => r.noteId === noteId && r.userId === userId);
}

export function uploadStudyNote(params: {
  title: string;
  subject: string;
  engineeringYear: EngineeringYear;
  description: string;
  fileName: string;
  fileSize: number;
  accessType: 'free_exchange' | 'paid';
  price?: number;
  sampleOutline: Array<{ title: string; content: string }>;
  totalPages?: number;
}): { success: boolean; note?: StudyNote; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'You must be logged in to upload notes.' };

  // Validate PDF extension
  if (!params.fileName.toLowerCase().endsWith('.pdf')) {
    return { success: false, error: 'Invalid file format. Only PDF files are supported.' };
  }

  // 20 MB max limit check: 20 * 1024 * 1024 = 20971520 bytes
  const MAX_BYTES = 20 * 1024 * 1024;
  if (params.fileSize > MAX_BYTES) {
    return { success: false, error: `File size exceeds the 20 MB limit (${(params.fileSize / (1024 * 1024)).toFixed(1)} MB).` };
  }

  const notes = getStudyNotes();
  const samplePages = params.sampleOutline.slice(0, 5).map((outline, idx) => ({
    pageNumber: idx + 1,
    title: outline.title || `Page ${idx + 1} Overview`,
    content: outline.content || 'Sample page content and lecture notes reference.',
  }));

  // Ensure 5 preview pages
  while (samplePages.length < 5) {
    const pNum = samplePages.length + 1;
    samplePages.push({
      pageNumber: pNum,
      title: `Section ${pNum}: Lecture Notes & Derivations`,
      content: `Detailed topic coverage, worked examples, and formulas for Section ${pNum} of ${params.subject}.`,
    });
  }

  const totalPages = params.totalPages || Math.max(12, samplePages.length + 7);

  const newNote: StudyNote = {
    id: `note_${Date.now()}`,
    title: params.title.trim(),
    subject: params.subject.trim(),
    engineeringYear: params.engineeringYear,
    description: params.description.trim(),
    uploaderId: currentUser.id,
    uploaderName: currentUser.name,
    uploaderYear: currentUser.collegeYear,
    totalPages,
    freePreviewPages: 5,
    fileName: params.fileName,
    fileSize: params.fileSize,
    accessType: params.accessType,
    price: params.accessType === 'paid' ? Number(params.price) || 25 : undefined,
    downloadsCount: 0,
    createdAt: new Date().toISOString(),
    samplePages,
    lockedContentExcerpt: `Pages 6 to ${totalPages} include in-depth unit exam solutions, proofs, question banks, and annotated diagrams.`,
  };

  notes.unshift(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));

  // Grant uploader immediate full access
  const accessRecords = getNoteAccessRecords();
  accessRecords.push({
    id: `acc_${Date.now()}`,
    noteId: newNote.id,
    userId: currentUser.id,
    accessMethod: 'uploader',
    unlockedAt: new Date().toISOString(),
  });
  localStorage.setItem(NOTE_ACCESS_KEY, JSON.stringify(accessRecords));

  return { success: true, note: newNote };
}

export function unlockNoteViaExchange(noteId: string): { success: boolean; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'Authentication required' };

  // Check if current user has uploaded at least 1 note to swap
  const allNotes = getStudyNotes();
  const myUploads = allNotes.filter((n) => n.uploaderId === currentUser.id);

  if (myUploads.length === 0) {
    return {
      success: false,
      error: 'To use the Free Exchange unlock, you must upload at least one of your own course notes to share with the college community!',
    };
  }

  const accessRecords = getNoteAccessRecords();
  if (accessRecords.some((r) => r.noteId === noteId && r.userId === currentUser.id)) {
    return { success: true };
  }

  accessRecords.push({
    id: `acc_${Date.now()}`,
    noteId,
    userId: currentUser.id,
    accessMethod: 'free_exchange',
    unlockedAt: new Date().toISOString(),
  });
  localStorage.setItem(NOTE_ACCESS_KEY, JSON.stringify(accessRecords));
  return { success: true };
}

export function deleteStudyNote(noteId: string): { success: boolean; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'Authentication required' };

  let notes = getStudyNotes();
  const target = notes.find((n) => n.id === noteId);
  if (!target) return { success: false, error: 'Note not found' };

  if (target.uploaderId !== currentUser.id && currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized: you do not have permission to delete this note.' };
  }

  notes = notes.filter((n) => n.id !== noteId);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  return { success: true };
}

// ----------------- GUIDANCE DOUBTS SERVICES -----------------

export function getGuidanceDoubts(): GuidanceDoubt[] {
  initStorage();
  try {
    const raw = localStorage.getItem(GUIDANCE_DOUBTS_KEY);
    return raw ? JSON.parse(raw) : SEED_GUIDANCE;
  } catch {
    return SEED_GUIDANCE;
  }
}

export function createGuidanceDoubt(params: {
  title: string;
  category: GuidanceCategory;
  description: string;
  tags: string[];
}): { success: boolean; doubt?: GuidanceDoubt; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'You must be logged in to ask for academic guidance.' };

  const doubts = getGuidanceDoubts();
  const newDoubt: GuidanceDoubt = {
    id: `guidance_${Date.now()}`,
    title: params.title.trim(),
    category: params.category,
    description: params.description.trim(),
    tags: params.tags.filter(Boolean),
    studentId: currentUser.id,
    studentName: currentUser.name,
    studentYear: currentUser.collegeYear,
    status: 'open',
    answers: [],
    createdAt: new Date().toISOString(),
  };

  doubts.unshift(newDoubt);
  localStorage.setItem(GUIDANCE_DOUBTS_KEY, JSON.stringify(doubts));
  return { success: true, doubt: newDoubt };
}

export function addGuidanceAnswer(
  doubtId: string,
  content: string
): { success: boolean; answer?: GuidanceAnswer; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'You must be logged in to submit an answer.' };

  const doubts = getGuidanceDoubts();
  const doubt = doubts.find((d) => d.id === doubtId);
  if (!doubt) return { success: false, error: 'Guidance question not found' };

  const newAnswer: GuidanceAnswer = {
    id: `ans_${Date.now()}`,
    doubtId,
    authorId: currentUser.id,
    authorName: currentUser.name,
    authorYear: currentUser.collegeYear,
    content: content.trim(),
    isAccepted: false,
    createdAt: new Date().toISOString(),
  };

  doubt.answers.push(newAnswer);
  localStorage.setItem(GUIDANCE_DOUBTS_KEY, JSON.stringify(doubts));
  return { success: true, answer: newAnswer };
}

export function toggleAcceptAnswer(
  doubtId: string,
  answerId: string
): { success: boolean; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'Authentication required' };

  const doubts = getGuidanceDoubts();
  const doubt = doubts.find((d) => d.id === doubtId);
  if (!doubt) return { success: false, error: 'Question not found' };

  if (doubt.studentId !== currentUser.id && currentUser.role !== 'admin') {
    return { success: false, error: 'Only the student who asked this doubt can mark an answer as accepted.' };
  }

  const ans = doubt.answers.find((a) => a.id === answerId);
  if (!ans) return { success: false, error: 'Answer not found' };

  // Toggle acceptance
  const willBeAccepted = !ans.isAccepted;
  doubt.answers.forEach((a) => (a.isAccepted = false));
  ans.isAccepted = willBeAccepted;
  doubt.status = willBeAccepted ? 'resolved' : 'open';

  localStorage.setItem(GUIDANCE_DOUBTS_KEY, JSON.stringify(doubts));
  return { success: true };
}

export function deleteGuidanceDoubt(doubtId: string): { success: boolean; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: 'Authentication required' };

  let doubts = getGuidanceDoubts();
  const target = doubts.find((d) => d.id === doubtId);
  if (!target) return { success: false, error: 'Doubt not found' };

  if (target.studentId !== currentUser.id && currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized: you do not have permission to delete this doubt.' };
  }

  doubts = doubts.filter((d) => d.id !== doubtId);
  localStorage.setItem(GUIDANCE_DOUBTS_KEY, JSON.stringify(doubts));
  return { success: true };
}

// ----------------- PAYMENT SERVICES -----------------

export function getTransactions(): PaymentTransaction[] {
  initStorage();
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordVerifiedPayment(params: {
  orderId: string;
  itemType: 'note_access' | 'skill_swap_session';
  itemId: string;
  itemTitle: string;
  amount: number;
  paymentMethod: string;
}): { success: boolean; transaction: PaymentTransaction } {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Authentication required for payment verification');

  const transactions = getTransactions();
  const newTxn: PaymentTransaction = {
    id: `txn_${Date.now()}`,
    orderId: params.orderId,
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    itemType: params.itemType,
    itemId: params.itemId,
    itemTitle: params.itemTitle,
    amount: params.amount,
    status: 'verified',
    gateway: 'SkillSwap Unified Campus Gateway',
    paymentMethod: params.paymentMethod,
    verifiedAt: new Date().toISOString(),
  };

  transactions.unshift(newTxn);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

  // If this was for a note, grant access immediately
  if (params.itemType === 'note_access') {
    const accessRecords = getNoteAccessRecords();
    accessRecords.push({
      id: `acc_${Date.now()}`,
      noteId: params.itemId,
      userId: currentUser.id,
      accessMethod: 'paid',
      transactionId: newTxn.id,
      unlockedAt: new Date().toISOString(),
    });
    localStorage.setItem(NOTE_ACCESS_KEY, JSON.stringify(accessRecords));
  }

  return { success: true, transaction: newTxn };
}

// ----------------- ADMIN METRICS -----------------

export function getAdminMetrics() {
  const users = getStoredUsers();
  const skills = getSkillListings();
  const requests = getSkillRequests();
  const notes = getStudyNotes();
  const doubts = getGuidanceDoubts();
  const txns = getTransactions();

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
    totalStudents,
    totalSkills: skills.length,
    activeRequests: requests.filter((r) => r.status === 'pending').length,
    totalNotes: notes.length,
    totalNotesByYear,
    totalDoubts: doubts.length,
    resolvedDoubtsCount,
    totalPaymentsVolume,
    verifiedTransactionsCount: txns.filter((t) => t.status === 'verified').length,
    usersList: users.map(({ passwordHash: _, ...u }) => u),
  };
}
