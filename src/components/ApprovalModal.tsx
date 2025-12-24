import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useUIStore } from "../stores/uiStore";
import { useApprovePost } from "../hooks/usePosts";

export default function ApprovalModal(): JSX.Element {
  const openModal = useUIStore((state) => state.openModal);
  const selectedBlog = useUIStore((state) => state.selectedBlog);
  const closeModal = useUIStore((state) => state.closeModal);
  const approvePost = useApprovePost();

  const handleApprove = async (): Promise<void> => {
    if (selectedBlog) {
      await approvePost.mutateAsync(selectedBlog.id);
      closeModal();
    }
  };

  return (
    <Modal isOpen={openModal} onOpenChange={closeModal}>
      <ModalContent>
        <ModalHeader>Approve Blog Post</ModalHeader>
        <ModalBody>
          <p>
            Approve <strong>{selectedBlog?.title}</strong> by{" "}
            <span className="text-accent">
              {selectedBlog?.authorName || "Unknown"}
            </span>
            ?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" color="danger" onPress={closeModal}>
            Cancel
          </Button>
          <Button
            color="success"
            onPress={handleApprove}
            isLoading={approvePost.isPending}
          >
            Approve
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}



