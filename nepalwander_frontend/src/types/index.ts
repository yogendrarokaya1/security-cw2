// ── User ──────────────────────────────────────────────
export enum UserRole {
  TOURIST = "tourist",
  GUIDE = "guide",
  OPERATOR = "operator",
  ADMIN = "admin",
}

export enum AccountStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isVerified: boolean;
  isActive: boolean;
  isSuperAdmin?: boolean;
  profileImage?: string;
  phone?: string;
  nationality?: string;
  createdAt: string;
}

// ── Auth ──────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  nationality?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

// ── Destination ───────────────────────────────────────
export interface Season {
  month: string;
  status: "best" | "shoulder" | "avoid";
}

export interface SafetyInfo {
  riskLevel: string;
  nearestHospital: string;
  emergencyContact: string;
  rescueService: string;
  timsRequired: boolean;
  timsCheckpoint?: string;
}

export interface Destination {
  _id: string;
  name: string;
  slug: string;
  description: string;
  region: string;
  altitude: number;
  difficulty: string;
  images: string[];
  coverImage: string;
  location: {
    latitude: number;
    longitude: number;
  };
  seasonalCalendar: Season[];
  safetyInfo: SafetyInfo;
  localTips: string[];
  bestFor: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

// ── Package ───────────────────────────────────────────
export interface DayItinerary {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
  distance?: number;
}

export interface CostBreakdown {
  transport: number;
  accommodation: number;
  meals: number;
  guide: number;
  permits: number;
  other: number;
}

export interface Package {
  _id: string;
  title: string;
  slug: string;
  description: string;
  destination: Destination | string;
  duration: number;
  groupSize: {
    min: number;
    max: number;
  };
  difficulty: string;
  price: number;
  costBreakdown: CostBreakdown;
  itinerary: DayItinerary[];
  includes: string[];
  excludes: string[];
  images: string[];
  coverImage: string;
  status: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  ecoScore: number;
  createdAt: string;
}

// ── Booking ───────────────────────────────────────────
export interface Traveler {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber?: string;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  user: User | string;
  package: Package | string;
  travelers: Traveler[];
  groupSize: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  specialRequests?: string;
  status: string;
  payment: {
    method: string;
    status: string;
    amount: number;
    transactionId?: string;
    paidAt?: string;
  };
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
}

// ── Guide ─────────────────────────────────────────────
export interface Certification {
  name: string;
  issuedBy: string;
  issuedYear: number;
  certificateNumber?: string;
}

export interface GuideReview {
  user: User | string;
  booking: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Guide {
  _id: string;
  user: User;
  bio: string;
  specialties: string[];
  languages: string[];
  experience: number;
  certifications: Certification[];
  nmaCertNumber?: string;
  isNmaVerified: boolean;
  profileImage?: string;
  pricePerDay: number;
  regions: string[];
  reviews: GuideReview[];
  rating: number;
  reviewCount: number;
  totalTrips: number;
  isAvailable: boolean;
  isActive: boolean;
}

// ── API Response ──────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
}