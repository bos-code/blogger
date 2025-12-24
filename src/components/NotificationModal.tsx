import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { useNotificationStore } from "../stores/notificationStore";
import { useEffect } from "react";

export default function NotificationModal(): JSX.Element | null {
  const notification = useNotificationStore((state) => state.notification);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  useEffect(() => {
    if (notification?.autoClose !== false) {
      const timer = setTimeout(() => {
        hideNotification();
      }, notification?.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) return null;

  const getIcon = (): JSX.Element => {
    switch (notification.type) {
      case "success":
        return <CheckCircleIcon className="w-6 h-6 text-success" />;
      case "error":
        return <XCircleIcon className="w-6 h-6 text-danger" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-primary" />;
    }
  };

  const getColor = (): "success" | "danger" | "primary" => {
    switch (notification.type) {
      case "success":
        return "success";
      case "error":
        return "danger";
      default:
        return "primary";
    }
  };

  return (
    <Modal
      isOpen={!!notification}
      onClose={hideNotification}
      isDismissable
      placement="top-center"
      size="sm"
      hideCloseButton={notification.autoClose !== false}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          {getIcon()}
          <span>{notification.title || notification.type.toUpperCase()}</span>
        </ModalHeader>
        <ModalBody>
          <p className="text-base-content">{notification.message}</p>
        </ModalBody>
        {notification.autoClose === false && (
          <ModalFooter>
            <Button color={getColor()} onPress={hideNotification}>
              OK
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}


