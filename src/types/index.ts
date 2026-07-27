import type { Timestamp } from "firebase/firestore";

// User types
export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
}

export type UserRole = "super_admin" | "admin" | "writer" | "user" | "reader";

// Blog/Post types
export type PostStatus = "draft" | "pending" | "approved" | "rejected";
export type DateValue = Timestamp | Date | string | number | null;

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  authorId: string;
  authorName: string | null; // Can be null if not set during post creation
  authorAvatar?: string | null;
  createdAt?: DateValue;
  updatedAt?: DateValue;
  status?: PostStatus;
  category?: string;
  tags?: string[];
  views?: number;
  likes?: number; // Deprecated: use likedBy.length instead, kept for backward compatibility
  likedBy?: string[]; // Array of user IDs who liked this post
  readingTime?: number; // in minutes
  technicalStack?: string[];
  scheduledFor?: DateValue;
}

export type CreatePostInput = Pick<BlogPost, "title" | "content"> &
  Partial<
    Pick<
      BlogPost,
      | "excerpt"
      | "coverImage"
      | "status"
      | "category"
      | "tags"
      | "views"
      | "likedBy"
      | "likes"
      | "readingTime"
      | "technicalStack"
      | "scheduledFor"
    >
  >;

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  blogId?: string;
  createdAt?: DateValue;
  read?: boolean;
}

// Auth Store types
export interface AuthState {
  user: User | null;
  role: UserRole | null;
  logStatus: boolean;
  authError: string | null;
  displayStatus: "loading" | "ready" | "error";
  emailVerified: boolean;
  setUser: (user: User, role: UserRole) => void;
  setAuthError: (error: string) => void;
  clearAuthError: () => void;
  setEmailVerified: (verified: boolean) => void;
  signOut: () => void;
  initAuth: () => (() => void) | undefined;
}

// UI Store types
export interface UIState {
  dashboardScreen: "home" | "posts" | "users" | "settings" | "categories" | "profile" | "super_admin";
  openModal: boolean;
  selectedBlog: BlogPost | null;
  setDashboardScreen: (screen: UIState["dashboardScreen"]) => void;
  openApprovalModal: (blog: BlogPost) => void;
  closeModal: () => void;
}

// Notification Store types
export interface NotificationData {
  type: "success" | "error" | "info";
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
}

export interface NotificationState {
  notification: NotificationData | null;
  showNotification: (notification: NotificationData | null) => void;
  hideNotification: () => void;
}

// AI Service types
export interface AIGenerateOptions {
  topic: string;
  length?: "short" | "medium" | "long";
}

export interface SEOSuggestions {
  keywords: string[];
  metaDescription: string;
  suggestions: string[];
}

export interface GrammarCheck {
  errors: Array<{
    message: string;
    offset: number;
    length: number;
  }>;
  suggestions: string[];
  score: number;
}
