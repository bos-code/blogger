import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./_lib/firebaseAdmin.js";
import { errorResponse, json, readJson } from "./_lib/http.js";

/** Confirms a subscription from the emailed link. */
export async function POST(request: Request): Promise<Response> {
  const body = await readJson<{ token?: string }>(request);
  const token = body?.token ?? "";
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return errorResponse("This confirmation link is invalid.");

  const matches = await adminDb().collection("subscribers").where("token", "==", token).limit(1).get();
  if (matches.empty) return errorResponse("This confirmation link has expired or was already used.", 404);

  await matches.docs[0].ref.update({ status: "confirmed", confirmedAt: FieldValue.serverTimestamp() });
  return json({ ok: true });
}
