import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import { computePosition, flip, shift, offset } from "@floating-ui/dom";
import SlashMenu, { type SlashMenuHandle } from "./SlashMenu";
import { filterSlashItems, type EditorDialog, type SlashItem } from "./slashItems";

interface SlashCommandOptions {
  openDialog: (dialog: EditorDialog) => void;
}

const slashPluginKey = new PluginKey("slash-command");

/** "/" command palette for inserting blocks. */
export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return { openDialog: () => undefined };
  },

  addProseMirrorPlugins() {
    const openDialog = (dialog: EditorDialog) => this.options.openDialog(dialog);

    const suggestion: Omit<SuggestionOptions<SlashItem>, "editor"> = {
      char: "/",
      pluginKey: slashPluginKey,
      startOfLine: false,
      allowSpaces: false,
      allow: ({ state, range }) => {
        // Not inside code blocks.
        const $from = state.doc.resolve(range.from);
        return $from.parent.type.name !== "codeBlock";
      },
      items: ({ query }) => filterSlashItems(query),
      command: ({ editor, range, props }) => {
        props.run({ editor, range, openDialog });
      },
      render: () => {
        let renderer: ReactRenderer<SlashMenuHandle> | null = null;
        let popup: HTMLDivElement | null = null;

        const place = (clientRect?: (() => DOMRect | null) | null) => {
          const rect = clientRect?.();
          if (!popup || !rect) return;
          const virtual = { getBoundingClientRect: () => rect };
          void computePosition(virtual, popup, {
            placement: "bottom-start",
            strategy: "fixed",
            middleware: [offset(6), flip(), shift({ padding: 8 })],
          }).then(({ x, y }) => {
            if (popup) Object.assign(popup.style, { left: `${x}px`, top: `${y}px` });
          });
        };

        return {
          onStart: (props) => {
            renderer = new ReactRenderer(SlashMenu, { props, editor: props.editor });
            popup = document.createElement("div");
            popup.style.position = "fixed";
            popup.style.zIndex = "70";
            popup.appendChild(renderer.element);
            document.body.appendChild(popup);
            place(props.clientRect);
          },
          onUpdate: (props) => {
            renderer?.updateProps(props);
            place(props.clientRect);
          },
          onKeyDown: ({ event }) => {
            if (event.key === "Escape") {
              popup?.remove();
              popup = null;
              return true;
            }
            return renderer?.ref?.onKeyDown(event) ?? false;
          },
          onExit: () => {
            popup?.remove();
            popup = null;
            renderer?.destroy();
            renderer = null;
          },
        };
      },
    };

    return [Suggestion({ editor: this.editor, ...suggestion })];
  },
});
