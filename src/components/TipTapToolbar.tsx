import type { Editor } from "@tiptap/react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeBracketIcon,
  ListBulletIcon,
  Bars3BottomLeftIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

interface TipTapToolbarProps {
  editor: Editor | null;
}

export default function TipTapToolbar({ editor }: TipTapToolbarProps): JSX.Element | null {
  if (!editor) {
    return null;
  }

  const addImage = (): void => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = (): void => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addYoutube = (): void => {
    const url = window.prompt("Enter YouTube URL:");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  return (
    <div className="border-b border-base-300 p-2 flex flex-wrap items-center gap-1 bg-base-200/50 rounded-t-lg">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r border-base-300 pr-2 mr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("bold") ? "btn-active" : ""
          }`}
          title="Bold"
        >
          <BoldIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("italic") ? "btn-active" : ""
          }`}
          title="Italic"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("underline") ? "btn-active" : ""
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("strike") ? "btn-active" : ""
          }`}
          title="Strikethrough"
        >
          <StrikethroughIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("code") ? "btn-active" : ""
          }`}
          title="Inline Code"
        >
          <CodeBracketIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-r border-base-300 pr-2 mr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("heading", { level: 1 }) ? "btn-active" : ""
          }`}
          title="Heading 1"
        >
          <span className="text-xs font-bold">H1</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("heading", { level: 2 }) ? "btn-active" : ""
          }`}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("heading", { level: 3 }) ? "btn-active" : ""
          }`}
          title="Heading 3"
        >
          <span className="text-xs font-bold">H3</span>
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 border-r border-base-300 pr-2 mr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("bulletList") ? "btn-active" : ""
          }`}
          title="Bullet List"
        >
          <ListBulletIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("orderedList") ? "btn-active" : ""
          }`}
          title="Ordered List"
        >
          <Bars3BottomLeftIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("blockquote") ? "btn-active" : ""
          }`}
          title="Quote"
        >
          <span className="text-xs">"</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("codeBlock") ? "btn-active" : ""
          }`}
          title="Code Block"
        >
          <CodeBracketIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Media */}
      <div className="flex items-center gap-1 border-r border-base-300 pr-2 mr-2">
        <button
          type="button"
          onClick={addLink}
          className={`btn btn-sm btn-ghost ${
            editor.isActive("link") ? "btn-active" : ""
          }`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="btn btn-sm btn-ghost"
          title="Add Image"
        >
          <PhotoIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addYoutube}
          className="btn btn-sm btn-ghost"
          title="Add YouTube Video"
        >
          <VideoCameraIcon className="w-4 h-4" />
        </button>
      </div>

      {/* History */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="btn btn-sm btn-ghost"
          title="Undo"
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="btn btn-sm btn-ghost"
          title="Redo"
        >
          <ArrowUturnRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}












