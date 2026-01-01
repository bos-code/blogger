import { useEffect } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { showSuccess, showError, showInfo, showWarning } from "../utils/sweetalert";

/**
 * Notification Modal using SweetAlert
 * Replaces the old HeroUI modal with SweetAlert for better UX
 */
export default function NotificationModal(): null {
  const notification = useNotificationStore((state) => state.notification);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  useEffect(() => {
    if (!notification) return;

    const showNotification = async () => {
      const title = notification.title || notification.type.toUpperCase();
      const message = notification.message;

      switch (notification.type) {
        case "success":
          await showSuccess(title, message, {
            timer: notification.autoClose !== false ? (notification.duration || 3000) : undefined,
            timerProgressBar: true,
          });
          break;
        case "error":
          await showError(title, message, {
            timer: notification.autoClose !== false ? (notification.duration || 3000) : undefined,
            timerProgressBar: true,
          });
          break;
        case "info":
          await showInfo(title, message, {
            timer: notification.autoClose !== false ? (notification.duration || 3000) : undefined,
            timerProgressBar: true,
          });
          break;
        default:
          await showWarning(title, message, {
            timer: notification.autoClose !== false ? (notification.duration || 3000) : undefined,
            timerProgressBar: true,
          });
      }

      hideNotification();
    };

    showNotification();
  }, [notification, hideNotification]);

  return null;
}








