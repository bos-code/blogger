import Swal from "sweetalert2";
import type { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

/**
 * SweetAlert Utility with Background Blur
 * 
 * This utility wraps SweetAlert2 to automatically blur the background
 * when any modal is displayed.
 */

// Track if a modal is currently open
let isModalOpen = false;

/**
 * Apply blur to background when modal opens
 */
const applyBlur = (): void => {
  if (!isModalOpen) {
    isModalOpen = true;
    const appElement = document.querySelector(".App");
    if (appElement) {
      (appElement as HTMLElement).classList.add("swal-blur-active");
    }
  }
};

/**
 * Remove blur from background when modal closes
 */
const removeBlur = (): void => {
  if (isModalOpen) {
    isModalOpen = false;
    const appElement = document.querySelector(".App");
    if (appElement) {
      (appElement as HTMLElement).classList.remove("swal-blur-active");
    }
  }
};

/**
 * Configure SweetAlert with default settings and blur effect
 * Uses Tailwind CSS classes for styling
 */
const StyledSwal = Swal.mixin({
  customClass: {
    popup: "swal-popup",
    title: "text-2xl font-bold text-base-content",
    htmlContainer: "text-base text-base-content/80",
    confirmButton: "btn btn-primary rounded-lg px-6 font-medium",
    cancelButton: "btn btn-ghost rounded-lg px-6 font-medium",
    actions: "gap-3",
  },
  buttonsStyling: false,
  didOpen: () => {
    applyBlur();
  },
  didClose: () => {
    removeBlur();
  },
});

const mergeCustomClass = (
  options: SweetAlertOptions,
  confirmButton: string
): SweetAlertOptions["customClass"] => ({
  popup: "swal-popup",
  title: "text-2xl font-bold text-base-content",
  htmlContainer: "text-base text-base-content/80",
  confirmButton,
  ...(typeof options.customClass === "object" ? options.customClass : {}),
});

/**
 * Non-blocking toast used for routine confirmations.
 */
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3200,
  timerProgressBar: true,
  customClass: { popup: "swal-toast" },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const showToast = (
  icon: "success" | "info" | "warning" | "error",
  title: string,
  message?: string
): Promise<SweetAlertResult> => Toast.fire({ icon, title, text: message });

/**
 * Success feedback, shown as a toast so it never blocks the page.
 */
export const showSuccess = (
  title: string,
  message?: string,
  options: SweetAlertOptions = {}
): Promise<SweetAlertResult> => {
  return Toast.fire({
    icon: "success",
    title,
    text: message,
    ...(typeof options.timer === "number" ? { timer: options.timer } : {}),
  });
};

/**
 * Error Alert with Tailwind styling
 */
export const showError = (
  title: string,
  message?: string,
  options: SweetAlertOptions = {}
): Promise<SweetAlertResult> => {
  return StyledSwal.fire({
    ...options,
    icon: "error",
    title,
    text: message,
    confirmButtonText: options.confirmButtonText || "OK",
    customClass: mergeCustomClass(
      options,
      "btn btn-error rounded-lg px-6 py-2 font-medium"
    ),
    buttonsStyling: false,
  });
};

/**
 * Warning Alert with Tailwind styling
 */
export const showWarning = (
  title: string,
  message?: string,
  options: SweetAlertOptions = {}
): Promise<SweetAlertResult> => {
  return StyledSwal.fire({
    ...options,
    icon: "warning",
    title,
    text: message,
    confirmButtonText: options.confirmButtonText || "OK",
    customClass: mergeCustomClass(
      options,
      "btn btn-warning rounded-lg px-6 py-2 font-medium"
    ),
    buttonsStyling: false,
  });
};

/**
 * Informational feedback, shown as a toast.
 */
export const showInfo = (
  title: string,
  message?: string,
  options: SweetAlertOptions = {}
): Promise<SweetAlertResult> => {
  return Toast.fire({
    icon: "info",
    title,
    text: message,
    ...(typeof options.timer === "number" ? { timer: options.timer } : {}),
  });
};

/**
 * Confirmation Dialog with Tailwind styling
 */
export const showConfirm = (
  title: string,
  message?: string,
  options?: {
    confirmText?: string;
    cancelText?: string;
    confirmColor?: "primary" | "success" | "error" | "warning" | "info";
    cancelColor?: "ghost" | "neutral";
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
  }
): Promise<SweetAlertResult | void> => {
  const confirmColor = options?.confirmColor || "primary";
  const cancelColor = options?.cancelColor || "ghost";
  
  return StyledSwal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: options?.confirmText || "Yes",
    cancelButtonText: options?.cancelText || "Cancel",
    customClass: {
      popup: "swal-popup",
      title: "text-2xl font-bold text-base-content",
      htmlContainer: "text-base text-base-content/80",
      confirmButton: `btn btn-${confirmColor} rounded-lg px-6 font-medium`,
      cancelButton: `btn btn-${cancelColor} rounded-lg px-6 font-medium`,
    },
    buttonsStyling: false,
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed && options?.onConfirm) {
      return options.onConfirm();
    } else if (result.isDismissed && options?.onCancel) {
      options.onCancel();
    }
    return result;
  });
};

/**
 * Delete Confirmation (Specialized) with Tailwind styling
 */
export const showDeleteConfirm = (
  itemName: string,
  onConfirm: () => void | Promise<void>
): Promise<SweetAlertResult | void> => {
  return StyledSwal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: `This will permanently delete "${itemName}". This action cannot be undone.`,
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "swal-popup",
      title: "text-2xl font-bold text-base-content",
      htmlContainer: "text-base text-base-content/80",
      confirmButton: "btn btn-error rounded-lg px-6 font-medium",
      cancelButton: "btn btn-ghost rounded-lg px-6 font-medium",
    },
    buttonsStyling: false,
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      return onConfirm();
    }
    return result;
  });
};

/**
 * Custom Alert (Full Control)
 */
export const showCustom = (
  options: SweetAlertOptions
): Promise<SweetAlertResult> => {
  return StyledSwal.fire(options);
};

/**
 * Loading Alert with Tailwind styling
 */
export const showLoading = (title: string = "Loading..."): void => {
  void StyledSwal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: "swal-popup rounded-2xl shadow-2xl bg-base-100 text-base-content",
    },
    buttonsStyling: false,
    didOpen: () => {
      applyBlur();
      StyledSwal.showLoading();
    },
  });
};

/**
 * Close any open alert
 */
export const closeAlert = (): void => {
  StyledSwal.close();
  removeBlur();
};

// Export default Swal instance
export default StyledSwal;
