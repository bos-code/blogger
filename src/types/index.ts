// User types
export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL?: string | null;
}

export type UserRole = "admin" | "writer" | "user" | "reader";

// Blog/Post types
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
  status?: "pending" | "approved" | "rejected";
  category?: string;
  tags?: string[];
  views?: number;
  likes?: number;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  blogId?: string;
  createdAt?: any; // Firestore Timestamp
  read?: boolean;
}

// Auth Store types
export interface AuthState {
  user: User | null;
  role: UserRole | null;
  logStatus: boolean;
  authError: string | null;
  displayStatus: "loading" | "ready" | "error";
  setUser: (user: User, role: UserRole) => void;
  setAuthError: (error: string) => void;
  clearAuthError: () => void;
  signOut: () => void;
  initAuth: () => (() => void) | undefined;
}

// UI Store types
export interface UIState {
  dashboardScreen: "home" | "posts" | "users" | "settings" | "categories" | "profile";
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

