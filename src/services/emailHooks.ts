import { auth } from "../firebaseconfig";
import { apiRequest } from "./api";

const withToken = async (): Promise<string | undefined> => auth.currentUser?.getIdToken();

/**
 * Fire-and-forget email side effects for post status changes. Emails are a
 * bonus: failures (or deployments without email configured) never block the
 * action that triggered them.
 */
export const triggerPostEmails = async ({
  postId,
  status,
  isAdmin,
  scheduledFor,
}: {
  postId: string;
  status: string | undefined;
  isAdmin: boolean;
  scheduledFor?: Date | null;
}): Promise<void> => {
  try {
    const token = await withToken();
    if (!token) return;
    if (status === "pending" && !isAdmin) {
      await apiRequest("review-alert", { body: { postId }, token });
    }
    const isLive = !scheduledFor || scheduledFor.getTime() <= Date.now();
    if (status === "approved" && isAdmin && isLive) {
      await apiRequest("notify-subscribers", { body: { postId }, token });
    }
  } catch {
    // Email is best-effort.
  }
};
