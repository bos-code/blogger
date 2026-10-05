import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { SlashItem } from "./slashItems";

export interface SlashMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface SlashMenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

/** Keyboard-navigable list shown while typing "/" in the editor. */
const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => setSelectedIndex(0), [items]);

    useEffect(() => {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (event) => {
        if (items.length === 0) return false;
        if (event.key === "ArrowDown") {
          setSelectedIndex((index) => (index + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          setSelectedIndex((index) => (index - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          command(items[selectedIndex]);
          return true;
        }
        return false;
      },
    }));

    return (
      <div
        ref={listRef}
        role="listbox"
        aria-label="Insert block"
        className="surface max-h-80 w-72 overflow-y-auto p-1.5 shadow-xl"
      >
        {items.length === 0 ? (
          <p className="px-3 py-2 text-sm text-base-content/60">No matching blocks</p>
        ) : (
          items.map((item, index) => (
            <button
              key={item.title}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              data-index={index}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => command(item)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left ${
                index === selectedIndex ? "bg-primary/15" : "hover:bg-base-200"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-base-300 bg-base-200 font-mono text-xs font-semibold">
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="block truncate text-xs text-base-content/60">
                  {item.description}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    );
  }
);

SlashMenu.displayName = "SlashMenu";
export default SlashMenu;
