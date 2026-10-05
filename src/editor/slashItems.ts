import type { Editor, Range } from "@tiptap/core";

export type EditorDialog = "image" | "link" | "embed" | "youtube";

export interface SlashItem {
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  run: (ctx: {
    editor: Editor;
    range: Range;
    openDialog: (dialog: EditorDialog) => void;
  }) => void;
}

export const SLASH_ITEMS: SlashItem[] = [
  {
    title: "Text",
    description: "Plain paragraph",
    icon: "¶",
    keywords: ["paragraph", "p", "text"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: "H1",
    keywords: ["h1", "title", "heading"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: "H2",
    keywords: ["h2", "subtitle", "heading"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "H3",
    keywords: ["h3", "heading"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Bulleted list",
    description: "Simple bulleted list",
    icon: "•",
    keywords: ["ul", "bullet", "list", "unordered"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    description: "List with numbers",
    icon: "1.",
    keywords: ["ol", "ordered", "numbered", "list"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "To-do list",
    description: "Checklist with tick boxes",
    icon: "☑",
    keywords: ["todo", "task", "checklist", "checkbox"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Quote",
    description: "Highlight a quotation",
    icon: "❝",
    keywords: ["blockquote", "quote", "citation"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code block",
    description: "Code with syntax highlighting",
    icon: "</>",
    keywords: ["code", "pre", "snippet", "javascript"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Callout — Info",
    description: "Highlighted note",
    icon: "ℹ",
    keywords: ["callout", "note", "info", "aside"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("info").run(),
  },
  {
    title: "Callout — Tip",
    description: "Helpful tip",
    icon: "✓",
    keywords: ["callout", "tip", "success", "hint"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("tip").run(),
  },
  {
    title: "Callout — Warning",
    description: "Something to watch out for",
    icon: "!",
    keywords: ["callout", "warning", "caution"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCallout("warning").run(),
  },
  {
    title: "Table",
    description: "3 × 3 table with a header row",
    icon: "▦",
    keywords: ["table", "grid", "rows", "columns"],
    run: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: "Image",
    description: "Upload or link an image",
    icon: "🖼",
    keywords: ["image", "photo", "picture", "upload"],
    run: ({ editor, range, openDialog }) => {
      editor.chain().focus().deleteRange(range).run();
      openDialog("image");
    },
  },
  {
    title: "YouTube video",
    description: "Embed a YouTube video",
    icon: "▶",
    keywords: ["youtube", "video", "embed"],
    run: ({ editor, range, openDialog }) => {
      editor.chain().focus().deleteRange(range).run();
      openDialog("youtube");
    },
  },
  {
    title: "CodePen / CodeSandbox",
    description: "Embed a live code demo",
    icon: "⧉",
    keywords: ["codepen", "codesandbox", "embed", "demo", "sandbox"],
    run: ({ editor, range, openDialog }) => {
      editor.chain().focus().deleteRange(range).run();
      openDialog("embed");
    },
  },
  {
    title: "Divider",
    description: "Horizontal line",
    icon: "—",
    keywords: ["hr", "divider", "separator", "line"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

export const filterSlashItems = (query: string): SlashItem[] => {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((keyword) => keyword.startsWith(q))
  );
};
