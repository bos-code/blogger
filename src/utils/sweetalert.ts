import Swal from "sweetalert2";

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
    // Add blur class to body and app container
    document.body.classList.add("swal-blur-active");
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
    document.body.classList.remove("swal-blur-active");
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
const configureSwal = (): typeof Swal => {
  // Set up global configuration with Tailwind classes
  Swal.mixin({
    customClass: {
      popup: "swal-popup rounded-2xl shadow-2xl bg-base-100 text-base-content",
      container: "swal-container",
      title: "text-2xl font-bold text-base-content",
      content: "text-base text-base-content/80",
      confirmButton: "btn btn-primary rounded-lg px-6 py-2 font-medium",
      cancelButton: "btn btn-ghost rounded-lg px-6 py-2 font-medium",
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

  return Swal;
};

// Initialize
configureSwal();

/**
 * Success Alert with Tailwind styling
 */
export const showSuccess = (
  title: string,
  message?: string,
  options?: any
): Promise<any> => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonText: options?.confirmButtonText || "OK",
    customClass: {
      confirmButton: "btn btn-success rounded-lg px-6 py-2 font-medium",
      ...options?.customClass,
    },
    buttonsStyling: false,
    ...options,
  });
};

/**
 * Error Alert with Tailwind styling
 */
export const showError = (
  title: string,
  message?: string,
  options?: any
): Promise<any> => {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: options?.confirmButtonText || "OK",
    customClass: {
      confirmButton: "btn btn-error rounded-lg px-6 py-2 font-medium",
      ...options?.customClass,
    },
    buttonsStyling: false,
    ...options,
  });
};

/**
 * Warning Alert with Tailwind styling
 */
export const showWarning = (
  title: string,
  message?: string,
  options?: any
): Promise<any> => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: options?.confirmButtonText || "OK",
    customClass: {
      confirmButton: "btn btn-warning rounded-lg px-6 py-2 font-medium",
      ...options?.customClass,
    },
    buttonsStyling: false,
    ...options,
  });
};

/**
 * Info Alert with Tailwind styling
 */
export const showInfo = (
  title: string,
  message?: string,
  options?: any
): Promise<any> => {
  return Swal.fire({
    icon: "info",
    title,
    text: message,
    confirmButtonText: options?.confirmButtonText || "OK",
    customClass: {
      confirmButton: "btn btn-info rounded-lg px-6 py-2 font-medium",
      ...options?.customClass,
    },
    buttonsStyling: false,
    ...options,
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
): Promise<any> => {
  const confirmColor = options?.confirmColor || "primary";
  const cancelColor = options?.cancelColor || "ghost";
  
  return Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: options?.confirmText || "Yes",
    cancelButtonText: options?.cancelText || "Cancel",
    customClass: {
      confirmButton: `btn btn-${confirmColor} rounded-lg px-6 py-2 font-medium`,
      cancelButton: `btn btn-${cancelColor} rounded-lg px-6 py-2 font-medium`,
    },
    buttonsStyling: false,
    reverseButtons: true,
    ...options,
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
): Promise<any> => {
  return Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: `This will permanently delete "${itemName}". This action cannot be undone.`,
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    customClass: {
      confirmButton: "btn btn-error rounded-lg px-6 py-2 font-medium",
      cancelButton: "btn btn-ghost rounded-lg px-6 py-2 font-medium",
    },
    buttonsStyling: false,
    reverseButtons: true,
    confirmButtonColor: "#ef4444",
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
export const showCustom = (options: any): Promise<any> => {
  return Swal.fire({
    didOpen: () => applyBlur(),
    didClose: () => removeBlur(),
    ...options,
  });
};

/**
 * Loading Alert with Tailwind styling
 */
export const showLoading = (title: string = "Loading..."): void => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: "swal-popup rounded-2xl shadow-2xl bg-base-100 text-base-content",
    },
    buttonsStyling: false,
    didOpen: () => {
      applyBlur();
      Swal.showLoading();
    },
  });
};

/**
 * Close any open alert
 */
export const closeAlert = (): void => {
  Swal.close();
  removeBlur();
};

// Export default Swal instance
export default Swal;

