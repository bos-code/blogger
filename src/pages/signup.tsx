import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { signUp, signInWithGoogle, signInWithApple, useAuthStore } from "../stores/authStore";
import AuthLayout from "../components/auth/AuthLayout";
import PasswordInput from "../components/auth/PasswordInput";
import SocialButtons from "../components/auth/SocialButtons";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { getAuthErrorMessage } from "../utils/authErrors";
import { showSuccess } from "../utils/sweetalert";

type Field = "name" | "email" | "password" | "confirm";

const passwordStrength = (password: string): { label: string; score: number } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const label = score <= 1 ? "Weak" : score <= 3 ? "Good" : "Strong";
  return { label, score };
};

export default function Signup(): React.ReactElement {
  const navigate = useNavigate();
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const logStatus = useAuthStore((state) => state.logStatus);

  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"form" | "google" | "apple" | null>(null);

  useDocumentMeta({ title: "Create an account", noIndex: true });

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  if (logStatus) return <Navigate to="/admin" replace />;

  const set = (field: Field) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const found: Partial<Record<Field, string>> = {};
    if (values.name.trim().length < 2) found.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) found.email = "Please enter a valid email address.";
    if (values.password.length < 8) found.password = "Use at least 8 characters.";
    if (values.confirm !== values.password) found.confirm = "Passwords don't match.";
    return found;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`signup-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setBusy("form");
    try {
      await signUp(values.email.trim(), values.password, values.name.trim());
      showSuccess("Account created", "Check your email to verify your address.");
      navigate("/verify-email", { replace: true });
    } catch (signUpError) {
      setFormError(getAuthErrorMessage(signUpError, "Failed to create your account. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  const handleProvider = async (provider: "google" | "apple") => {
    setFormError(null);
    setBusy(provider);
    try {
      const signedIn = provider === "google" ? await signInWithGoogle() : await signInWithApple();
      if (!signedIn) return;
      showSuccess("Welcome!");
      navigate("/admin", { replace: true });
    } catch (providerError) {
      setFormError(getAuthErrorMessage(providerError, "Sign-up failed. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  const strength = passwordStrength(values.password);
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`signup-${field}-error`} className="mt-1 text-xs text-error">
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: Field) => (errors[field] ? `signup-${field}-error` : undefined);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join to comment, like and save posts. Writers can publish once an admin grants access."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="link link-primary font-medium">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="signup-name" className="field-label">
            Full name
          </label>
          <input
            id="signup-name"
            autoComplete="name"
            className={`input w-full ${errors.name ? "input-error" : ""}`}
            value={values.name}
            onChange={set("name")}
            disabled={busy !== null}
            maxLength={80}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
          />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor="signup-email" className="field-label">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={`input w-full ${errors.email ? "input-error" : ""}`}
            value={values.email}
            onChange={set("email")}
            disabled={busy !== null}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
          />
          {errorText("email")}
        </div>
        <div>
          <label htmlFor="signup-password" className="field-label">
            Password
          </label>
          <PasswordInput
            id="signup-password"
            autoComplete="new-password"
            className={errors.password ? "input-error" : ""}
            value={values.password}
            onChange={set("password")}
            disabled={busy !== null}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={describedBy("password") ?? "signup-password-hint"}
          />
          {errors.password ? (
            errorText("password")
          ) : (
            <div id="signup-password-hint" className="mt-1.5 flex items-center gap-2 text-xs text-base-content/60">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((index) => (
                  <span
                    key={index}
                    className={`h-1 flex-1 rounded-full ${
                      index < strength.score
                        ? strength.score <= 1
                          ? "bg-error"
                          : strength.score <= 3
                            ? "bg-warning"
                            : "bg-success"
                        : "bg-base-300"
                    }`}
                  />
                ))}
              </div>
              {values.password ? `${strength.label} password` : "At least 8 characters"}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="signup-confirm" className="field-label">
            Confirm password
          </label>
          <PasswordInput
            id="signup-confirm"
            autoComplete="new-password"
            className={errors.confirm ? "input-error" : ""}
            value={values.confirm}
            onChange={set("confirm")}
            disabled={busy !== null}
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={describedBy("confirm")}
          />
          {errorText("confirm")}
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {formError}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={busy !== null}>
          {busy === "form" && <span className="loading loading-spinner loading-sm" />}
          Create account
        </button>
        <p className="text-center text-xs text-base-content/60">
          By signing up you agree to the{" "}
          <Link to="/terms" className="link">
            terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="link">
            privacy policy
          </Link>
          .
        </p>
      </form>

      <div className="divider my-6 text-xs text-base-content/55">OR</div>
      <SocialButtons
        verb="Sign up"
        onGoogle={() => void handleProvider("google")}
        onApple={() => void handleProvider("apple")}
        loading={busy === "google" || busy === "apple" ? busy : null}
        disabled={busy !== null}
      />
    </AuthLayout>
  );
}
