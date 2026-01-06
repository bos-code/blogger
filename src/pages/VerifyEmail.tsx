import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { sendVerificationEmail, reloadAuthUser } from "../stores/authStore";
import { showError, showSuccess } from "../utils/sweetalert";
import { motion } from "framer-motion";
import PremiumSpinner, { CompactSpinner } from "../components/PremiumSpinner";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function VerifyEmail(): React.ReactElement {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const emailVerified = useAuthStore((state) => state.emailVerified);
  const logStatus = useAuthStore((state) => state.logStatus);

  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!logStatus || !user) {
      navigate("/login");
    }
  }, [logStatus, user, navigate]);

  // Redirect if already verified
  useEffect(() => {
    if (emailVerified && logStatus) {
      navigate("/admin");
    }
  }, [emailVerified, logStatus, navigate]);

  const handleResendVerification = async (): Promise<void> => {
    setIsSending(true);
    try {
      await sendVerificationEmail();
      showSuccess(
        "Verification Email Sent",
        "Please check your email and click the verification link. The link will expire in 1 hour."
      );
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to send verification email.";
      showError("Error", errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async (): Promise<void> => {
    setIsChecking(true);
    try {
      await reloadAuthUser();
      if (emailVerified) {
        showSuccess(
          "Email Verified!",
          "Your email has been verified successfully."
        );
        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      } else {
        showError(
          "Not Verified Yet",
          "Your email is still not verified. Please check your email and click the verification link."
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to check verification status.";
      showError("Error", errorMessage);
    } finally {
      setIsChecking(false);
    }
  };

  if (!logStatus || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PremiumSpinner size="lg" variant="primary" text="Loading..." />
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
            {emailVerified ? (
              <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
            ) : (
              <EnvelopeIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold text-base-content mb-2">
              {emailVerified ? "Email Verified!" : "Verify Your Email"}
            </h1>
            <p className="text-base-content/70">
              {emailVerified
                ? "Your email has been verified successfully."
                : `We've sent a verification email to ${user.email}`}
            </p>
          </div>

          {!emailVerified && (
            <>
              {/* Instructions */}
              <div className="alert alert-info mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div className="text-sm">
                  <p className="font-semibold">Check your inbox</p>
                  <p>
                    Click the verification link in the email to verify your
                    account. The link will expire in 1 hour.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  className="btn btn-primary w-full"
                  onClick={handleResendVerification}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <CompactSpinner size="sm" variant="primary" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-5 h-5" />
                      Resend Verification Email
                    </>
                  )}
                </button>

                <button
                  className="btn btn-outline w-full"
                  onClick={handleCheckVerification}
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <CompactSpinner size="sm" variant="primary" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      I've Verified My Email
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {emailVerified && (
            <button
              className="btn btn-primary w-full mt-4"
              onClick={() => navigate("/admin")}
            >
              Go to Dashboard
            </button>
          )}

          {/* Sign Out Option */}
          <div className="text-center mt-6">
            <button
              className="link link-hover text-sm text-base-content/60"
              onClick={async () => {
                await useAuthStore.getState().signOut();
                navigate("/login");
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
