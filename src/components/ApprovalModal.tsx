import { useEffect } from "react";
import { useUIStore } from "../stores/uiStore";
import { useApprovePost } from "../hooks/usePosts";
import { showConfirm, showSuccess, showError } from "../utils/sweetalert";

/**
 * Approval Modal using SweetAlert
 * Replaces the old HeroUI modal with SweetAlert for better UX
 */
export default function ApprovalModal(): null {
  const openModal = useUIStore((state) => state.openModal);
  const selectedBlog = useUIStore((state) => state.selectedBlog);
  const closeModal = useUIStore((state) => state.closeModal);
  const approvePost = useApprovePost();

  useEffect(() => {
    if (openModal && selectedBlog) {
      showConfirm(
        "Approve Blog Post",
        `Approve "${selectedBlog.title}" by ${selectedBlog.authorName || "Unknown"}?`,
        {
          confirmText: "Approve",
          cancelText: "Cancel",
          confirmColor: "success",
          cancelColor: "ghost",
          onConfirm: async () => {
            try {
              await approvePost.mutateAsync(selectedBlog.id);
              closeModal();
              showSuccess("Post Approved", "The blog post has been approved successfully!");
            } catch (error) {
              showError("Failed to Approve", "There was an error approving the post. Please try again.");
            }
          },
          onCancel: () => {
            closeModal();
          },
        }
      );
    }
  }, [openModal, selectedBlog, approvePost, closeModal]);

  return null;
}








