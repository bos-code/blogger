import { useState, useEffect, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp, signInWithGoogle, signInWithApple } from "../stores/authStore";
import { useAuthStore } from "../stores/authStore";
import { motion } from "framer-motion";
import { showError, showSuccess } from "../utils/sweetalert";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function Signup(): React.ReactElement {
  const navigate = useNavigate();
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const logStatus = useAuthStore((state) => state.logStatus);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // Clear auth error when component mounts
  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validation
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      showError("Validation Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      showError(
        "Validation Error",
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      showError("Validation Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      showSuccess(
        "Account Created!",
        "Your account has been created successfully. You are now logged in."
      );
      navigate("/admin");
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message ||
        "Failed to create account. Please try again.";
      let userFriendlyMessage = errorMessage;

      // Convert Firebase error codes to user-friendly messages
      if (errorMessage.includes("auth/email-already-in-use")) {
        userFriendlyMessage =
          "An account with this email already exists. Please sign in instead.";
      } else if (errorMessage.includes("auth/invalid-email")) {
        userFriendlyMessage = "Invalid email address format.";
      } else if (errorMessage.includes("auth/weak-password")) {
        userFriendlyMessage =
          "Password is too weak. Please use a stronger password.";
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

      showError("Sign Up Failed", userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      showSuccess(
        "Account Created!",
        "Your account has been created with Google successfully."
      );
      navigate("/admin");
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to sign up with Google.";
      if (
        !errorMessage.includes("popup-closed") &&
        !errorMessage.includes("cancelled")
      ) {
        showError("Google Sign Up Failed", errorMessage);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async (): Promise<void> => {
    setIsAppleLoading(true);
    try {
      await signInWithApple();
      showSuccess(
        "Account Created!",
        "Your account has been created with Apple successfully."
      );
      navigate("/admin");
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to sign up with Apple.";
      if (
        !errorMessage.includes("popup-closed") &&
        !errorMessage.includes("cancelled")
      ) {
        showError("Apple Sign Up Failed", errorMessage);
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  // Redirect if already logged in
  if (logStatus) {
    navigate("/admin");
    return <div>Redirecting...</div>;
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
            <h1 className="text-3xl font-bold text-base-content mb-2">
              Create Account
            </h1>
            <p className="text-base-content/70">Sign up to get started</p>
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Full Name
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="name"
              />
            </div>

            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email
                </span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <LockClosedIcon className="w-4 h-4" />
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password (min 6 characters)"
                  className="input input-bordered w-full pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <LockClosedIcon className="w-4 h-4" />
                  Confirm Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="input input-bordered w-full pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>

          {/* Social Sign Up */}
          <div className="divider my-6">OR</div>

          {/* Google Sign Up */}
          <button
            type="button"
            className="btn btn-outline w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isAppleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <>
                <span className="loading loading-spinner"></span>
                Signing up...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Apple Sign Up */}
          <button
            type="button"
            className="btn btn-outline w-full gap-2 bg-base-content text-base-100 hover:bg-base-content/90"
            onClick={handleAppleSignIn}
            disabled={isGoogleLoading || isAppleLoading || isLoading}
          >
            {isAppleLoading ? (
              <>
                <span className="loading loading-spinner"></span>
                Signing up...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </>
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-base-content/70">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link
              to="/"
              className="link link-hover text-sm text-base-content/60"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
