import { adminDb } from "./_lib/firebaseAdmin.js";
import { errorResponse, json, readJson } from "./_lib/http.js";

const removeByToken = async (token: string): Promise<boolean> => {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return false;
  const matches = await adminDb().collection("subscribers").where("token", "==", token).limit(1).get();
  if (matches.empty) return true; // Already unsubscribed.
  await matches.docs[0].ref.delete();
  return true;
};

/** Unsubscribe from the page linked in every email. */
export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const body = await readJson<{ token?: string }>(request).catch(() => null);
  // One-click unsubscribe (RFC 8058) posts form data with the token in the URL.
  const token = body?.token ?? url.searchParams.get("token") ?? "";
  if (!(await removeByToken(token))) return errorResponse("This unsubscribe link is invalid.");
  return json({ ok: true });
}
