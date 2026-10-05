import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import {
  signIn,
  resetPassword,
  signInWithGoogle,
  signInWithApple,
  sendEmailLink,
  useAuthStore,
} from "../stores/authStore";
import AuthLayout from "../components/auth/AuthLayout";
import PasswordInput from "../components/auth/PasswordInput";
import SocialButtons from "../components/auth/SocialButtons";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { getAuthErrorMessage } from "../utils/authErrors";
import { showSuccess } from "../utils/sweetalert";

type Mode = "password" | "reset" | "link";

export default function Login(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/admin";
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const logStatus = useAuthStore((state) => state.logStatus);

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"password" | "reset" | "link" | "google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<{ kind: "reset" | "link"; email: string } | null>(null);

  useDocumentMeta({ title: "Log in", noIndex: true });

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  if (logStatus) return <Navigate to={redirectTo} replace />;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSentTo(null);
  };

  const requireEmail = (): string | null => {
    const value = email.trim();
    if (!value) {
      setError("Please enter your email address.");
      return null;
    }
    return value;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const value = requireEmail();
    if (!value) return;

    if (mode === "password") {
      if (!password) return setError("Please enter your password.");
      setBusy("password");
      try {
        await signIn(value, password);
        showSuccess("Welcome back!");
        navigate(redirectTo, { replace: true });
      } catch (signInError) {
        setError(getAuthErrorMessage(signInError, "Failed to sign in. Please try again."));
      } finally {
        setBusy(null);
      }
      return;
    }

    setBusy(mode);
    try {
      if (mode === "reset") await resetPassword(value);
      else await sendEmailLink(value);
      setSentTo({ kind: mode, email: value });
    } catch (sendError) {
      setError(getAuthErrorMessage(sendError, "That didn't work. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  const handleProvider = async (provider: "google" | "apple") => {
    setError(null);
    setBusy(provider);
    try {
      const signedIn = provider === "google" ? await signInWithGoogle() : await signInWithApple();
      if (!signedIn) return;
      showSuccess("Welcome!");
      navigate(redirectTo, { replace: true });
    } catch (providerError) {
      setError(getAuthErrorMessage(providerError, "Sign-in failed. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  const titles: Record<Mode, { title: string; subtitle: string }> = {
    password: { title: "Welcome back", subtitle: "Log in to comment, like posts and manage your writing." },
    reset: { title: "Reset your password", subtitle: "We'll email you a link to choose a new password." },
    link: { title: "Email me a sign-in link", subtitle: "No password needed — we'll send a one-time link." },
  };

  return (
    <AuthLayout
      title={titles[mode].title}
      subtitle={titles[mode].subtitle}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="link link-primary font-medium">
            Sign up
          </Link>
        </>
      }
    >
      {sentTo ? (
        <div role="status" className="flex flex-col items-center gap-3 text-center">
          <span className="rounded-full bg-success/15 p-3 text-success">
            <EnvelopeIcon className="h-7 w-7" />
          </span>
          <p className="font-semibold">Check your inbox</p>
          <p className="text-sm text-base-content/70">
            {sentTo.kind === "reset"
              ? `If an account exists for ${sentTo.email}, you'll get a password reset link shortly.`
              : `We sent a sign-in link to ${sentTo.email}. Open it on this device to finish signing in.`}
          </p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => switchMode("password")}>
            Back to log in
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="login-email" className="field-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                className="input w-full"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy !== null}
                required
              />
            </div>

            {mode === "password" && (
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="field-label">
                    Password
                  </label>
                  <button type="button" className="link link-primary mb-1.5 text-xs" onClick={() => switchMode("reset")}>
                    Forgot password?
                  </button>
                </div>
                <PasswordInput
                  id="login-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy !== null}
                  required
                />
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={busy !== null}>
              {busy === mode && <span className="loading loading-spinner loading-sm" />}
              {mode === "password" ? "Log in" : mode === "reset" ? "Send reset link" : "Send sign-in link"}
            </button>
          </form>

          {mode === "password" ? (
            <>
              <div className="divider my-6 text-xs text-base-content/55">OR</div>
              <div className="flex flex-col gap-2">
                <SocialButtons
                  onGoogle={() => void handleProvider("google")}
                  onApple={() => void handleProvider("apple")}
                  loading={busy === "google" || busy === "apple" ? busy : null}
                  disabled={busy !== null}
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => switchMode("link")}>
                  Email me a sign-in link instead
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm mt-3 w-full" onClick={() => switchMode("password")}>
              Back to log in
            </button>
          )}
        </>
      )}
    </AuthLayout>
  );
}
