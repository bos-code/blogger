import { useMemo, useState } from "react";
import { EnvelopeIcon, PaperAirplaneIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRemoveSubscriber, useSubscribers, sendPostToSubscribers } from "../hooks/useSubscribers";
import { usePosts } from "../hooks/usePosts";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import PremiumSpinner from "../components/PremiumSpinner";
import { formatDate, isPostPublic, toTimestamp } from "../utils/date";
import { showConfirm, showDeleteConfirm, showError, showSuccess } from "../utils/sweetalert";

/** Newsletter subscribers and manual "send this post" control. */
export default function Subscribers(): React.ReactElement {
  const { data: subscribers = [], isLoading, error } = useSubscribers();
  const { data: posts = [] } = usePosts();
  const removeSubscriber = useRemoveSubscriber();
  const [postId, setPostId] = useState("");
  const [sending, setSending] = useState(false);

  const published = useMemo(
    () => posts.filter((post) => isPostPublic(post)).sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)),
    [posts]
  );
  const confirmed = subscribers.filter((subscriber) => subscriber.status === "confirmed").length;

  const send = () => {
    const post = published.find((item) => item.id === postId);
    if (!post) return;
    showConfirm("Email this post?", `Send "${post.title}" to ${confirmed} confirmed subscriber(s)?`, {
      confirmText: "Send",
      onConfirm: async () => {
        setSending(true);
        try {
          const result = await sendPostToSubscribers(post.id);
          showSuccess("Emails sent", `Sent to ${result.sent} subscriber(s).`);
        } catch (sendError) {
          showError("Couldn't send", sendError instanceof Error ? sendError.message : "Please try again.");
        } finally {
          setSending(false);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PremiumSpinner size="lg" text="Loading subscribers..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Subscribers" description={`${confirmed} confirmed · ${subscribers.length - confirmed} awaiting confirmation`} />

      <section className="surface mb-6 p-5" aria-labelledby="send-heading">
        <h2 id="send-heading" className="font-semibold">
          Email a post
        </h2>
        <p className="mb-3 mt-1 text-sm text-base-content/65">
          Published posts are emailed to confirmed subscribers automatically. Use this to resend one.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="send-post" className="sr-only">
            Post to send
          </label>
          <select id="send-post" className="select flex-1" value={postId} onChange={(event) => setPostId(event.target.value)}>
            <option value="">Choose a published post…</option>
            {published.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary gap-2" onClick={send} disabled={!postId || sending || confirmed === 0}>
            {sending ? <span className="loading loading-spinner loading-xs" /> : <PaperAirplaneIcon className="h-4 w-4" />}
            Send
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="alert alert-error mb-4">
          Couldn't load subscribers.
        </div>
      )}

      <div className="surface overflow-hidden">
        {subscribers.length === 0 ? (
          <EmptyState icon={EnvelopeIcon} title="No subscribers yet" description="People who subscribe on the blog appear here once they sign up." />
        ) : (
          <ul className="divide-y divide-base-300">
            {subscribers.map((subscriber) => (
              <li key={subscriber.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{subscriber.email}</p>
                  <p className="text-xs text-base-content/60">Joined {formatDate(subscriber.createdAt) || "recently"}</p>
                </div>
                <span className={`badge badge-sm ${subscriber.status === "confirmed" ? "badge-success" : "badge-ghost"}`}>
                  {subscriber.status === "confirmed" ? "Confirmed" : "Pending"}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square text-error"
                  aria-label={`Remove ${subscriber.email}`}
                  onClick={() =>
                    void showDeleteConfirm(subscriber.email, async () => {
                      try {
                        await removeSubscriber.mutateAsync(subscriber.id);
                      } catch {
                        showError("Couldn't remove", "Please try again.");
                      }
                    })
                  }
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
