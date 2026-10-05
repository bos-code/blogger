import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Modal from "./ui/Modal";
import { aiService } from "../services/aiService";

interface AIAssistantProps {
  title: string;
  text: string;
  onApplyTitle: (title: string) => void;
  onApplyExcerpt: (excerpt: string) => void;
}

/**
 * Suggests titles and an excerpt. Nothing is changed until the writer picks
 * a suggestion. Renders nothing when no AI key is configured.
 */
export default function AIAssistant({
  title,
  text,
  onApplyTitle,
  onApplyExcerpt,
}: AIAssistantProps): React.ReactElement | null {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"titles" | "excerpt" | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!aiService.isConfigured) return null;

  const run = async (kind: "titles" | "excerpt") => {
    if (text.trim().length < 50) {
      setError("Write a few sentences first so there's something to work with.");
      return;
    }
    setError(null);
    setLoading(kind);
    try {
      if (kind === "titles") setTitles(await aiService.suggestTitles(title, text));
      else setExcerpt(await aiService.suggestExcerpt(title, text));
    } catch (aiError) {
      setError(aiError instanceof Error ? aiError.message : "The AI request failed.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm gap-1.5"
        onClick={() => setOpen(true)}
      >
        <SparklesIcon className="h-4 w-4" />
        <span className="hidden sm:inline">AI</span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="AI suggestions"
        description="Suggestions are only applied when you choose them."
        size="lg"
      >
        <div className="flex flex-col gap-6">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Titles</h3>
              <button
                type="button"
                className="btn btn-sm btn-primary btn-soft"
                onClick={() => void run("titles")}
                disabled={loading !== null}
              >
                {loading === "titles" ? <span className="loading loading-spinner loading-xs" /> : null}
                Suggest titles
              </button>
            </div>
            {titles.length > 0 && (
              <ul className="flex flex-col gap-1">
                {titles.map((suggestion) => (
                  <li key={suggestion} className="flex items-center justify-between gap-2 rounded-lg bg-base-200 px-3 py-2 text-sm">
                    <span>{suggestion}</span>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      onClick={() => {
                        onApplyTitle(suggestion);
                        setOpen(false);
                      }}
                    >
                      Use
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Excerpt</h3>
              <button
                type="button"
                className="btn btn-sm btn-primary btn-soft"
                onClick={() => void run("excerpt")}
                disabled={loading !== null}
              >
                {loading === "excerpt" ? <span className="loading loading-spinner loading-xs" /> : null}
                Suggest excerpt
              </button>
            </div>
            {excerpt && (
              <div className="rounded-lg bg-base-200 p-3 text-sm">
                <p>{excerpt}</p>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost mt-2"
                  onClick={() => {
                    onApplyExcerpt(excerpt);
                    setOpen(false);
                  }}
                >
                  Use this excerpt
                </button>
              </div>
            )}
          </section>

          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
