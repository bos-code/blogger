import type { Timestamp } from "firebase/firestore";

// User types
export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
  nickname?: string | null;
  bio?: string | null;
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
  coverImageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  series?: string | null;
  seriesOrder?: number | null;
  featured?: boolean;
  rejectionReason?: string | null;
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
      | "coverImageAlt"
      | "seoTitle"
      | "seoDescription"
      | "series"
      | "seriesOrder"
    >
  >;

export interface PostRevision {
  id: string;
  title: string;
  content: string;
  savedBy: string;
  savedByName: string | null;
  createdAt?: DateValue;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  parentId?: string | null;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  imageUrl?: string | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
  tech?: string[];
  role?: string | null;
  order?: number;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt?: DateValue;
}

// Notification types
export interface Notification {
  id: string;
  /** A user's uid, "all" (every signed-in user) or "admins". */
  userId: string;
  type: string;
  message: string;
  blogId?: string;
  link?: string;
  createdAt?: DateValue;
  read?: boolean;
  /** For shared notifications: users who have read it. */
  readBy?: string[];
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
  dashboardScreen:
    | "home"
    | "posts"
    | "users"
    | "categories"
    | "profile"
    | "saved"
    | "messages"
    | "analytics"
    | "projects"
    | "subscribers";
  setDashboardScreen: (screen: UIState["dashboardScreen"]) => void;
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
