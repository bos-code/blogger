/**
 * Reads publicly readable Firestore data over REST (no credentials), so
 * RSS, the sitemap and share previews work without the service account.
 */
const projectId = () => process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "";

const baseUrl = () => {
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  const root = emulator ? `http://${emulator}` : "https://firestore.googleapis.com";
  return `${root}/v1/projects/${projectId()}/databases/(default)/documents`;
};

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: null;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

const fromValue = (value: FirestoreValue): unknown => {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue?.values ?? []).map(fromValue);
  if ("mapValue" in value) {
    return Object.fromEntries(Object.entries(value.mapValue?.fields ?? {}).map(([k, v]) => [k, fromValue(v)]));
  }
  return null;
};

export interface PublicPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  category?: string | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  scheduledFor?: string | null;
}

export const fetchApprovedPosts = async (): Promise<PublicPost[]> => {
  if (!projectId()) return [];
  const response = await fetch(`${baseUrl()}:runQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "posts" }],
        where: { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "approved" } } },
        limit: 500,
      },
    }),
  });
  if (!response.ok) throw new Error(`Firestore query failed: ${response.status}`);
  const rows = (await response.json()) as Array<{ document?: { name: string; fields: Record<string, FirestoreValue> } }>;
  const now = Date.now();
  return rows
    .filter((row) => row.document)
    .map((row) => {
      const doc = row.document!;
      const data = Object.fromEntries(Object.entries(doc.fields).map(([k, v]) => [k, fromValue(v)]));
      return { id: doc.name.split("/").pop()!, ...data } as PublicPost;
    })
    .filter((post) => !post.scheduledFor || new Date(post.scheduledFor).getTime() <= now)
    .sort((a, b) => new Date(b.scheduledFor ?? b.createdAt ?? 0).getTime() - new Date(a.scheduledFor ?? a.createdAt ?? 0).getTime());
};

export const fetchPublicPost = async (id: string): Promise<PublicPost | null> => {
  if (!projectId() || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  const response = await fetch(`${baseUrl()}/posts/${id}`);
  if (!response.ok) return null;
  const doc = (await response.json()) as { name: string; fields: Record<string, FirestoreValue> };
  const data = Object.fromEntries(Object.entries(doc.fields).map(([k, v]) => [k, fromValue(v)])) as unknown as PublicPost & { status?: string };
  if (data.status !== "approved") return null;
  return { ...data, id };
};

export const fetchProjectSlugs = async (): Promise<string[]> => {
  if (!projectId()) return [];
  const response = await fetch(`${baseUrl()}/projects?pageSize=100`);
  if (!response.ok) return [];
  const data = (await response.json()) as { documents?: Array<{ fields: Record<string, FirestoreValue> }> };
  return (data.documents ?? [])
    .filter((doc) => fromValue(doc.fields.description ?? { stringValue: "" }))
    .map((doc) => String(fromValue(doc.fields.slug ?? { stringValue: "" })))
    .filter(Boolean);
};

export const toPlainText = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export const describePost = (post: PublicPost, max = 200): string => {
  const text = post.seoDescription || post.excerpt || toPlainText(post.content ?? "");
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};
