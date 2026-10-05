import { useEffect, useState } from "react";
import Modal from "../components/ui/Modal";
import { listRevisions } from "./postApi";
import { formatDate } from "../utils/date";
import { countWords, htmlToText } from "../utils/posts";
import { sanitizeRichText } from "../utils/sanitize";
import { ARTICLE_PROSE } from "../components/article/ArticleBody";
import type { PostRevision } from "../types";

interface Props {
  open: boolean;
  postId: string | null;
  onClose: () => void;
  onRestore: (revision: PostRevision) => void;
}

export default function RevisionHistory({
  open,
  postId,
  onClose,
  onRestore,
}: Props): React.ReactElement {
  const [revisions, setRevisions] = useState<PostRevision[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !postId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listRevisions(postId)
      .then((items) => {
        if (cancelled) return;
        setRevisions(items);
        setSelectedId(items[0]?.id ?? null);
      })
      .catch(() => !cancelled && setError("Could not load version history."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, postId]);

  const selected = revisions.find((revision) => revision.id === selectedId) ?? null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Version history"
      description="A version is saved each time you save, submit or publish."
      size="xl"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selected}
            onClick={() => selected && onRestore(selected)}
          >
            Restore this version
          </button>
        </>
      }
    >
      {!postId ? (
        <p className="py-8 text-center text-sm text-base-content/60">
          Save the post once to start keeping versions.
        </p>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner" aria-label="Loading versions" />
        </div>
      ) : error ? (
        <p role="alert" className="py-8 text-center text-sm text-error">
          {error}
        </p>
      ) : revisions.length === 0 ? (
        <p className="py-8 text-center text-sm text-base-content/60">
          No saved versions yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
          <ul className="flex max-h-[55vh] flex-col gap-1 overflow-y-auto">
            {revisions.map((revision) => (
              <li key={revision.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(revision.id)}
                  aria-pressed={revision.id === selectedId}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    revision.id === selectedId ? "bg-primary/15 text-primary" : "hover:bg-base-200"
                  }`}
                >
                  <span className="block font-medium">
                    {formatDate(revision.createdAt, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }) || "Just now"}
                  </span>
                  <span className="block truncate text-xs text-base-content/60">
                    {revision.savedByName || "Unknown"} ·{" "}
                    {countWords(htmlToText(revision.content))} words
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-base-300 p-4">
              <h3 className="mb-3 text-xl font-bold">{selected.title || "Untitled"}</h3>
              <div
                className={`article-content ${ARTICLE_PROSE} prose-sm sm:prose-base`}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(selected.content) }}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
