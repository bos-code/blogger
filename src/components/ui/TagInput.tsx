import { useState, type KeyboardEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TagInputProps {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  max?: number;
  placeholder?: string;
}

const normaliseTag = (tag: string): string =>
  tag.trim().replace(/^#/, "").replace(/\s+/g, "-").toLowerCase().slice(0, 30);

/** Chip-style tag editor: Enter or comma adds a tag, Backspace removes the last. */
export default function TagInput({
  id,
  value,
  onChange,
  suggestions = [],
  max = 8,
  placeholder = "Add a tag and press Enter",
}: TagInputProps): React.ReactElement {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tags = raw
      .split(",")
      .map(normaliseTag)
      .filter(Boolean)
      .filter((tag) => !value.includes(tag));
    if (tags.length) onChange([...value, ...tags].slice(0, max));
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const remaining = suggestions.filter((tag) => !value.includes(tag)).slice(0, 6);

  return (
    <div>
      <div className="input flex h-auto min-h-10 w-full flex-wrap items-center gap-1.5 py-1.5">
        {value.map((tag) => (
          <span key={tag} className="badge badge-primary badge-soft gap-1">
            #{tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full hover:text-error"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length < max && (
          <input
            id={id}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => draft && add(draft)}
            placeholder={value.length ? "" : placeholder}
            className="min-w-24 flex-1 bg-transparent outline-none"
          />
        )}
      </div>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-base-content/55">Suggested:</span>
          {remaining.map((tag) => (
            <button
              key={tag}
              type="button"
              className="badge badge-ghost badge-sm hover:badge-primary"
              onClick={() => onChange([...value, tag].slice(0, max))}
            >
              +{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
