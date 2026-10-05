import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import Modal from "../components/ui/Modal";
import { toEmbedUrl } from "./Embed";
import type { EditorDialog } from "./slashItems";

interface Props {
  editor: Editor;
  dialog: EditorDialog | null;
  onClose: () => void;
  uploadImage: (file: File) => Promise<string>;
}

const normaliseUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

function LinkDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const existing = editor.getAttributes("link") as { href?: string; target?: string };
  const { from, to, empty } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, " ");
  const [url, setUrl] = useState(existing.href ?? "");
  const [text, setText] = useState(selectedText);
  const [newTab, setNewTab] = useState(existing.target === "_blank" || !existing.href);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const href = normaliseUrl(url);
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!href) {
      chain.unsetLink().run();
      onClose();
      return;
    }
    const attrs = { href, target: newTab ? "_blank" : null };
    if (empty && !existing.href) {
      const label = text.trim() || href;
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: label, marks: [{ type: "link", attrs }] })
        .run();
    } else {
      chain.setLink(attrs).run();
    }
    onClose();
  };

  return (
    <form id="editor-dialog-form" onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="link-url" className="field-label">
          URL
        </label>
        <input
          id="link-url"
          className="input w-full"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          autoFocus
        />
      </div>
      {empty && !existing.href && (
        <div>
          <label htmlFor="link-text" className="field-label">
            Text to display
          </label>
          <input
            id="link-text"
            className="input w-full"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Link text"
          />
        </div>
      )}
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="checkbox checkbox-sm checkbox-primary"
          checked={newTab}
          onChange={(event) => setNewTab(event.target.checked)}
        />
        Open in a new tab
      </label>
      <div className="flex justify-between gap-2 pt-2">
        {existing.href ? (
          <button
            type="button"
            className="btn btn-ghost text-error"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              onClose();
            }}
          >
            Remove link
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save link
          </button>
        </div>
      </div>
    </form>
  );
}

function ImageDialog({
  editor,
  onClose,
  uploadImage,
}: {
  editor: Editor;
  onClose: () => void;
  uploadImage: (file: File) => Promise<string>;
}) {
  const { selection } = editor.state;
  const editing =
    selection instanceof NodeSelection && selection.node.type.name === "image"
      ? (selection.node.attrs as { src: string; alt?: string; caption?: string })
      : null;
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState(editing?.src ?? "");
  const [alt, setAlt] = useState(editing?.alt ?? "");
  const [caption, setCaption] = useState(editing?.caption ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setUrl(uploadedUrl);
      if (!alt) setAlt(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editing) {
      editor.chain().focus().updateFigure({ alt: alt.trim(), caption: caption.trim() }).run();
      onClose();
      return;
    }
    const src = normaliseUrl(url);
    if (!src) {
      setError("Upload an image or paste an image URL.");
      return;
    }
    editor
      .chain()
      .focus()
      .setFigure({ src, alt: alt.trim(), caption: caption.trim(), size: "full" })
      .run();
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {!editing && (
        <>
          <div role="tablist" className="tabs tabs-box w-fit">
            <button type="button" role="tab" aria-selected={tab === "upload"} className={`tab ${tab === "upload" ? "tab-active" : ""}`} onClick={() => setTab("upload")}>
              Upload
            </button>
            <button type="button" role="tab" aria-selected={tab === "url"} className={`tab ${tab === "url" ? "tab-active" : ""}`} onClick={() => setTab("url")}>
              From URL
            </button>
          </div>

          {tab === "upload" ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleFile(event.dataTransfer.files?.[0]);
                }}
                disabled={uploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-300 px-4 py-8 text-center hover:border-primary hover:bg-primary/5"
              >
                {uploading ? (
                  <span className="loading loading-spinner" aria-label="Uploading" />
                ) : (
                  <ArrowUpTrayIcon className="h-7 w-7 text-base-content/60" />
                )}
                <span className="text-sm font-medium">
                  {uploading ? "Uploading…" : "Click to choose or drop an image"}
                </span>
                <span className="text-xs text-base-content/60">PNG, JPG, GIF or WebP · up to 5 MB</span>
              </button>
            </div>
          ) : (
            <div>
              <label htmlFor="image-url" className="field-label">
                Image URL
              </label>
              <input
                id="image-url"
                className="input w-full"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://…/image.jpg"
              />
            </div>
          )}

          {url && (
            <img
              src={url}
              alt=""
              className="max-h-48 w-full rounded-lg border border-base-300 object-contain"
            />
          )}
        </>
      )}

      <div>
        <label htmlFor="image-alt" className="field-label">
          Alt text <span className="font-normal text-base-content/55">(describe the image for screen readers)</span>
        </label>
        <input
          id="image-alt"
          className="input w-full"
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          maxLength={200}
        />
      </div>
      <div>
        <label htmlFor="image-caption" className="field-label">
          Caption <span className="font-normal text-base-content/55">(optional)</span>
        </label>
        <input
          id="image-caption"
          className="input w-full"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={200}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {editing ? "Save" : "Insert image"}
        </button>
      </div>
    </form>
  );
}

function UrlDialog({
  label,
  placeholder,
  help,
  onSubmit,
  onClose,
}: {
  label: string;
  placeholder: string;
  help: string;
  onSubmit: (url: string) => string | null;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const problem = onSubmit(url.trim());
        if (problem) setError(problem);
        else onClose();
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label htmlFor="embed-url" className="field-label">
          {label}
        </label>
        <input
          id="embed-url"
          className="input w-full"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setError(null);
          }}
          placeholder={placeholder}
          autoFocus
        />
        <p className="mt-1.5 text-xs text-base-content/60">{help}</p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Embed
        </button>
      </div>
    </form>
  );
}

const TITLES: Record<EditorDialog, string> = {
  link: "Link",
  image: "Image",
  youtube: "Embed a YouTube video",
  embed: "Embed a CodePen or CodeSandbox",
};

export default function EditorDialogs({
  editor,
  dialog,
  onClose,
  uploadImage,
}: Props): React.ReactElement {
  // Remember the selection so the dialog acts on it after focus moves away.
  const [title, setTitle] = useState("");
  useEffect(() => {
    if (dialog) setTitle(TITLES[dialog]);
  }, [dialog]);

  return (
    <Modal open={dialog !== null} onClose={onClose} title={title}>
      {dialog === "link" && <LinkDialog editor={editor} onClose={onClose} />}
      {dialog === "image" && (
        <ImageDialog editor={editor} onClose={onClose} uploadImage={uploadImage} />
      )}
      {dialog === "youtube" && (
        <UrlDialog
          label="YouTube URL"
          placeholder="https://www.youtube.com/watch?v=…"
          help="Paste the link from the browser address bar or the Share button."
          onClose={onClose}
          onSubmit={(url) => {
            const ok = editor.chain().focus().setYoutubeVideo({ src: url }).run();
            return ok ? null : "That doesn't look like a YouTube link.";
          }}
        />
      )}
      {dialog === "embed" && (
        <UrlDialog
          label="Demo URL"
          placeholder="https://codepen.io/user/pen/abc123"
          help="Supports CodePen pens and CodeSandbox sandboxes."
          onClose={onClose}
          onSubmit={(url) => {
            const src = toEmbedUrl(url);
            if (!src) return "Paste a CodePen or CodeSandbox link.";
            editor.chain().focus().setEmbed({ src, title: "Live code demo" }).run();
            return null;
          }}
        />
      )}
    </Modal>
  );
}
