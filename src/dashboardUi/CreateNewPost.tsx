import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseconfig";
import {
  ArrowLeftIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ClockIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  PencilIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";

import { buildEditorExtensions } from "../editor/extensions";
import EditorToolbar from "../editor/EditorToolbar";
import EditorBubbleMenus from "../editor/EditorBubbleMenus";
import EditorDialogs from "../editor/EditorDialogs";
import PostSettingsPanel from "../editor/PostSettingsPanel";
import RevisionHistory from "../editor/RevisionHistory";
import type { EditorDialog } from "../editor/slashItems";
import {
  EMPTY_FIELDS,
  EditConflictError,
  addRevision,
  fetchPostForEditing,
  getAuthorDisplayName,
  toPostData,
  updatePostSafely,
  type EditorFields,
} from "../editor/postApi";
import AIAssistant from "../components/AIAssistant";
import ArticleBody from "../components/article/ArticleBody";
import Modal from "../components/ui/Modal";
import Avatar from "../components/ui/Avatar";
import PremiumSpinner from "../components/PremiumSpinner";
import { useCreatePost, notifyStatusChange } from "../hooks/usePosts";
import { useCategories } from "../hooks/useCategories";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { uploadImageToStorage } from "../services/storageService";
import { triggerPostEmails } from "../services/emailHooks";
import { showError, showSuccess, showToast } from "../utils/sweetalert";
import { formatRelativeTime, toDateTimeLocalValue } from "../utils/date";
import { addHeadingIds, calculateReadingTime, countWords, htmlToText } from "../utils/posts";
import { sanitizeRichText } from "../utils/sanitize";
import { queryKeys } from "../utils/queryClient";
import type { BlogPost, PostRevision, PostStatus } from "../types";

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  | { kind: "local"; at: number }
  | { kind: "error"; message: string };

interface LocalBackup {
  fields: EditorFields;
  savedAt: number;
}

const AUTOSAVE_DELAY = 2500;
const TITLE_MAX = 200;

const serialize = (fields: EditorFields): string => JSON.stringify(fields);
const backupKey = (postId: string | null) => `post-editor:${postId ?? "new"}`;

const readBackup = (postId: string | null): LocalBackup | null => {
  try {
    const raw = localStorage.getItem(backupKey(postId));
    return raw ? (JSON.parse(raw) as LocalBackup) : null;
  } catch {
    return null;
  }
};

const writeBackup = (postId: string | null, fields: EditorFields) => {
  try {
    localStorage.setItem(
      backupKey(postId),
      JSON.stringify({ fields, savedAt: Date.now() } satisfies LocalBackup)
    );
  } catch {
    // Storage full or blocked: the remote autosave still protects the work.
  }
};

const clearBackup = (postId: string | null) => {
  try {
    localStorage.removeItem(backupKey(postId));
  } catch {
    // Nothing to clean up.
  }
};

const fieldsFromPost = (post: BlogPost): EditorFields => ({
  title: post.title ?? "",
  content: post.content ?? "",
  excerpt: post.excerpt ?? "",
  category: post.category ?? "",
  tags: post.tags ?? [],
  coverImage: post.coverImage ?? "",
  coverImageAlt: post.coverImageAlt ?? "",
  scheduledAt: toDateTimeLocalValue(post.scheduledFor),
  seoTitle: post.seoTitle ?? "",
  seoDescription: post.seoDescription ?? "",
  series: post.series ?? "",
  seriesOrder: post.seriesOrder ? String(post.seriesOrder) : "",
});

export default function CreatePost(): React.ReactElement {
  const { postId: routeId } = useParams<{ postId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const setDashboardScreen = useUIStore((s) => s.setDashboardScreen);
  const isAdmin = role === "admin" || role === "super_admin";
  const createPost = useCreatePost();
  const { data: categoryList = [] } = useCategories();

  const [postId, setPostId] = useState<string | null>(routeId ?? null);
  const [fields, setFields] = useState<EditorFields>(EMPTY_FIELDS);
  const [savedSnapshot, setSavedSnapshot] = useState(() => serialize(EMPTY_FIELDS));
  const [status, setStatus] = useState<PostStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "not-found" | "forbidden" | "error">(
    routeId ? "loading" : "ready"
  );
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [backupOffer, setBackupOffer] = useState<LocalBackup | null>(null);
  const [conflict, setConflict] = useState<BlogPost | null>(null);
  const [dialog, setDialog] = useState<EditorDialog | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [showSettings, setShowSettings] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [, setTick] = useState(0);

  const knownUpdatedAt = useRef(0);
  const savingRef = useRef(false);
  const postIdRef = useRef(postId);
  const fieldsRef = useRef(fields);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  postIdRef.current = postId;
  fieldsRef.current = fields;

  const isDirty = serialize(fields) !== savedSnapshot;
  const legacyEditId = (location.state as { id?: string } | null)?.id;

  useDocumentMeta({
    title: fields.title ? `Editing: ${fields.title}` : "New post",
    noIndex: true,
  });

  // Show the panel by default on wide screens.
  useEffect(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) setShowSettings(true);
  }, []);

  // Refresh "saved 5s ago" labels.
  useEffect(() => {
    const id = window.setInterval(() => setTick((tick) => tick + 1), 15000);
    return () => window.clearInterval(id);
  }, []);

  const uploadImage = useCallback(
    (file: File) => uploadImageToStorage(file, { userId: authUser?.uid, folder: "post-images" }),
    [authUser?.uid]
  );

  // Stable callbacks for the editor extensions.
  const dialogRef = useRef(setDialog);
  const filesRef = useRef<(files: File[], position?: number) => void>(() => undefined);

  const editor = useEditor({
    extensions: buildEditorExtensions({
      openDialog: (next) => dialogRef.current(next),
      onImageFiles: (files, position) => filesRef.current(files, position),
    }),
    content: "",
    editorProps: {
      attributes: {
        class:
          "tiptap-editor article-content prose prose-base sm:prose-lg max-w-none focus:outline-none min-h-[50vh] pb-24",
        "aria-label": "Post content",
      },
    },
    onUpdate: ({ editor: e }) => {
      setFields((current) => ({ ...current, content: e.isEmpty ? "" : e.getHTML() }));
    },
  });

  filesRef.current = async (files, position) => {
    if (!editor) return;
    for (const file of files) {
      void showToast("info", "Uploading image…");
      try {
        const src = await uploadImage(file);
        const node = {
          type: "image",
          attrs: { src, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), size: "full" },
        };
        if (typeof position === "number") editor.chain().focus().insertContentAt(position, node).run();
        else editor.chain().focus().insertContent(node).run();
        void showToast("success", "Image added", "Click it to add alt text or a caption.");
      } catch (error) {
        showError("Upload failed", error instanceof Error ? error.message : "Please try again.");
      }
    }
  };

  // ------------------------------------------------------------------ loading
  useEffect(() => {
    if (!editor) return;
    if (!routeId) {
      const backup = readBackup(null);
      if (backup && (backup.fields.title || backup.fields.content)) setBackupOffer(backup);
      return;
    }
    if (routeId === postIdRef.current && loadState === "ready") return;

    let cancelled = false;
    setLoadState("loading");
    fetchPostForEditing(routeId)
      .then((loaded) => {
        if (cancelled) return;
        if (!loaded) {
          setLoadState("not-found");
          return;
        }
        const { post, updatedAtMs } = loaded;
        if (!isAdmin && post.authorId !== authUser?.uid) {
          setLoadState("forbidden");
          return;
        }
        const loadedFields = fieldsFromPost(post);
        knownUpdatedAt.current = updatedAtMs;
        setPostId(post.id);
        setStatus(post.status ?? "draft");
        setRejectionReason(post.rejectionReason ?? null);
        setPreviewToken((post as BlogPost & { previewToken?: string }).previewToken ?? null);
        setFields(loadedFields);
        setSavedSnapshot(serialize(loadedFields));
        editor.commands.setContent(loadedFields.content || "", { emitUpdate: false });
        setLoadState("ready");

        const backup = readBackup(post.id);
        if (
          backup &&
          backup.savedAt > updatedAtMs &&
          serialize(backup.fields) !== serialize(loadedFields)
        ) {
          setBackupOffer(backup);
        }
      })
      .catch(() => !cancelled && setLoadState("error"));

    return () => {
      cancelled = true;
    };
    // loadState is intentionally excluded: it is only read to skip reloading our own post.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, editor, isAdmin, authUser?.uid]);

  const applyFields = useCallback(
    (next: EditorFields) => {
      setFields(next);
      editor?.commands.setContent(next.content || "", { emitUpdate: false });
    },
    [editor]
  );

  const updateFields = (patch: Partial<EditorFields>) =>
    setFields((current) => ({ ...current, ...patch }));

  // ------------------------------------------------------------------ saving
  const canAutosaveRemote = status === null || status === "draft" || status === "rejected";

  const persist = useCallback(
    async ({
      targetStatus,
      explicit,
      force = false,
    }: {
      targetStatus: PostStatus;
      explicit: boolean;
      force?: boolean;
    }): Promise<boolean> => {
      if (!authUser?.uid || savingRef.current) return false;
      const snapshot = fieldsRef.current;
      const data = toPostData(snapshot);
      if (!data.title || !data.content) return false;

      savingRef.current = true;
      setSaveState({ kind: "saving" });
      try {
        let id = postIdRef.current;
        if (!id) {
          const created = await createPost.mutateAsync({ ...data, status: targetStatus });
          id = created.id;
          knownUpdatedAt.current = Date.now();
          clearBackup(null);
          setPostId(id);
          navigate(`/edit/${id}`, { replace: true });
        } else {
          knownUpdatedAt.current = await updatePostSafely({
            id,
            data,
            status: targetStatus,
            knownUpdatedAtMs: knownUpdatedAt.current,
            userId: authUser.uid,
            force,
          });
          if (targetStatus !== status || explicit) {
            void triggerPostEmails({
              postId: id,
              status: targetStatus,
              isAdmin,
              scheduledFor: data.scheduledFor,
            });
          }
          if (targetStatus !== status) {
            await notifyStatusChange(
              { id, title: data.title, authorName: getAuthorDisplayName(authUser) },
              targetStatus,
              isAdmin
            );
          }
        }

        if (explicit && id) {
          try {
            await addRevision(id, {
              title: data.title,
              content: data.content,
              savedBy: authUser.uid,
              savedByName: getAuthorDisplayName(authUser),
            });
          } catch {
            // Version history is best-effort.
          }
        }

        clearBackup(id);
        setStatus(targetStatus);
        if (targetStatus !== "rejected") setRejectionReason(null);
        setSavedSnapshot(serialize(snapshot));
        setSaveState({ kind: "saved", at: Date.now() });
        void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        return true;
      } catch (error) {
        if (error instanceof EditConflictError) {
          setConflict(error.serverPost);
          setSaveState({ kind: "error", message: "Edited elsewhere" });
        } else {
          writeBackup(postIdRef.current, snapshot);
          setSaveState({
            kind: "error",
            message: "Couldn't save — kept a copy on this device",
          });
        }
        return false;
      } finally {
        savingRef.current = false;
      }
    },
    [authUser, createPost, isAdmin, navigate, queryClient, status]
  );

  // Autosave: drafts save to the database; published/in-review posts keep a
  // local copy until the writer explicitly updates them.
  useEffect(() => {
    if (!isDirty || loadState !== "ready" || conflict) return;
    const timer = window.setTimeout(() => {
      const current = fieldsRef.current;
      const hasEnough = current.title.trim() && current.content;
      if (canAutosaveRemote && hasEnough) {
        void persist({ targetStatus: status ?? "draft", explicit: false });
      } else {
        writeBackup(postIdRef.current, current);
        setSaveState({ kind: "local", at: Date.now() });
      }
    }, AUTOSAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [fields, isDirty, loadState, canAutosaveRemote, persist, status, conflict]);

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Keyboard: Ctrl/Cmd+S saves, Esc leaves focus mode.
  const saveNowRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveNowRef.current();
      }
      if (event.key === "Escape" && focusMode && !dialog) setFocusMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, dialog]);

  // Auto-grow title.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [fields.title, mode, loadState]);

  // ------------------------------------------------------------------ actions
  const validate = (): string | null => {
    if (!fields.title.trim()) return "Add a title before saving.";
    if (fields.title.trim().length > TITLE_MAX) return `Titles can be at most ${TITLE_MAX} characters.`;
    if (!fields.content || editor?.isEmpty) return "Write some content before saving.";
    return null;
  };

  const saveDraft = async () => {
    const problem = validate();
    if (problem) return showError("Can't save yet", problem);
    const ok = await persist({ targetStatus: "draft", explicit: true });
    if (ok) showSuccess("Draft saved");
  };

  const isFutureSchedule =
    Boolean(fields.scheduledAt) && new Date(fields.scheduledAt).getTime() > Date.now();

  const primaryLabel = (() => {
    if (isAdmin) {
      if (status === "approved") return "Update";
      return isFutureSchedule ? "Schedule" : "Publish";
    }
    if (status === "pending") return "Update submission";
    if (status === "approved") return "Submit changes";
    return "Submit for review";
  })();

  const publish = async () => {
    setConfirmPublish(false);
    const target: PostStatus = isAdmin ? "approved" : "pending";
    const ok = await persist({ targetStatus: target, explicit: true });
    if (!ok) return;
    showSuccess(
      isAdmin
        ? isFutureSchedule
          ? "Post scheduled"
          : status === "approved"
            ? "Post updated"
            : "Post published"
        : "Submitted for review",
      isAdmin ? undefined : "An admin will review it shortly."
    );
    setDashboardScreen("posts");
  };

  saveNowRef.current = () => {
    if (canAutosaveRemote) void saveDraft();
    else if (isAdmin && status === "approved") void persist({ targetStatus: "approved", explicit: true });
    else setConfirmPublish(true);
  };

  const requestPublish = () => {
    const problem = validate();
    if (problem) return showError("Not ready yet", problem);
    setConfirmPublish(true);
  };

  const leave = () => {
    if (isDirty && saveState.kind !== "saved") {
      writeBackup(postIdRef.current, fieldsRef.current);
    }
    navigate("/admin");
  };

  const setPreviewLink = async (create: boolean) => {
    if (!postId) return;
    const token = create
      ? Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) => byte.toString(16).padStart(2, "0")).join("")
      : null;
    try {
      await updateDoc(doc(db, "posts", postId), { previewToken: token });
      setPreviewToken(token);
      showToast("success", create ? "Preview link created" : "Preview link revoked");
    } catch {
      showError("Couldn't update the preview link", "Please try again.");
    }
  };

  const restoreRevision = (revision: PostRevision) => {
    applyFields({ ...fieldsRef.current, title: revision.title, content: revision.content });
    setShowHistory(false);
    showToast("info", "Version restored", "Save to keep it.");
  };

  const resolveConflict = (choice: "theirs" | "mine") => {
    if (!conflict) return;
    if (choice === "theirs") {
      // Keep the local edits on this device so they can still be recovered.
      writeBackup(postIdRef.current, fieldsRef.current);
      const theirs = fieldsFromPost(conflict);
      knownUpdatedAt.current = Date.now();
      applyFields(theirs);
      setSavedSnapshot(serialize(theirs));
      setStatus(conflict.status ?? "draft");
      setSaveState({ kind: "saved", at: Date.now() });
      setConflict(null);
    } else {
      setConflict(null);
      void persist({ targetStatus: status ?? "draft", explicit: true, force: true });
    }
  };

  // ------------------------------------------------------------------ derived
  const text = useMemo(() => htmlToText(fields.content), [fields.content]);
  const words = countWords(text);
  const readingTime = calculateReadingTime(fields.content);
  const preview = useMemo(
    () => (mode === "preview" ? addHeadingIds(sanitizeRichText(fields.content)) : null),
    [mode, fields.content]
  );
  const categories = categoryList.map((category) => category.name);

  if (legacyEditId && !routeId) return <Navigate to={`/edit/${legacyEditId}`} replace />;

  if (loadState === "loading" || !editor) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <PremiumSpinner size="lg" text="Opening editor..." />
      </div>
    );
  }

  if (loadState !== "ready") {
    const messages = {
      "not-found": "This post doesn't exist or was deleted.",
      forbidden: "You can only edit your own posts.",
      error: "We couldn't load this post. Check your connection and try again.",
    } as const;
    return (
      <div className="page-container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <ExclamationTriangleIcon className="h-10 w-10 text-warning" />
        <p className="text-lg">{messages[loadState]}</p>
        <Link to="/admin" className="btn btn-primary">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const saveIndicator = (() => {
    switch (saveState.kind) {
      case "saving":
        return (
          <span className="flex items-center gap-1.5">
            <span className="loading loading-spinner loading-xs" /> Saving…
          </span>
        );
      case "saved":
        return isDirty ? (
          <span>Unsaved changes</span>
        ) : (
          <span className="flex items-center gap-1.5">
            <CheckIcon className="h-4 w-4 text-success" /> Saved · {formatRelativeTime(saveState.at)}
          </span>
        );
      case "local":
        return (
          <span className="flex items-center gap-1.5" title="Saved on this device. Use the action button to save it to the site.">
            <CloudIcon className="h-4 w-4" /> Saved on this device
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5 text-error">
            <ExclamationTriangleIcon className="h-4 w-4" /> {saveState.message}
          </span>
        );
      default:
        return isDirty ? <span>Unsaved changes</span> : postId ? <span>All changes saved</span> : <span>New post</span>;
    }
  })();

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/90 backdrop-blur-lg">
        <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={leave} aria-label="Back to dashboard">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="hidden min-w-0 text-xs text-base-content/65 sm:block" aria-live="polite">
            {saveIndicator}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <AIAssistant
              title={fields.title}
              text={text}
              onApplyTitle={(title) => updateFields({ title })}
              onApplyExcerpt={(excerpt) => updateFields({ excerpt })}
            />
            <div className="join" role="group" aria-label="Editor mode">
              <button
                type="button"
                className={`btn btn-sm join-item ${mode === "edit" ? "btn-active" : "btn-ghost"}`}
                onClick={() => setMode("edit")}
                aria-pressed={mode === "edit"}
                aria-label="Write"
              >
                <PencilIcon className="h-4 w-4" />
                <span className="hidden md:inline">Write</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm join-item ${mode === "preview" ? "btn-active" : "btn-ghost"}`}
                onClick={() => setMode("preview")}
                aria-pressed={mode === "preview"}
                aria-label="Preview"
              >
                <EyeIcon className="h-4 w-4" />
                <span className="hidden md:inline">Preview</span>
              </button>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => setShowHistory(true)}
              aria-label="Version history"
              title="Version history"
              disabled={!postId}
            >
              <ClockIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-square ${showSettings ? "btn-active" : "btn-ghost"}`}
              onClick={() => setShowSettings((value) => !value)}
              aria-label="Post settings"
              aria-pressed={showSettings}
              title="Post settings"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            {canAutosaveRemote && (
              <button
                type="button"
                className="btn btn-ghost btn-sm hidden sm:inline-flex"
                onClick={() => void saveDraft()}
                disabled={saveState.kind === "saving"}
              >
                Save draft
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={requestPublish}
              disabled={saveState.kind === "saving"}
            >
              {primaryLabel}
            </button>
          </div>
        </div>
        {mode === "edit" && !focusMode && (
          <div className="border-t border-base-300">
            <div className="mx-auto flex max-w-5xl items-center">
              <div className="min-w-0 flex-1">
                <EditorToolbar editor={editor} openDialog={setDialog} />
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square mr-2 shrink-0"
                onClick={() => setFocusMode(true)}
                aria-label="Focus mode"
                title="Focus mode (Esc to exit)"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {backupOffer && (
        <div role="status" className="border-b border-info/30 bg-info/10 px-4 py-2.5 text-sm">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
            <span className="mr-auto">
              You have unsaved changes from {formatRelativeTime(backupOffer.savedAt)} on this device.
            </span>
            <button
              type="button"
              className="btn btn-xs btn-info"
              onClick={() => {
                applyFields(backupOffer.fields);
                setBackupOffer(null);
              }}
            >
              Restore
            </button>
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={() => {
                clearBackup(postId);
                setBackupOffer(null);
              }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <main className="min-w-0 flex-1">
          {mode === "edit" ? (
            <div className={`mx-auto w-full max-w-3xl px-5 sm:px-8 ${focusMode ? "pt-16" : "pt-8 sm:pt-12"}`}>
              {focusMode && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm fixed right-4 top-16 z-30 gap-1"
                  onClick={() => setFocusMode(false)}
                >
                  <ArrowsPointingInIcon className="h-4 w-4" /> Exit focus
                </button>
              )}
              {fields.coverImage && !focusMode && (
                <img
                  src={fields.coverImage}
                  alt={fields.coverImageAlt}
                  className="mb-8 aspect-[2/1] w-full rounded-2xl object-cover"
                />
              )}
              <label htmlFor="post-title" className="sr-only">
                Title
              </label>
              <textarea
                id="post-title"
                ref={titleRef}
                rows={1}
                value={fields.title}
                maxLength={TITLE_MAX}
                onChange={(event) => updateFields({ title: event.target.value.replace(/\n/g, " ") })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    editor.commands.focus("start");
                  }
                }}
                placeholder="Post title"
                className="w-full resize-none overflow-hidden bg-transparent text-3xl font-bold leading-tight outline-none placeholder:text-base-content/30 sm:text-4xl lg:text-5xl"
              />
              <div className="mt-6">
                <EditorContent editor={editor} />
                <EditorBubbleMenus editor={editor} openDialog={setDialog} />
              </div>
            </div>
          ) : (
            <div className="px-4 py-6">
              <div className="mb-4 flex justify-center">
                <div className="join" role="group" aria-label="Preview size">
                  <button
                    type="button"
                    className={`btn btn-sm join-item gap-1 ${previewDevice === "desktop" ? "btn-active" : "btn-ghost"}`}
                    onClick={() => setPreviewDevice("desktop")}
                    aria-pressed={previewDevice === "desktop"}
                  >
                    <ComputerDesktopIcon className="h-4 w-4" /> Desktop
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm join-item gap-1 ${previewDevice === "mobile" ? "btn-active" : "btn-ghost"}`}
                    onClick={() => setPreviewDevice("mobile")}
                    aria-pressed={previewDevice === "mobile"}
                  >
                    <DevicePhoneMobileIcon className="h-4 w-4" /> Mobile
                  </button>
                </div>
              </div>
              <div
                className={`mx-auto overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl transition-all ${
                  previewDevice === "mobile" ? "max-w-[390px]" : "max-w-4xl"
                }`}
              >
                <article className="px-5 py-8 sm:px-10">
                  {fields.coverImage && (
                    <img src={fields.coverImage} alt={fields.coverImageAlt} className="mb-6 aspect-[2/1] w-full rounded-xl object-cover" />
                  )}
                  {fields.category && (
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">{fields.category}</p>
                  )}
                  <h1 className={`font-bold leading-tight ${previewDevice === "mobile" ? "text-3xl" : "text-4xl sm:text-5xl"}`}>
                    {fields.title || "Untitled post"}
                  </h1>
                  <div className="mb-8 mt-4 flex items-center gap-3 text-sm text-base-content/65">
                    <Avatar name={authUser?.name} src={authUser?.photoURL} size="sm" />
                    <span>{getAuthorDisplayName(authUser)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{readingTime} min read</span>
                  </div>
                  {preview?.html ? (
                    <ArticleBody html={preview.html} className={previewDevice === "mobile" ? "prose-sm sm:prose-base" : ""} />
                  ) : (
                    <p className="text-base-content/50">Nothing to preview yet.</p>
                  )}
                </article>
              </div>
            </div>
          )}
        </main>

        {/* Settings panel: sidebar on desktop, sheet on mobile */}
        {showSettings && !focusMode && (
          <>
            <button
              type="button"
              aria-label="Close settings"
              className="fixed inset-0 z-40 bg-black/40 xl:hidden"
              onClick={() => setShowSettings(false)}
            />
            <aside
              aria-label="Post settings"
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-base-300 bg-base-100 shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-96 sm:rounded-none sm:border-l sm:border-t-0 xl:sticky xl:top-[6.25rem] xl:z-auto xl:h-[calc(100vh-6.25rem)] xl:w-80 xl:shadow-none"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-base-300 bg-base-100 px-5 py-3">
                <h2 className="font-semibold">Post settings</h2>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <PostSettingsPanel
                previewToken={previewToken}
                onCreatePreviewLink={() => setPreviewLink(true)}
                onRevokePreviewLink={() => setPreviewLink(false)}
                fields={fields}
                onChange={updateFields}
                categories={categories}
                canManageCategories={isAdmin}
                status={status}
                rejectionReason={rejectionReason}
                postId={postId}
                uploadImage={uploadImage}
              />
            </aside>
          </>
        )}
      </div>

      {/* Footer stats */}
      <footer className="sticky bottom-0 z-30 border-t border-base-300 bg-base-100/90 px-4 py-2 text-xs text-base-content/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <span className="sm:hidden" aria-live="polite">{saveIndicator}</span>
          <span className="hidden sm:inline">
            Type <kbd className="kbd kbd-xs">/</kbd> for blocks · select text to format · <kbd className="kbd kbd-xs">Ctrl</kbd>+<kbd className="kbd kbd-xs">S</kbd> to save
          </span>
          <span className="tabular-nums">
            {words.toLocaleString()} words · {readingTime} min read
          </span>
        </div>
      </footer>

      <EditorDialogs editor={editor} dialog={dialog} onClose={() => setDialog(null)} uploadImage={uploadImage} />

      <RevisionHistory open={showHistory} postId={postId} onClose={() => setShowHistory(false)} onRestore={restoreRevision} />

      <Modal
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        title={primaryLabel}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmPublish(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void publish()}>
              {primaryLabel}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3 text-sm">
          <p>
            {isAdmin
              ? isFutureSchedule
                ? `This post will go live on ${new Date(fields.scheduledAt).toLocaleString()}.`
                : "This post will be visible to everyone straight away."
              : status === "approved"
                ? "Your changes will be reviewed by an admin. The post is hidden until they're approved."
                : "An admin will review your post before it's published."}
          </p>
          <dl className="grid grid-cols-[7rem_1fr] gap-y-1.5 rounded-xl bg-base-200 p-3">
            <dt className="text-base-content/60">Title</dt>
            <dd className="font-medium">{fields.title || "Untitled"}</dd>
            <dt className="text-base-content/60">Category</dt>
            <dd>{fields.category || "None"}</dd>
            <dt className="text-base-content/60">Tags</dt>
            <dd>{fields.tags.length ? fields.tags.map((tag) => `#${tag}`).join(" ") : "None"}</dd>
            <dt className="text-base-content/60">Length</dt>
            <dd>
              {words.toLocaleString()} words · {readingTime} min
            </dd>
          </dl>
          {!fields.excerpt && (
            <p className="text-xs text-base-content/60">
              Tip: add an excerpt in Post settings to control how this appears in lists.
            </p>
          )}
          {fields.coverImage && !fields.coverImageAlt && (
            <p className="text-xs text-warning">Your cover image has no alt text.</p>
          )}
        </div>
      </Modal>

      <Modal
        open={conflict !== null}
        onClose={() => setConflict(null)}
        title="This post was changed elsewhere"
        description="Someone (or another tab) saved this post after you opened it."
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => resolveConflict("theirs")}>
              Load their version
            </button>
            <button type="button" className="btn btn-warning" onClick={() => resolveConflict("mine")}>
              Overwrite with mine
            </button>
          </>
        }
      >
        <p className="text-sm text-base-content/75">
          Loading their version replaces what's in the editor; your edits are kept on this device and
          offered for restore next time you open the post. Overwriting replaces their changes with yours.
        </p>
      </Modal>
    </div>
  );
}
