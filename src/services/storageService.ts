import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseconfig";

/**
 * Upload an image to Firebase Storage and return its public URL.
 * Caller must ensure Firebase is configured and user has permission.
 */
export async function uploadImageToStorage(
  file: File,
  opts: { userId?: string; folder?: string } = {}
): Promise<string> {
  if (!storage) {
    throw new Error(
      "Firebase Storage is not configured. Add VITE_FIREBASE_* env vars."
    );
  }

  const folder = opts.folder || "uploads";
  const path = `${folder}/${opts.userId || "anon"}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}
