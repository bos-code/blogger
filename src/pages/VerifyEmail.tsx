import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { reloadAuthUser, sendVerificationEmail, useAuthStore } from "../stores/authStore";
import AuthLayout from "../components/auth/AuthLayout";
import PremiumSpinner from "../components/PremiumSpinner";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { getAuthErrorMessage } from "../utils/authErrors";
import { showSuccess } from "../utils/sweetalert";

const RESEND_COOLDOWN = 60;

export default function VerifyEmail(): React.ReactElement {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const emailVerified = useAuthStore((state) => state.emailVerified);
  const logStatus = useAuthStore((state) => state.logStatus);
  const displayStatus = useAuthStore((state) => state.displayStatus);
  const signOut = useAuthStore((state) => state.signOut);

  const [busy, setBusy] = useState<"send" | "check" | null>(null);
  const [message, setMessage] = useState<{ kind: "info" | "error"; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useDocumentMeta({ title: "Verify your email", noIndex: true });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  // Check automatically when the tab regains focus (e.g. after clicking the email link).
  useEffect(() => {
    const onFocus = () => {
      if (!emailVerified) void reloadAuthUser();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [emailVerified]);

  if (displayStatus === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PremiumSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  if (!logStatus || !user) return <Navigate to="/login" replace />;
  if (emailVerified) return <Navigate to="/admin" replace />;

  const resend = async () => {
    setBusy("send");
    setMessage(null);
    try {
      await sendVerificationEmail();
      setCooldown(RESEND_COOLDOWN);
      setMessage({ kind: "info", text: "A new verification link is on its way." });
    } catch (error) {
      setMessage({ kind: "error", text: getAuthErrorMessage(error, "Couldn't send the email. Try again shortly.") });
    } finally {
      setBusy(null);
    }
  };

  const check = async () => {
    setBusy("check");
    setMessage(null);
    const verified = await reloadAuthUser();
    setBusy(null);
    if (verified) {
      showSuccess("Email verified");
      navigate("/admin", { replace: true });
    } else {
      setMessage({ kind: "error", text: "Not verified yet. Click the link in the email, then try again." });
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="One last step before you can comment, like and write.">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full bg-primary/15 p-4 text-primary">
          <EnvelopeIcon className="h-8 w-8" />
        </span>
        <p className="text-sm text-base-content/75">
          We sent a verification link to <strong className="text-base-content">{user.email}</strong>. Open it,
          then come back here.
        </p>
        {message && (
          <p role={message.kind === "error" ? "alert" : "status"} className={`text-sm ${message.kind === "error" ? "text-error" : "text-success"}`}>
            {message.text}
          </p>
        )}
        <button type="button" className="btn btn-primary w-full" onClick={() => void check()} disabled={busy !== null}>
          {busy === "check" && <span className="loading loading-spinner loading-sm" />}
          I&apos;ve verified my email
        </button>
        <button type="button" className="btn btn-ghost w-full border border-base-300" onClick={() => void resend()} disabled={busy !== null || cooldown > 0}>
          {busy === "send" && <span className="loading loading-spinner loading-sm" />}
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
        </button>
        <p className="text-xs text-base-content/60">
          Wrong account?{" "}
          <button type="button" className="link" onClick={() => void signOut()}>
            Log out
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
