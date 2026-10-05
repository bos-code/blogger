/**
 * Maps Firebase Auth/Firestore errors to messages that are safe and useful to
 * show to people. Firebase prefixes every error with "Firebase:", so matching
 * on that word alone would misreport ordinary failures as configuration
 * problems; match on error codes instead.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/invalid-login-credentials":
    "Incorrect email or password. Please try again.",
  "auth/user-not-found": "Incorrect email or password. Please try again.",
  "auth/wrong-password": "Incorrect email or password. Please try again.",
  "auth/invalid-email": "Invalid email address format.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/email-already-in-use":
    "An account with this email already exists. Please sign in instead.",
  "auth/weak-password": "Password is too weak. Please use a stronger password.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed":
    "Network error. Please check your connection.",
  "auth/popup-blocked":
    "The sign-in popup was blocked by the browser. Allow popups and try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/operation-not-allowed":
    "This sign-in method is not enabled for this site.",
  "auth/unauthorized-domain":
    "This domain is not authorized for sign-in. Add it in Firebase Authentication settings.",
  "auth/invalid-action-code":
    "This link has expired or is invalid. Please request a new one.",
  "auth/expired-action-code":
    "This link has expired. Please request a new one.",
  "auth/requires-recent-login":
    "For security, please sign in again before making this change.",
  "auth/missing-password": "Please enter your password.",
  "auth/invalid-api-key":
    "Firebase is not configured. Add your Firebase credentials to a .env file.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    "Firebase is not configured. Add your Firebase credentials to a .env file.",
  "permission-denied":
    "You don't have permission to do that. Make sure your email is verified.",
};

const extractErrorCode = (error: unknown): string | null => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const { code } = error as { code: unknown };
    if (typeof code === "string") return code;
  }

  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const match = /\(([a-z-]+\/[a-z0-9.-]+)\)/i.exec(message);
  return match ? match[1].toLowerCase() : null;
};

export const getAuthErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  const code = extractErrorCode(error);
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];

  if (error instanceof Error && error.message && !error.message.startsWith("Firebase")) {
    return error.message;
  }

  return fallback;
};

export const isPopupCancellation = (error: unknown): boolean => {
  const code = extractErrorCode(error);
  return (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request"
  );
};
