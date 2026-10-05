import { useState } from "react";
import { EnvelopeIcon, EnvelopeOpenIcon, TrashIcon, InboxIcon } from "@heroicons/react/24/outline";
import { useDeleteMessage, useMessages, useSetMessageRead } from "../hooks/useMessages";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import PremiumSpinner from "../components/PremiumSpinner";
import { formatRelativeTime } from "../utils/date";
import { showDeleteConfirm, showError } from "../utils/sweetalert";

/** Contact-form inbox for administrators. */
export default function Messages(): React.ReactElement {
  const { data: messages = [], isLoading, error } = useMessages();
  const setRead = useSetMessageRead();
  const deleteMessage = useDeleteMessage();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const visible = filter === "unread" ? messages.filter((message) => !message.read) : messages;
  const unread = messages.filter((message) => !message.read).length;

  const toggle = (id: string, read: boolean) => {
    const opening = openId !== id;
    setOpenId(opening ? id : null);
    if (opening && !read) setRead.mutate({ id, read: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PremiumSpinner size="lg" text="Loading messages..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Messages"
        description={`${unread} unread · ${messages.length} total`}
        actions={
          <div className="join">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`btn btn-sm join-item ${filter === value ? "btn-primary" : "btn-ghost border border-base-300"}`}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
              >
                {value === "all" ? "All" : "Unread"}
              </button>
            ))}
          </div>
        }
      />
      {error && (
        <div role="alert" className="alert alert-error mb-4">
          Couldn't load messages.
        </div>
      )}
      <div className="surface overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState icon={InboxIcon} title={filter === "unread" ? "No unread messages" : "No messages yet"} description="Messages sent from the contact form appear here." />
        ) : (
          <ul className="divide-y divide-base-300">
            {visible.map((message) => {
              const isOpen = openId === message.id;
              return (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => toggle(message.id, message.read)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-base-200/60"
                  >
                    {message.read ? (
                      <EnvelopeOpenIcon className="mt-0.5 h-5 w-5 shrink-0 text-base-content/40" />
                    ) : (
                      <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`truncate ${message.read ? "" : "font-semibold"}`}>{message.name}</span>
                        <span className="shrink-0 text-xs text-base-content/55">{formatRelativeTime(message.createdAt)}</span>
                      </span>
                      <span className={`block text-sm text-base-content/65 ${isOpen ? "" : "truncate"}`}>
                        {isOpen ? message.email : message.message}
                      </span>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pl-12">
                      <p className="whitespace-pre-line rounded-xl bg-base-200 p-4 text-sm">{message.message}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message")}`}
                          className="btn btn-primary btn-sm"
                        >
                          Reply by email
                        </a>
                        <button type="button" className="btn btn-ghost btn-sm border border-base-300" onClick={() => setRead.mutate({ id: message.id, read: false })}>
                          Mark unread
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() =>
                            void showDeleteConfirm(`the message from ${message.name}`, async () => {
                              try {
                                await deleteMessage.mutateAsync(message.id);
                                setOpenId(null);
                              } catch {
                                showError("Couldn't delete", "Please try again.");
                              }
                            })
                          }
                        >
                          <TrashIcon className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
