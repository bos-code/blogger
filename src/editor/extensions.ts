import { Extension, type AnyExtension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Youtube from "@tiptap/extension-youtube";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { lowlight } from "lowlight/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import python from "highlight.js/lib/languages/python";
import { ImageFigure } from "./ImageFigure";
import { Callout } from "./Callout";
import { Embed } from "./Embed";
import { SlashCommand } from "./SlashCommand";
import type { EditorDialog } from "./slashItems";

const LANGUAGES = {
  javascript,
  typescript,
  css,
  html: xml,
  xml,
  json,
  bash,
  python,
} as const;

for (const [name, language] of Object.entries(LANGUAGES)) {
  if (!lowlight.registered(name)) lowlight.registerLanguage(name, language);
}
if (!lowlight.registered("js")) lowlight.registerLanguage("js", javascript);
if (!lowlight.registered("ts")) lowlight.registerLanguage("ts", typescript);

export const CODE_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Shell" },
  { value: "python", label: "Python" },
  { value: "plaintext", label: "Plain text" },
];

interface ImageDropOptions {
  onFiles: (files: File[], position?: number) => void;
}

/** Uploads images that are pasted or dropped into the editor. */
const ImageDrop = Extension.create<ImageDropOptions>({
  name: "imageDrop",

  addOptions() {
    return { onFiles: () => undefined };
  },

  addProseMirrorPlugins() {
    const onFiles = (files: File[], position?: number) =>
      this.options.onFiles(files, position);

    const imagesFrom = (list: FileList | null | undefined): File[] =>
      Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));

    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const files = imagesFrom(event.clipboardData?.files);
            if (files.length === 0) return false;
            event.preventDefault();
            onFiles(files);
            return true;
          },
          handleDrop: (view, event) => {
            const files = imagesFrom(event.dataTransfer?.files);
            if (files.length === 0) return false;
            event.preventDefault();
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            onFiles(files, coordinates?.pos);
            return true;
          },
        },
      }),
    ];
  },
});

interface BuildOptions {
  placeholder?: string;
  openDialog: (dialog: EditorDialog) => void;
  onImageFiles: (files: File[], position?: number) => void;
}

export const buildEditorExtensions = ({
  placeholder = "Write something, or press “/” for blocks…",
  openDialog,
  onImageFiles,
}: BuildOptions): AnyExtension[] => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "noopener noreferrer" },
    },
  }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: "javascript" }),
  ImageFigure.configure({ allowBase64: false }),
  Youtube.configure({ controls: true, nocookie: true }),
  Highlight,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TableKit.configure({ table: { resizable: false } }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Callout,
  Embed,
  CharacterCount,
  Placeholder.configure({
    placeholder: ({ node }) =>
      node.type.name === "heading" ? "Heading" : placeholder,
    includeChildren: false,
  }),
  SlashCommand.configure({ openDialog }),
  ImageDrop.configure({ onFiles: onImageFiles }),
];
