import { useRef, useState, MouseEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
} from "@heroui/react";
import {
  PencilIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

/* TipTap & syntax highlighting */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import CharacterCount from "@tiptap/extension-character-count";
import { lowlight } from "lowlight/lib/core";
/* register languages */
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import typescriptLang from "highlight.js/lib/languages/typescript";

/* --- Components --- */
import TipTapToolbar from "../components/TipTapToolbar";
import AIAssistant from "../components/AIAssistant";
import { useCreatePost, useUpdatePost } from "../hooks/usePosts";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { showConfirm, showSuccess } from "../utils/sweetalert";

// Register languages
lowlight.registerLanguage("js", javascript);
lowlight.registerLanguage("javascript", javascript);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("html", xml);
lowlight.registerLanguage("xml", xml);
lowlight.registerLanguage("json", json);
lowlight.registerLanguage("typescript", typescriptLang);
lowlight.registerLanguage("ts", typescriptLang);

export default function CreatePost(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === "admin";
  const editState = (location.state || {}) as any;

  // inputs
  const [title, setTitle] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMsg, setModalMsg] = useState<string>("");
  const [tags, setTags] = useState<string[]>(() => editState.tags ?? []);
  const [category, setCategory] = useState<string>(
    () => editState.category ?? ""
  );
  const [status, setStatus] = useState<"draft" | "published">(() =>
    editState.status === "draft" ? "draft" : "published"
  );
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  const previewBodyRef = useRef<HTMLDivElement>(null);

  /* --- TipTap Editable Editor --- */
  const editor = useEditor({
    editable: true,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Underline,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your post here...",
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: "rounded-lg",
        },
      }),
      CharacterCount,
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6",
      },
    },
  });

  const showModalMsg = (msg: string): void => {
    setModalMsg(msg);
    setModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setTitle(e.target.value);
  };

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  /* --- Save as Draft --- */
  const saveAsDraft = async (): Promise<void> => {
    if (!title.trim()) {
      showModalMsg("Please enter a post title");
      return;
    }
    if (!(editor?.getHTML() ?? "").trim()) {
      showModalMsg("Please write something first");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title,
        content: editor?.getHTML() ?? "",
        tags,
        category,
        status: "draft",
      };

      if (editState?.id) {
        await updatePost.mutateAsync({ id: editState.id, data: payload });
        showSuccess("Draft Saved", "Your post has been saved as a draft!");
      } else {
        await createPost.mutateAsync(payload as any);
        showSuccess("Draft Saved", "Your post has been saved as a draft!");
      }

      setShowSaveModal(false);
      // Don't clear form, just save
    } catch (error) {
      console.error("Error saving draft: ", error);
      showModalMsg("Error saving draft. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* --- Publish Post --- */
  const publishPost = async (): Promise<void> => {
    if (!title.trim()) {
      showModalMsg("Please enter a post title");
      setShowPublishModal(false);
      return;
    }
    if (!(editor?.getHTML() ?? "").trim()) {
      showModalMsg("Please write something first");
      setShowPublishModal(false);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title,
        content: editor?.getHTML() ?? "",
        tags,
        category,
        status: isAdmin ? "approved" : "pending",
      };

      if (editState?.id) {
        await updatePost.mutateAsync({ id: editState.id, data: payload });
        showSuccess(
          "Post Published!",
          isAdmin
            ? "Your post has been published and is live!"
            : "Your post has been submitted for approval!"
        );
      } else {
        await createPost.mutateAsync(payload as any);
        showSuccess(
          "Post Published!",
          isAdmin
            ? "Your post has been published and is live!"
            : "Your post has been submitted for approval!"
        );
      }

      setShowPublishModal(false);
      // Clear form after successful publish
      setTitle("");
      editor?.commands.setContent("<p></p>");
      setTags([]);
      setCategory("");
      localStorage.removeItem("create-post-draft");
      
      // Navigate to admin dashboard after a short delay
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (error) {
      console.error("Error publishing post: ", error);
      showModalMsg("Error publishing post. Try again.");
      setShowPublishModal(false);
    } finally {
      setLoading(false);
    }
  };

  /* --- Old save function (kept for backward compatibility) --- */
  const saveToFirebase = async (): Promise<void> => {
    setShowSaveModal(true);
  };

  const handleNext = (e?: MouseEvent<HTMLButtonElement>): void => {
    e?.preventDefault();
    if (!title.trim()) return showModalMsg("Please enter a post title");
    if (!editor?.getHTML().trim())
      return showModalMsg("Please write something first");
    navigate("/edit-post", {
      state: { title, rawText: editor.getHTML() },
    });
  };

  const handleClear = (): void => {
    showConfirm(
      "Clear All Content",
      "Are you sure you want to clear all content? This action cannot be undone.",
      {
        confirmText: "Clear",
        cancelText: "Cancel",
        confirmColor: "error",
        cancelColor: "ghost",
        onConfirm: () => {
          setTitle("");
          editor?.commands.clearContent();
          setTags([]);
          setCategory("");
          localStorage.removeItem("create-post-draft");
          showSuccess(
            "Content Cleared",
            "All content has been cleared successfully!"
          );
        },
      }
    );
  };

  // Autosave draft locally every 10s
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const draft = {
          title,
          content: editor?.getHTML() ?? "",
          tags,
          category,
          status,
          updatedAt: Date.now(),
          id: editState?.id ?? null,
        };
        localStorage.setItem("create-post-draft", JSON.stringify(draft));
      } catch (err) {
        console.warn("Autosave failed:", err);
      }
    }, 10000);

    return () => clearInterval(id);
  }, [title, editor, tags, category, status, editState]);

  // Load draft on mount when not editing, or populate editor for edit
  useEffect(() => {
    try {
      const raw = localStorage.getItem("create-post-draft");
      if (raw && !editState?.id) {
        const d = JSON.parse(raw);
        setTitle(d.title || "");
        setTags(d.tags || []);
        setCategory(d.category || "");
        setStatus(d.status || "draft");
        editor?.commands.setContent(d.content || "<p></p>");
      }

      if (editState?.rawText || editState?.title) {
        setTitle(editState.title || "");
        editor?.commands.setContent(editState.rawText || "<p></p>");
        setTags(editState.tags || []);
        setCategory(editState.category || "");
        setStatus(editState.status === "draft" ? "draft" : "published");
      }
    } catch (err) {
      console.warn("Failed to load draft:", err);
    }
  }, [editor, editState]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-lg border-b border-base-300 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <PencilIcon className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold text-base-content">
                  Create New Post
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {/* AI Assistant */}
                <AIAssistant
                  editor={editor}
                  title={title}
                  onTitleChange={setTitle}
                  onContentInsert={(content: string) => {
                    if (editor) {
                      editor.commands.insertContent(content);
                    }
                  }}
                />

                {/* Preview Toggle */}
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => setShowPreview(!showPreview)}
                  className="hidden md:flex"
                >
                  {showPreview ? (
                    <>
                      <EyeSlashIcon className="w-4 h-4" />
                      <span className="ml-1">Hide Preview</span>
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4" />
                      <span className="ml-1">Show Preview</span>
                    </>
                  )}
                </Button>

                {/* Action Buttons */}
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={handleClear}
                  isDisabled={loading}
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span className="ml-1 hidden sm:inline">Clear</span>
                </Button>

                <Button
                  size="sm"
                  variant="flat"
                  color="secondary"
                  onPress={() => setShowSaveModal(true)}
                  isDisabled={loading || (createPost as any).isLoading}
                  isLoading={loading || (createPost as any).isLoading}
                >
                  <CheckIcon className="w-4 h-4" />
                  <span className="ml-1 hidden sm:inline">Save Draft</span>
                </Button>

                <Button
                  size="sm"
                  color="primary"
                  onPress={() => setShowPublishModal(true)}
                  isDisabled={loading || (createPost as any).isLoading}
                >
                  <span className="hidden sm:inline">Publish</span>
                  <ArrowRightIcon className="w-4 h-4 sm:ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={showPreview ? "lg:col-span-7" : "lg:col-span-12"}
            >
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
                {/* Title Input */}
                <div className="p-6 border-b border-base-300 bg-base-200/50">
                  <input
                    type="text"
                    placeholder="Enter post title..."
                    value={title}
                    onChange={handleTitleChange}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    onKeyPress={(e) => {
                      e.stopPropagation();
                    }}
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-base-content/40 focus:placeholder:text-base-content/20 transition-colors"
                  />
                </div>

                {/* Editor Toolbar & Content */}
                <div className="bg-base-100">
                  <TipTapToolbar editor={editor} />
                  <div className="border-t border-base-300">
                    <EditorContent editor={editor} />
                  </div>
                </div>

                {/* Footer Stats */}
                <div className="p-4 border-t border-base-300 bg-base-200/30 flex items-center justify-between text-sm">
                  <div className="text-base-content/70">
                    {editor?.storage.characterCount ? (
                      <span>
                        {editor.storage.characterCount.characters()} characters
                        {" • "}
                        {editor.storage.characterCount.words()} words
                      </span>
                    ) : (
                      <span>0 characters</span>
                    )}
                  </div>
                  <div className="text-base-content/50">
                    {editor?.storage.characterCount?.characters() &&
                      editor.storage.characterCount.characters() > 0 && (
                        <span>
                          ~
                          {Math.ceil(
                            editor.storage.characterCount.characters() / 1000
                          )}{" "}
                          min read
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Preview Column */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="lg:col-span-5"
                >
                  <div className="sticky top-20 bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
                    {/* Preview Header */}
                    <div className="p-4 border-b border-base-300 bg-base-200/50 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-base-content flex items-center gap-2">
                        <EyeIcon className="w-5 h-5 text-primary" />
                        Live Preview
                      </h2>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => setShowPreview(false)}
                        className="md:hidden"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Preview Content */}
                    <div
                      ref={previewBodyRef}
                      className="flex-1 overflow-y-auto p-6 custom-scrollbar"
                    >
                      {title && (
                        <h1 className="text-3xl font-bold mb-4 text-base-content">
                          {title}
                        </h1>
                      )}
                      <div
                        className="prose prose-sm sm:prose lg:prose-lg max-w-none prose-headings:text-base-content prose-p:text-base-content prose-strong:text-base-content prose-code:text-primary prose-pre:bg-base-300 prose-blockquote:border-l-primary"
                        dangerouslySetInnerHTML={{
                          __html:
                            editor?.getHTML() ||
                            "<p class='text-base-content/50'>Start writing to see preview...</p>",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Notice Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isDismissable
        placement="center"
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
            <span>Notice</span>
          </ModalHeader>
          <ModalBody>
            <p className="text-base-content">{modalMsg}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setModalOpen(false)}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Save Draft Confirmation Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        isDismissable
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-secondary" />
            <span>Save as Draft</span>
          </ModalHeader>
          <ModalBody>
            <p className="text-base-content">
              Are you sure you want to save this post as a draft? You can publish it later.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              color="default"
              onPress={() => setShowSaveModal(false)}
              isDisabled={loading}
            >
              Cancel
            </Button>
            <Button
              color="secondary"
              onPress={saveAsDraft}
              isLoading={loading}
              isDisabled={loading}
            >
              Save Draft
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Publish Confirmation Modal */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        isDismissable
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-primary" />
            <span>Publish Post</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <p className="text-base-content">
                {isAdmin
                  ? "Are you sure you want to publish this post? It will be immediately visible to all users."
                  : "Are you sure you want to publish this post? It will be submitted for admin approval."}
              </p>
              <div className="bg-base-200 rounded-lg p-3 space-y-2">
                <p className="text-sm font-semibold text-base-content">Post Details:</p>
                <p className="text-sm text-base-content/70">
                  <strong>Title:</strong> {title || "Untitled"}
                </p>
                <p className="text-sm text-base-content/70">
                  <strong>Status:</strong>{" "}
                  {isAdmin ? "Will be approved immediately" : "Will be pending approval"}
                </p>
                {category && (
                  <p className="text-sm text-base-content/70">
                    <strong>Category:</strong> {category}
                  </p>
                )}
                {tags.length > 0 && (
                  <p className="text-sm text-base-content/70">
                    <strong>Tags:</strong> {tags.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              color="default"
              onPress={() => setShowPublishModal(false)}
              isDisabled={loading}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={publishPost}
              isLoading={loading}
              isDisabled={loading}
            >
              {isAdmin ? "Publish Now" : "Submit for Approval"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Styles */}
      <style>{`
        .custom-scrollbar { 
          scrollbar-color: hsl(var(--p) / 0.3) transparent; 
          scrollbar-width: thin; 
        }
        .custom-scrollbar::-webkit-scrollbar { 
          width: 8px; 
          height: 8px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--p) / 0.3);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--p) / 0.5);
        }
        .ProseMirror { 
          outline: none; 
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--bc) / 0.4);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem auto;
          border-radius: 0.5rem;
        }
        .ProseMirror pre {
          background: hsl(var(--n));
          color: hsl(var(--nc));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .ProseMirror code {
          background: hsl(var(--n) / 0.3);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
        .ProseMirror pre code {
          background: transparent;
          padding: 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--p));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror h1 { font-size: 2em; }
        .ProseMirror h2 { font-size: 1.5em; }
        .ProseMirror h3 { font-size: 1.25em; }
        .ProseMirror a {
          color: hsl(var(--p));
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          color: hsl(var(--pf));
        }
      `}</style>
    </>
  );
}
