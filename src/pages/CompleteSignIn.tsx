import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { checkEmailLink, completeEmailLinkSignIn, useAuthStore } from "../stores/authStore";
import AuthLayout from "../components/auth/AuthLayout";
import PremiumSpinner from "../components/PremiumSpinner";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { getAuthErrorMessage } from "../utils/authErrors";
import { showSuccess } from "../utils/sweetalert";

const storedEmail = (): string => {
  try {
    return localStorage.getItem("emailForSignIn") ?? "";
  } catch {
    return "";
  }
};

export default function CompleteSignIn(): React.ReactElement {
  const logStatus = useAuthStore((state) => state.logStatus);
  const [hasLink] = useState(checkEmailLink);
  const [email, setEmail] = useState(storedEmail);
  const [needsEmail] = useState(() => !storedEmail());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useDocumentMeta({ title: "Finish signing in", noIndex: true });

  const complete = async (address: string) => {
    setBusy(true);
    setError(null);
    try {
      await completeEmailLinkSignIn(address.trim());
      showSuccess("You're signed in");
    } catch (signInError) {
      setError(getAuthErrorMessage(signInError, "Failed to complete sign-in. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  // Same device: the email was remembered, so finish automatically.
  useEffect(() => {
    if (hasLink && !needsEmail && email && !attempted.current && !logStatus) {
      attempted.current = true;
      void complete(email);
    }
  }, [hasLink, needsEmail, email, logStatus]);

  if (logStatus) return <Navigate to="/admin" replace />;

  if (!hasLink) {
    return (
      <AuthLayout title="This link isn't valid" subtitle="It may have expired or already been used.">
        <div className="flex flex-col items-center gap-4 text-center">
          <ExclamationTriangleIcon className="h-10 w-10 text-warning" />
          <Link to="/login" className="btn btn-primary w-full">
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (busy && !needsEmail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PremiumSpinner size="lg" text="Signing you in..." />
      </div>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return setError("Please enter your email address.");
    void complete(email);
  };

  return (
    <AuthLayout
      title="Finish signing in"
      subtitle={needsEmail ? "For security, confirm the email address the link was sent to." : undefined}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="complete-email" className="field-label">
            Email
          </label>
          <input
            id="complete-email"
            type="email"
            autoComplete="email"
            className="input w-full"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy && <span className="loading loading-spinner loading-sm" />}
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
