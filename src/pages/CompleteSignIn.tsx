import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  completeEmailLinkSignIn,
  checkEmailLink,
} from "../stores/authStore";
import { useAuthStore } from "../stores/authStore";
import { motion } from "framer-motion";
import { showError, showSuccess } from "../utils/sweetalert";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import PremiumSpinner, { CompactSpinner } from "../components/PremiumSpinner";

export default function CompleteSignIn(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const logStatus = useAuthStore((state) => state.logStatus);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasEmailLink, setHasEmailLink] = useState(false);
  const [needsEmail, setNeedsEmail] = useState(false);

  // Clear auth error when component mounts
  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  // Check if URL contains email link on mount
  useEffect(() => {
    const checkLink = async (): Promise<void> => {
      setIsChecking(true);
      try {
        const hasLink = checkEmailLink();
        setHasEmailLink(hasLink);

        // Check if email is stored in localStorage (same device)
        const storedEmail = localStorage.getItem("emailForSignIn");
        if (storedEmail) {
          setEmail(storedEmail);
          setNeedsEmail(false);
        } else {
          // Cross-device scenario - need email confirmation
          setNeedsEmail(true);
        }
      } catch (error) {
        console.error("Error checking email link:", error);
        setHasEmailLink(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkLink();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (logStatus) {
      navigate("/admin");
    }
  }, [logStatus, navigate]);

  const handleCompleteSignIn = async (
    e?: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    if (e) {
      e.preventDefault();
    }

    if (!email.trim()) {
      showError("Validation Error", "Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await completeEmailLinkSignIn(email.trim());
      showSuccess(
        "Sign In Successful!",
        "You have been signed in successfully. Redirecting..."
      );
      // Small delay to show success message
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to complete sign-in. Please try again.";
      let userFriendlyMessage = errorMessage;

      // Convert Firebase error codes to user-friendly messages
      if (errorMessage.includes("auth/invalid-action-code")) {
        userFriendlyMessage =
          "This sign-in link has expired or is invalid. Please request a new one.";
      } else if (errorMessage.includes("auth/expired-action-code")) {
        userFriendlyMessage =
          "This sign-in link has expired. Please request a new one.";
      } else if (errorMessage.includes("auth/invalid-email")) {
        userFriendlyMessage = "Invalid email address format.";
      } else if (errorMessage.includes("auth/user-disabled")) {
        userFriendlyMessage = "This account has been disabled.";
      } else if (errorMessage.includes("auth/network-request-failed")) {
        userFriendlyMessage = "Network error. Please check your connection.";
      } else if (
        errorMessage.includes("apiKey") ||
        errorMessage.includes("Firebase") ||
        errorMessage.includes("auth/invalid-api-key")
      ) {
        userFriendlyMessage =
          "Firebase is not configured. Please set up your Firebase credentials in a .env file. See FIREBASE_SETUP.md for instructions.";
      }

      showError("Sign In Failed", userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-complete if email is stored (same device)
  useEffect(() => {
    if (hasEmailLink && email && !needsEmail && !isLoading && !logStatus) {
      handleCompleteSignIn();
    }
  }, [hasEmailLink, email, needsEmail]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PremiumSpinner size="lg" text="Checking sign-in link..." />
      </div>
    );
  }

  if (!hasEmailLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card bg-base-100 shadow-2xl w-full max-w-md text-center"
        >
          <div className="card-body p-8">
            <ExclamationTriangleIcon className="w-20 h-20 text-warning mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-base-content mb-2">
              Invalid Sign-In Link
            </h1>
            <p className="text-base-content/70 mb-6">
              This sign-in link is invalid or has expired. Please request a new
              sign-in link from the login page.
            </p>
            <button
              className="btn btn-primary w-full"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card bg-base-100 shadow-2xl w-full max-w-md"
      >
        <div className="card-body p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-base-content mb-2">
              Complete Sign In
            </h1>
            <p className="text-base-content/70">
              {needsEmail
                ? "Please confirm your email address to complete sign-in."
                : "Completing your sign-in..."}
            </p>
          </div>

          {/* Error Display */}
          {authError && (
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{authError}</span>
            </div>
          )}

          {/* Email Confirmation Form (for cross-device) */}
          {needsEmail && (
            <form onSubmit={handleCompleteSignIn} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="Enter the email where you received the link"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Enter the email address where you received the sign-in link
                  </span>
                </label>
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <CompactSpinner size="sm" variant="primary" />
                      <span>Completing sign-in...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Complete Sign In
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Loading State (same device auto-complete) */}
          {!needsEmail && isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <PremiumSpinner size="md" text="Completing sign-in..." />
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6">
            <button
              className="btn btn-ghost text-base-content/60 hover:text-base-content"
              onClick={() => navigate("/login")}
              disabled={isLoading}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

