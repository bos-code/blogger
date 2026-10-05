import { useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { NodeSelection } from "@tiptap/pm/state";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeBracketIcon,
  LinkIcon,
  PaintBrushIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { ToolButton } from "./EditorToolbar";
import type { EditorDialog } from "./slashItems";
import type { ImageSize } from "./ImageFigure";
import type { CalloutVariant } from "./Callout";

interface Props {
  editor: Editor;
  openDialog: (dialog: EditorDialog) => void;
}

const isImageSelected = (editor: Editor) => {
  const { selection } = editor.state;
  return selection instanceof NodeSelection && selection.node.type.name === "image";
};

export default function EditorBubbleMenus({ editor, openDialog }: Props): React.ReactElement {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      highlight: e.isActive("highlight"),
      link: e.isActive("link"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      imageSize: (e.getAttributes("image").size as ImageSize | undefined) ?? "full",
      calloutVariant:
        (e.getAttributes("callout").variant as CalloutVariant | undefined) ?? "info",
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    <>
      {/* Text formatting on selection */}
      <BubbleMenu
        editor={editor}
        pluginKey="textBubbleMenu"
        shouldShow={({ editor: e, state: s }) => {
          const { empty } = s.selection;
          return (
            !empty &&
            e.isEditable &&
            !isImageSelected(e) &&
            !e.isActive("codeBlock") &&
            !(s.selection instanceof NodeSelection)
          );
        }}
        options={{ placement: "top", offset: 8 }}
      >
        <div className="surface flex items-center gap-0.5 p-1 shadow-xl">
          <ToolButton label="Heading 2" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
            <span className="text-xs font-bold">H2</span>
          </ToolButton>
          <ToolButton label="Heading 3" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
            <span className="text-xs font-bold">H3</span>
          </ToolButton>
          <span className="mx-0.5 h-5 w-px bg-base-300" aria-hidden="true" />
          <ToolButton label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}>
            <BoldIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()}>
            <ItalicIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Underline" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
            <UnderlineIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}>
            <StrikethroughIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Inline code" active={state.code} onClick={() => chain().toggleCode().run()}>
            <CodeBracketIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Highlight" active={state.highlight} onClick={() => chain().toggleHighlight().run()}>
            <PaintBrushIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton label={state.link ? "Edit link" : "Add link"} active={state.link} onClick={() => openDialog("link")}>
            <LinkIcon className="h-4 w-4" />
          </ToolButton>
        </div>
      </BubbleMenu>

      {/* Image options */}
      <BubbleMenu
        editor={editor}
        pluginKey="imageBubbleMenu"
        shouldShow={({ editor: e }) => isImageSelected(e)}
        options={{ placement: "top", offset: 8 }}
      >
        <div className="surface flex items-center gap-0.5 p-1 shadow-xl">
          {(["small", "medium", "full"] as ImageSize[]).map((size) => (
            <ToolButton
              key={size}
              label={`${size[0].toUpperCase()}${size.slice(1)} width`}
              active={state.imageSize === size}
              onClick={() => chain().updateFigure({ size }).run()}
            >
              <span className="text-xs font-medium capitalize">{size}</span>
            </ToolButton>
          ))}
          <span className="mx-0.5 h-5 w-px bg-base-300" aria-hidden="true" />
          <ToolButton label="Edit alt text and caption" onClick={() => openDialog("image")}>
            <PencilSquareIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Remove image" onClick={() => chain().deleteSelection().run()}>
            <TrashIcon className="h-4 w-4 text-error" />
          </ToolButton>
        </div>
      </BubbleMenu>

      {/* Callout style */}
      <BubbleMenu
        editor={editor}
        pluginKey="calloutBubbleMenu"
        shouldShow={({ editor: e, state: s }) =>
          e.isActive("callout") && s.selection.empty
        }
        options={{ placement: "top-start", offset: 8 }}
      >
        <div className="surface flex items-center gap-0.5 p-1 shadow-xl">
          {(["info", "tip", "warning", "danger"] as CalloutVariant[]).map((variant) => (
            <ToolButton
              key={variant}
              label={`${variant} callout`}
              active={state.calloutVariant === variant}
              onClick={() => chain().updateCallout(variant).run()}
            >
              <span className="text-xs font-medium capitalize">{variant}</span>
            </ToolButton>
          ))}
          <ToolButton label="Remove callout" onClick={() => chain().unsetCallout().run()}>
            <TrashIcon className="h-4 w-4 text-error" />
          </ToolButton>
        </div>
      </BubbleMenu>
    </>
  );
}
