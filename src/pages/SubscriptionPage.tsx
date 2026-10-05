import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import AuthLayout from "../components/auth/AuthLayout";
import { apiRequest } from "../services/api";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

/** Landing page for the confirm / unsubscribe links in newsletter emails. */
export default function SubscriptionPage({ action }: { action: "confirm" | "unsubscribe" }): React.ReactElement {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"working" | "done" | "error">(token ? "working" : "error");
  const [message, setMessage] = useState(token ? "" : "This link is missing its token.");
  const sent = useRef(false);

  useDocumentMeta({ title: action === "confirm" ? "Confirm subscription" : "Unsubscribe", noIndex: true });

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    apiRequest(action === "confirm" ? "subscribe-confirm" : "unsubscribe", { body: { token } })
      .then(() => setState("done"))
      .catch((error: Error) => {
        setState("error");
        setMessage(error.message);
      });
  }, [action, token]);

  const title =
    state === "working"
      ? "One moment…"
      : state === "error"
        ? "That didn't work"
        : action === "confirm"
          ? "You're subscribed!"
          : "You've been unsubscribed";

  return (
    <AuthLayout title={title}>
      <div className="flex flex-col items-center gap-4 text-center">
        {state === "working" && <span className="loading loading-spinner loading-lg" aria-label="Working" />}
        {state === "done" && <CheckCircleIcon className="h-12 w-12 text-success" />}
        {state === "error" && <ExclamationTriangleIcon className="h-12 w-12 text-warning" />}
        <p className="text-sm text-base-content/75">
          {state === "done"
            ? action === "confirm"
              ? "New posts will arrive in your inbox. Every email has an unsubscribe link."
              : "You won't receive any more emails. You can subscribe again any time from the blog."
            : state === "error"
              ? message || "The link may have expired."
              : ""}
        </p>
        <Link to="/blog" className="btn btn-primary w-full">Go to the blog</Link>
      </div>
    </AuthLayout>
  );
}
