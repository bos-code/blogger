import { useId, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { COMMENT_MAX_LENGTH, useCommentActions, useComments } from "../hooks/useComments";
import { useAuthStore } from "../stores/authStore";
import { useRole } from "../hooks/useRole";
import { formatRelativeTime } from "../utils/date";
import { showDeleteConfirm, showError } from "../utils/sweetalert";
import Avatar from "./ui/Avatar";
import type { Comment } from "../types";

interface CommentsProps {
  post: { id: string; title: string; authorId: string };
}

function CommentForm({
  onSubmit,
  initialValue = "",
  submitLabel,
  onCancel,
  autoFocus,
  label,
}: {
  onSubmit: (text: string) => Promise<void>;
  initialValue?: string;
  submitLabel: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  label: string;
}) {
  const id = useId();
  const [text, setText] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(text);
      setText("");
    } catch (submitError) {
      setError(
        submitError instanceof Error && !submitError.message.startsWith("Missing or insufficient")
          ? submitError.message
          : "Your comment couldn't be posted. Make sure your email is verified."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={COMMENT_MAX_LENGTH}
        rows={3}
        autoFocus={autoFocus}
        placeholder={label}
        className="textarea w-full"
        disabled={submitting}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs tabular-nums text-base-content/50">
          {text.length}/{COMMENT_MAX_LENGTH}
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !text.trim()}>
            {submitting && <span className="loading loading-spinner loading-xs" />}
            {submitLabel}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </form>
  );
}

export default function Comments({ post }: CommentsProps): React.ReactElement {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { isAdmin, isEmailVerified } = useRole();
  const { comments, loading, error } = useComments(post.id);
  const { addComment, editComment, deleteComment } = useCommentActions(post);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const { topLevel, replies } = useMemo(() => {
    const ids = new Set(comments.map((comment) => comment.id));
    const byParent = new Map<string, Comment[]>();
    const roots: Comment[] = [];
    for (const comment of comments) {
      if (comment.parentId && ids.has(comment.parentId)) {
        byParent.set(comment.parentId, [...(byParent.get(comment.parentId) ?? []), comment]);
      } else {
        roots.push(comment);
      }
    }
    return { topLevel: roots, replies: byParent };
  }, [comments]);

  const handleDelete = (comment: Comment) =>
    void showDeleteConfirm("this comment", async () => {
      try {
        await deleteComment(comment);
      } catch {
        showError("Couldn't delete", "Please try again.");
      }
    });

  const renderComment = (comment: Comment, depth = 0) => {
    const isOwn = user?.uid === comment.authorId;
    const isEditing = editing === comment.id;
    const childComments = replies.get(comment.id) ?? [];

    return (
      <li key={comment.id} className={depth ? "ml-6 border-l border-base-300 pl-4 sm:ml-10" : ""}>
        <article className="flex gap-3 py-3">
          <Avatar name={comment.authorName} src={comment.authorAvatar} size={depth ? "sm" : "md"} />
          <div className="min-w-0 flex-1">
            <header className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold">{comment.authorName || "Anonymous"}</span>
              {comment.authorId === post.authorId && (
                <span className="badge badge-primary badge-xs">Author</span>
              )}
              <time className="text-xs text-base-content/55">
                {formatRelativeTime(comment.createdAt)}
                {comment.updatedAt ? " · edited" : ""}
              </time>
            </header>

            {isEditing ? (
              <div className="mt-2">
                <CommentForm
                  label="Edit your comment"
                  initialValue={comment.content}
                  submitLabel="Save"
                  autoFocus
                  onCancel={() => setEditing(null)}
                  onSubmit={async (text) => {
                    await editComment(comment, text);
                    setEditing(null);
                  }}
                />
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-line break-words text-base-content/90">{comment.content}</p>
            )}

            {!isEditing && (
              <div className="mt-1 flex gap-1 text-xs">
                {user && isEmailVerified && depth === 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    aria-expanded={replyTo === comment.id}
                  >
                    Reply
                  </button>
                )}
                {isOwn && (
                  <button type="button" className="btn btn-ghost btn-xs" onClick={() => setEditing(comment.id)}>
                    Edit
                  </button>
                )}
                {(isOwn || isAdmin) && (
                  <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(comment)}>
                    Delete
                  </button>
                )}
              </div>
            )}

            {replyTo === comment.id && (
              <div className="mt-2">
                <CommentForm
                  label={`Reply to ${comment.authorName || "this comment"}`}
                  submitLabel="Reply"
                  autoFocus
                  onCancel={() => setReplyTo(null)}
                  onSubmit={async (text) => {
                    await addComment(text, comment);
                    setReplyTo(null);
                  }}
                />
              </div>
            )}
          </div>
        </article>
        {childComments.length > 0 && (
          <ol>{childComments.map((child) => renderComment(child, depth + 1))}</ol>
        )}
      </li>
    );
  };

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="mb-4 flex items-center gap-2 text-2xl font-bold">
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
        Comments {comments.length > 0 && <span className="text-base-content/50">({comments.length})</span>}
      </h2>

      {user ? (
        isEmailVerified ? (
          <div className="mb-6 flex gap-3">
            <Avatar name={user.name} src={user.photoURL} size="md" />
            <div className="flex-1">
              <CommentForm label="Share your thoughts" submitLabel="Comment" onSubmit={(text) => addComment(text)} />
            </div>
          </div>
        ) : (
          <div className="alert mb-6">
            <span>
              <Link to="/verify-email" className="link link-primary">
                Verify your email
              </Link>{" "}
              to join the conversation.
            </span>
          </div>
        )
      ) : (
        <div className="surface mb-6 flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/75">Sign in to join the conversation.</p>
          <div className="flex gap-2">
            <Link to="/login" state={{ from: location }} className="btn btn-primary btn-sm">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-ghost btn-sm border border-base-300">
              Sign up
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          {[0, 1].map((index) => (
            <div key={index} className="flex gap-3">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton h-3 w-32" />
                <div className="skeleton h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-base-content/60">No comments yet. Start the conversation.</p>
      ) : (
        <ol className="divide-y divide-base-300">{topLevel.map((comment) => renderComment(comment))}</ol>
      )}
    </section>
  );
}
