import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { storage } from "../firebaseconfig";

/**
 * Upload an image to Firebase Storage and return its public URL.
 * Caller must ensure Firebase is configured and user has permission.
 */
export async function uploadImageToStorage(
  file: File,
  opts: { userId?: string; folder?: string } = {}
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Images must be smaller than 5 MB.");
  }

  const userId = opts.userId;
  if (!userId) {
    throw new Error("You must be signed in to upload an image.");
  }

  const folder = opts.folder || "post-images";
  if (folder !== "post-images") {
    throw new Error("Unsupported upload folder.");
  }

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const uniqueId =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const path = `${folder}/${userId}/${uniqueId}-${safeName || "image"}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

export interface StoredImage {
  url: string;
  name: string;
  fullPath: string;
}

/** Lists the images a user has uploaded (newest first). */
export async function listUserImages(userId: string): Promise<StoredImage[]> {
  const result = await listAll(ref(storage, `post-images/${userId}`));
  const items = await Promise.all(
    result.items.map(async (item) => ({
      url: await getDownloadURL(item),
      name: item.name.replace(/^[0-9a-f-]{36}-/, ""),
      fullPath: item.fullPath,
    }))
  );
  return items.reverse();
}

export async function deleteStoredImage(fullPath: string): Promise<void> {
  await deleteObject(ref(storage, fullPath));
}
