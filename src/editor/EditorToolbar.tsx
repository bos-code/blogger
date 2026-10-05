import type { ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeBracketIcon,
  LinkIcon,
  ListBulletIcon,
  NumberedListIcon,
  PhotoIcon,
  VideoCameraIcon,
  TableCellsIcon,
  ChatBubbleBottomCenterTextIcon,
  CodeBracketSquareIcon,
  MinusIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  PaintBrushIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import { CODE_LANGUAGES } from "./extensions";
import type { EditorDialog } from "./slashItems";

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";

interface ToolButtonProps {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function ToolButton({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children,
}: ToolButtonProps): React.ReactElement {
  const title = shortcut ? `${label} (${shortcut})` : label;
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={title}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm transition-colors disabled:opacity-35 ${
        active
          ? "bg-primary/15 text-primary"
          : "text-base-content/75 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => (
  <span className="mx-1 h-5 w-px shrink-0 bg-base-300" aria-hidden="true" />
);

interface EditorToolbarProps {
  editor: Editor;
  openDialog: (dialog: EditorDialog) => void;
}

export default function EditorToolbar({
  editor,
  openDialog,
}: EditorToolbarProps): React.ReactElement {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      block: e.isActive("heading", { level: 1 })
        ? "h1"
        : e.isActive("heading", { level: 2 })
          ? "h2"
          : e.isActive("heading", { level: 3 })
            ? "h3"
            : "p",
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      highlight: e.isActive("highlight"),
      link: e.isActive("link"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      taskList: e.isActive("taskList"),
      blockquote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      codeLanguage: (e.getAttributes("codeBlock").language as string | undefined) ?? "",
      callout: e.isActive("callout"),
      table: e.isActive("table"),
      alignCenter: e.isActive({ textAlign: "center" }),
      alignRight: e.isActive({ textAlign: "right" }),
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex items-center gap-0.5 overflow-x-auto px-2 py-1.5 [scrollbar-width:thin]"
    >
      <ToolButton label="Undo" shortcut={`${MOD}+Z`} disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        <ArrowUturnLeftIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Redo" shortcut={`${MOD}+Shift+Z`} disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        <ArrowUturnRightIcon className="h-4 w-4" />
      </ToolButton>
      <Divider />

      <select
        aria-label="Text style"
        className="select select-ghost select-sm h-8 min-h-8 w-32 shrink-0"
        value={state.block}
        onChange={(event) => {
          const value = event.target.value;
          if (value === "p") chain().setParagraph().run();
          else chain().setHeading({ level: Number(value[1]) as 1 | 2 | 3 }).run();
        }}
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>
      <Divider />

      <ToolButton label="Bold" shortcut={`${MOD}+B`} active={state.bold} onClick={() => chain().toggleBold().run()}>
        <BoldIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Italic" shortcut={`${MOD}+I`} active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <ItalicIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Underline" shortcut={`${MOD}+U`} active={state.underline} onClick={() => chain().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Strikethrough" shortcut={`${MOD}+Shift+S`} active={state.strike} onClick={() => chain().toggleStrike().run()}>
        <StrikethroughIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Inline code" shortcut={`${MOD}+E`} active={state.code} onClick={() => chain().toggleCode().run()}>
        <CodeBracketIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Highlight" shortcut={`${MOD}+Shift+H`} active={state.highlight} onClick={() => chain().toggleHighlight().run()}>
        <PaintBrushIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Link" shortcut={`${MOD}+K`} active={state.link} onClick={() => openDialog("link")}>
        <LinkIcon className="h-4 w-4" />
      </ToolButton>
      <Divider />

      <ToolButton label="Bulleted list" shortcut={`${MOD}+Shift+8`} active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
        <ListBulletIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Numbered list" shortcut={`${MOD}+Shift+7`} active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
        <NumberedListIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="To-do list" shortcut={`${MOD}+Shift+9`} active={state.taskList} onClick={() => chain().toggleTaskList().run()}>
        <CheckCircleIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Quote" shortcut={`${MOD}+Shift+B`} active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
        <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Code block" shortcut={`${MOD}+Alt+C`} active={state.codeBlock} onClick={() => chain().toggleCodeBlock().run()}>
        <CodeBracketSquareIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        label={state.callout ? "Remove callout" : "Callout"}
        active={state.callout}
        onClick={() =>
          state.callout ? chain().unsetCallout().run() : chain().setCallout("info").run()
        }
      >
        <InformationCircleIcon className="h-4 w-4" />
      </ToolButton>
      <Divider />

      <ToolButton label="Align left" shortcut={`${MOD}+Shift+L`} active={!state.alignCenter && !state.alignRight} onClick={() => chain().setTextAlign("left").run()}>
        <Bars3BottomLeftIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Align centre" shortcut={`${MOD}+Shift+E`} active={state.alignCenter} onClick={() => chain().setTextAlign("center").run()}>
        <Bars3Icon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Align right" shortcut={`${MOD}+Shift+R`} active={state.alignRight} onClick={() => chain().setTextAlign("right").run()}>
        <Bars3BottomRightIcon className="h-4 w-4" />
      </ToolButton>
      <Divider />

      <ToolButton label="Image" onClick={() => openDialog("image")}>
        <PhotoIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="YouTube video" onClick={() => openDialog("youtube")}>
        <VideoCameraIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="CodePen / CodeSandbox" onClick={() => openDialog("embed")}>
        <CubeTransparentIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        label="Table"
        active={state.table}
        onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableCellsIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Divider" onClick={() => chain().setHorizontalRule().run()}>
        <MinusIcon className="h-4 w-4" />
      </ToolButton>

      {state.codeBlock && (
        <>
          <Divider />
          <select
            aria-label="Code language"
            className="select select-ghost select-sm h-8 min-h-8 w-32 shrink-0"
            value={state.codeLanguage || "javascript"}
            onChange={(event) =>
              chain().updateAttributes("codeBlock", { language: event.target.value }).run()
            }
          >
            {CODE_LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </>
      )}

      {state.table && (
        <>
          <Divider />
          <ToolButton label="Add row below" onClick={() => chain().addRowAfter().run()}>
            <span className="text-xs font-medium">+Row</span>
          </ToolButton>
          <ToolButton label="Add column right" onClick={() => chain().addColumnAfter().run()}>
            <span className="text-xs font-medium">+Col</span>
          </ToolButton>
          <ToolButton label="Delete row" onClick={() => chain().deleteRow().run()}>
            <span className="text-xs font-medium">−Row</span>
          </ToolButton>
          <ToolButton label="Delete column" onClick={() => chain().deleteColumn().run()}>
            <span className="text-xs font-medium">−Col</span>
          </ToolButton>
          <ToolButton label="Delete table" onClick={() => chain().deleteTable().run()}>
            <span className="text-xs font-medium text-error">Delete table</span>
          </ToolButton>
        </>
      )}
    </div>
  );
}
