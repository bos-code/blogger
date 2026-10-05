import { useState, type FormEvent } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { apiRequest } from "../services/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email subscription for new posts. Subscribers confirm by email before they
 * receive anything (double opt-in), handled by /api/subscribe.
 */
export default function SubscribeForm({ compact = false }: { compact?: boolean }): React.ReactElement {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setState("error");
      setMessage("Enter a valid email address.");
      return;
    }
    setState("sending");
    try {
      await apiRequest("subscribe", { body: { email: value } });
      setState("sent");
      setMessage("Check your inbox to confirm your subscription.");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Subscription failed.");
    }
  };

  if (state === "sent") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-success">
        <EnvelopeIcon className="h-4 w-4" /> {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "w-full max-w-md" : "w-full"} noValidate>
      <div className="flex gap-2">
        <label htmlFor={compact ? "subscribe-email-compact" : "subscribe-email"} className="sr-only">
          Email address
        </label>
        <input
          id={compact ? "subscribe-email-compact" : "subscribe-email"}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="you@example.com"
          className={`input flex-1 ${compact ? "input-sm" : ""}`}
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? "subscribe-error" : undefined}
        />
        <button
          type="submit"
          className={`btn btn-primary ${compact ? "btn-sm" : ""}`}
          disabled={state === "sending"}
        >
          {state === "sending" ? <span className="loading loading-spinner loading-xs" /> : null}
          Subscribe
        </button>
      </div>
      {state === "error" && (
        <p id="subscribe-error" role="alert" className="mt-1.5 text-left text-xs text-error">
          {message}
        </p>
      )}
    </form>
  );
}
