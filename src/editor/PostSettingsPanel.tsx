import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpTrayIcon, SparklesIcon, TrashIcon } from "@heroicons/react/24/outline";
import TagInput from "../components/ui/TagInput";
import StatusBadge from "../components/ui/StatusBadge";
import { suggestExcerpt, suggestTags } from "../utils/contentSuggestions";
import { slugify, truncateText } from "../utils/posts";
import type { EditorFields } from "./postApi";
import type { PostStatus } from "../types";

interface Props {
  previewToken?: string | null;
  onCreatePreviewLink?: () => Promise<void>;
  onRevokePreviewLink?: () => Promise<void>;
  fields: EditorFields;
  onChange: (patch: Partial<EditorFields>) => void;
  categories: string[];
  canManageCategories: boolean;
  status: PostStatus | null;
  rejectionReason?: string | null;
  postId: string | null;
  uploadImage: (file: File) => Promise<string>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-base-300 px-5 py-4 last:border-b-0">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/55">
        {title}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

const Counter = ({ value, max }: { value: string; max: number }) => (
  <span
    className={`text-xs tabular-nums ${
      value.length > max ? "text-error" : "text-base-content/50"
    }`}
  >
    {value.length}/{max}
  </span>
);

export default function PostSettingsPanel({
  previewToken,
  onCreatePreviewLink,
  onRevokePreviewLink,
  fields,
  onChange,
  categories,
  canManageCategories,
  status,
  rejectionReason,
  postId,
  uploadImage,
}: Props): React.ReactElement {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const previewUrl =
    postId && previewToken ? `${window.location.origin}/preview/${postId}?token=${previewToken}` : "";
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const slug = slugify(fields.title) || "your-post-title";
  const seoTitle = fields.seoTitle || fields.title || "Post title";
  const seoDescription =
    fields.seoDescription ||
    fields.excerpt ||
    suggestExcerpt(fields.content, 155) ||
    "Your post description will appear here.";
  const tagSuggestions = suggestTags(fields.title, fields.content);
  const categoryOptions =
    fields.category && !categories.includes(fields.category)
      ? [fields.category, ...categories]
      : categories;

  const handleCover = async (file: File | undefined) => {
    if (!file) return;
    setCoverError(null);
    setCoverUploading(true);
    try {
      onChange({ coverImage: await uploadImage(file) });
    } catch (error) {
      setCoverError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  return (
    <div className="text-sm">
      <Section title="Status">
        <div className="flex items-center justify-between">
          <StatusBadge status={status ?? "draft"} />
          {!postId && <span className="text-xs text-base-content/55">Not saved yet</span>}
        </div>
        {status === "rejected" && rejectionReason && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs">
            <p className="font-semibold text-warning">Reviewer's note</p>
            <p className="mt-1 text-base-content/80">{rejectionReason}</p>
          </div>
        )}
        <div>
          <label htmlFor="post-schedule" className="field-label">
            Publish date <span className="font-normal text-base-content/55">(optional)</span>
          </label>
          <input
            id="post-schedule"
            type="datetime-local"
            className="input w-full"
            value={fields.scheduledAt}
            onChange={(event) => onChange({ scheduledAt: event.target.value })}
          />
          <p className="mt-1 text-xs text-base-content/55">
            Approved posts stay hidden until this time.
          </p>
        </div>
      </Section>

      {status !== "approved" && onCreatePreviewLink && (
        <Section title="Share a preview">
          {!postId ? (
            <p className="text-xs text-base-content/60">Save the post first to create a preview link.</p>
          ) : previewUrl ? (
            <>
              <div className="flex gap-2">
                <label htmlFor="preview-link" className="sr-only">Preview link</label>
                <input id="preview-link" readOnly value={previewUrl} className="input input-sm flex-1" onFocus={(event) => event.target.select()} />
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => void navigator.clipboard.writeText(previewUrl)}
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-base-content/60">Anyone with this link can read the draft. It always shows the latest saved version.</p>
              <button
                type="button"
                className="btn btn-ghost btn-xs self-start text-error"
                disabled={previewBusy}
                onClick={async () => {
                  setPreviewBusy(true);
                  await onRevokePreviewLink?.();
                  setPreviewBusy(false);
                }}
              >
                Revoke link
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm self-start border border-base-300"
              disabled={previewBusy}
              onClick={async () => {
                setPreviewBusy(true);
                await onCreatePreviewLink();
                setPreviewBusy(false);
              }}
            >
              {previewBusy && <span className="loading loading-spinner loading-xs" />}
              Create preview link
            </button>
          )}
        </Section>
      )}

      <Section title="Organise">
        <div>
          <label htmlFor="post-category" className="field-label">
            Category
          </label>
          <select
            id="post-category"
            className="select w-full"
            value={fields.category}
            onChange={(event) => onChange({ category: event.target.value })}
          >
            <option value="">No category</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-1 text-xs text-base-content/55">
              {canManageCategories
                ? "Create categories in Dashboard → Categories."
                : "An admin hasn't created any categories yet."}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="post-tags" className="field-label">
            Tags
          </label>
          <TagInput
            id="post-tags"
            value={fields.tags}
            onChange={(tags) => onChange({ tags })}
            suggestions={tagSuggestions}
          />
        </div>
        <div className="grid grid-cols-[1fr_5rem] gap-2">
          <div>
            <label htmlFor="post-series" className="field-label">
              Series <span className="font-normal text-base-content/55">(optional)</span>
            </label>
            <input
              id="post-series"
              className="input w-full"
              value={fields.series}
              onChange={(event) => onChange({ series: event.target.value })}
              placeholder="e.g. React from scratch"
              maxLength={80}
            />
          </div>
          <div>
            <label htmlFor="post-series-order" className="field-label">
              Part
            </label>
            <input
              id="post-series-order"
              type="number"
              min={1}
              className="input w-full"
              value={fields.seriesOrder}
              onChange={(event) => onChange({ seriesOrder: event.target.value })}
              disabled={!fields.series.trim()}
            />
          </div>
        </div>
      </Section>

      <Section title="Cover image">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleCover(event.target.files?.[0])}
        />
        {fields.coverImage ? (
          <div className="relative overflow-hidden rounded-xl border border-base-300">
            <img src={fields.coverImage} alt="" className="aspect-video w-full object-cover" />
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                type="button"
                className="btn btn-sm btn-square bg-base-100/90"
                onClick={() => coverInputRef.current?.click()}
                aria-label="Replace cover image"
                disabled={coverUploading}
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-square bg-base-100/90 text-error"
                onClick={() => onChange({ coverImage: "", coverImageAlt: "" })}
                aria-label="Remove cover image"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-300 hover:border-primary hover:bg-primary/5"
          >
            {coverUploading ? (
              <span className="loading loading-spinner" aria-label="Uploading" />
            ) : (
              <ArrowUpTrayIcon className="h-6 w-6 text-base-content/60" />
            )}
            <span className="text-sm">{coverUploading ? "Uploading…" : "Upload a cover image"}</span>
          </button>
        )}
        {coverError && (
          <p role="alert" className="text-xs text-error">
            {coverError}
          </p>
        )}
        <div>
          <label htmlFor="post-cover-url" className="field-label">
            …or image URL
          </label>
          <input
            id="post-cover-url"
            type="url"
            className="input w-full"
            value={fields.coverImage}
            onChange={(event) => onChange({ coverImage: event.target.value })}
            placeholder="https://…"
          />
        </div>
        {fields.coverImage && (
          <div>
            <label htmlFor="post-cover-alt" className="field-label">
              Cover alt text
            </label>
            <input
              id="post-cover-alt"
              className="input w-full"
              value={fields.coverImageAlt}
              onChange={(event) => onChange({ coverImageAlt: event.target.value })}
              maxLength={200}
              placeholder="Describe the image"
            />
          </div>
        )}
      </Section>

      <Section title="Excerpt">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="post-excerpt" className="text-sm font-medium text-base-content/80">
              Summary shown in post lists
            </label>
            <Counter value={fields.excerpt} max={220} />
          </div>
          <textarea
            id="post-excerpt"
            className="textarea w-full"
            rows={3}
            maxLength={220}
            value={fields.excerpt}
            onChange={(event) => onChange({ excerpt: event.target.value })}
            placeholder="Leave empty to use the opening lines"
          />
          <button
            type="button"
            className="btn btn-ghost btn-xs mt-1 gap-1"
            onClick={() => onChange({ excerpt: suggestExcerpt(fields.content) })}
            disabled={!fields.content}
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            Generate from content
          </button>
        </div>
      </Section>

      <Section title="Search & sharing">
        <div className="rounded-xl border border-base-300 bg-base-200/50 p-3">
          <p className="truncate text-xs text-base-content/60">
            {typeof window !== "undefined" ? window.location.host : ""}/blog/…/{slug}
          </p>
          <p className="mt-0.5 truncate text-base font-medium text-info">
            {truncateText(seoTitle, 60)}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-base-content/70">
            {truncateText(seoDescription, 160)}
          </p>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="post-seo-title" className="text-sm font-medium text-base-content/80">
              SEO title
            </label>
            <Counter value={fields.seoTitle} max={60} />
          </div>
          <input
            id="post-seo-title"
            className="input w-full"
            value={fields.seoTitle}
            onChange={(event) => onChange({ seoTitle: event.target.value })}
            placeholder={fields.title || "Defaults to the post title"}
            maxLength={70}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="post-seo-description" className="text-sm font-medium text-base-content/80">
              Meta description
            </label>
            <Counter value={fields.seoDescription} max={160} />
          </div>
          <textarea
            id="post-seo-description"
            className="textarea w-full"
            rows={3}
            value={fields.seoDescription}
            onChange={(event) => onChange({ seoDescription: event.target.value })}
            placeholder="Defaults to the excerpt"
            maxLength={180}
          />
        </div>
        {postId && status === "approved" && (
          <Link to={`/blog/${postId}/${slug}`} className="link link-primary text-xs" target="_blank">
            View live post ↗
          </Link>
        )}
      </Section>
    </div>
  );
}
