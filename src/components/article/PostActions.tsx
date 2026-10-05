import { BookmarkIcon, LinkIcon, ShareIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { LikeButton } from "../BlogPostCard";
import { useBookmarks, useToggleBookmark } from "../../hooks/useBookmarks";
import { useAuthStore } from "../../stores/authStore";
import { showToast } from "../../utils/sweetalert";
import type { BlogPost } from "../../types";

/** Like, save and share controls for an article. */
export default function PostActions({
  post,
  layout = "row",
}: {
  post: BlogPost;
  layout?: "row" | "column";
}): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const emailVerified = useAuthStore((state) => state.emailVerified);
  const { data: bookmarks = [] } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const saved = bookmarks.includes(post.id);
  const url = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";

  const handleBookmark = () => {
    if (!user) return void showToast("info", "Sign in to save posts");
    if (!emailVerified) return void showToast("info", "Verify your email to save posts");
    toggleBookmark.mutate(
      { postId: post.id, saved },
      {
        onSuccess: () => void showToast("success", saved ? "Removed from saved posts" : "Saved for later"),
        onError: () => void showToast("error", "Couldn't update saved posts"),
      }
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      void showToast("success", "Link copied");
    } catch {
      void showToast("error", "Couldn't copy the link");
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
      } catch {
        // Share sheet dismissed.
      }
    } else {
      await copyLink();
    }
  };

  const buttonClass = "btn btn-ghost btn-sm btn-circle";

  return (
    <div
      className={`flex items-center gap-1 ${layout === "column" ? "flex-col" : ""}`}
      aria-label="Post actions"
      role="group"
    >
      <LikeButton post={post} size="md" />
      <button
        type="button"
        className={buttonClass}
        onClick={handleBookmark}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved posts" : "Save for later"}
        title={saved ? "Saved" : "Save for later"}
        disabled={toggleBookmark.isPending}
      >
        {saved ? <BookmarkSolidIcon className="h-5 w-5 text-primary" /> : <BookmarkIcon className="h-5 w-5" />}
      </button>
      <button type="button" className={buttonClass} onClick={() => void share()} aria-label="Share" title="Share">
        <ShareIcon className="h-5 w-5" />
      </button>
      <button type="button" className={buttonClass} onClick={() => void copyLink()} aria-label="Copy link" title="Copy link">
        <LinkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
