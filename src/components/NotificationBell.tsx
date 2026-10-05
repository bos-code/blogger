import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BellIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import {
  isNotificationRead,
  useMarkNotificationsRead,
  useNotifications,
} from "../hooks/useNotifications";
import { useMessages } from "../hooks/useMessages";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import { formatRelativeTime } from "../utils/date";

/** Navbar bell: recent notifications plus (for admins) unread contact messages. */
export default function NotificationBell(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const setDashboardScreen = useUIStore((state) => state.setDashboardScreen);
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const { data: messages = [] } = useMessages();
  const markRead = useMarkNotificationsRead();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadMessages = messages.filter((message) => !message.read).length;
  const unreadNotifications = notifications.filter(
    (notification) => !isNotificationRead(notification, user?.uid)
  ).length;
  const badge = unreadNotifications + unreadMessages;

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openMessages = () => {
    setOpen(false);
    setDashboardScreen("messages");
    navigate("/admin");
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn btn-ghost btn-circle btn-sm relative"
        aria-label={badge ? `Notifications (${badge} unread)` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <BellIcon className="h-5 w-5" />
        {badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-error-content">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="surface fixed inset-x-3 top-16 z-50 overflow-hidden shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-96"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
              <h2 className="font-semibold">Notifications</h2>
              {unreadNotifications > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => markRead.mutate(notifications)}
                  disabled={markRead.isPending}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {unreadMessages > 0 && (
                <button
                  type="button"
                  onClick={openMessages}
                  className="flex w-full items-center gap-3 border-b border-base-300 bg-primary/5 px-4 py-3 text-left hover:bg-primary/10"
                >
                  <EnvelopeIcon className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">
                    {unreadMessages} unread contact {unreadMessages === 1 ? "message" : "messages"}
                  </span>
                </button>
              )}

              {notifications.length === 0 && unreadMessages === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-base-content/60">
                  You're all caught up.
                </p>
              ) : (
                <ul className="divide-y divide-base-300">
                  {notifications.map((notification) => {
                    const unread = !isNotificationRead(notification, user?.uid);
                    const href =
                      notification.link ||
                      (notification.blogId ? `/blog/${notification.blogId}` : null);
                    const body = (
                      <div className="flex gap-3 px-4 py-3">
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            unread ? "bg-primary" : "bg-transparent"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className={`text-sm ${unread ? "font-medium" : "text-base-content/75"}`}>
                            {notification.message}
                          </p>
                          <p className="mt-0.5 text-xs text-base-content/55">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <li key={notification.id}>
                        {href ? (
                          <Link
                            to={href}
                            onClick={() => {
                              setOpen(false);
                              if (unread) markRead.mutate([notification]);
                            }}
                            className="block hover:bg-base-200"
                          >
                            {body}
                          </Link>
                        ) : (
                          body
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
