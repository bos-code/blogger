import { timingSafeEqual } from "node:crypto";
import { adminDb } from "./_lib/firebaseAdmin.js";
import { errorResponse, json } from "./_lib/http.js";

const sameToken = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

/** Returns an unpublished post for someone holding its secret preview link. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id) || !/^[A-Za-z0-9_-]{20,64}$/.test(token)) {
    return errorResponse("This preview link is invalid.", 404);
  }

  const snapshot = await adminDb().collection("posts").doc(id).get();
  const stored = snapshot.get("previewToken");
  if (!snapshot.exists || typeof stored !== "string" || !sameToken(stored, token)) {
    return errorResponse("This preview link is invalid or was revoked.", 404);
  }

  const data = snapshot.data() ?? {};
  return json({
    id,
    title: data.title ?? "",
    content: data.content ?? "",
    excerpt: data.excerpt ?? null,
    coverImage: data.coverImage ?? null,
    coverImageAlt: data.coverImageAlt ?? null,
    category: data.category ?? null,
    tags: data.tags ?? [],
    authorName: data.authorName ?? null,
    authorAvatar: data.authorAvatar ?? null,
    status: data.status ?? "draft",
  });
}
