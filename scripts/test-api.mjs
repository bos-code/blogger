/**
 * Exercises the serverless API handlers against the Firebase emulators with
 * emails captured instead of sent. Requires running emulators + seed data:
 *   pnpm emulators & pnpm seed:emulators && node scripts/test-api.mjs
 */
import { build } from "esbuild";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.FIREBASE_PROJECT_ID ??= "demo-blogger";
process.env.EMAIL_TRANSPORT = "json";
process.env.GMAIL_USER = "owner@example.com";
process.env.SITE_URL = "https://example.test";

// Inside the repo so bundled handlers resolve node_modules.
const outdir = join(process.cwd(), "node_modules/.cache/api-test");
mkdirSync(outdir, { recursive: true });
const handlers = ["rss", "sitemap", "share", "robots", "subscribe", "subscribe-confirm", "unsubscribe", "notify-subscribers", "contact-alert"];
await build({
  entryPoints: handlers.map((name) => `api/${name}.ts`),
  outdir,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  logLevel: "warning",
});
const load = (name) => import(pathToFileURL(join(outdir, `${name}.js`)).href);
const post = (path, body, headers = {}) =>
  new Request(`https://example.test/api/${path}`, { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...headers } });

const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(`ok   ${name}`);
  } catch (error) {
    results.push(`FAIL ${name}: ${error.message}`);
    process.exitCode = 1;
  }
};

await check("rss lists approved posts only", async () => {
  const response = await (await load("rss")).GET(new Request("https://example.test/rss.xml"));
  const xml = await response.text();
  assert.match(xml, /When do you actually need useEffect\?/);
  assert.doesNotMatch(xml, /Accessible forms in React/);
  assert.match(xml, /https:\/\/example\.test\/blog\/use-effect\/when-do-you-actually-need-useeffect/);
});

await check("sitemap includes posts", async () => {
  const xml = await (await (await load("sitemap")).GET(new Request("https://example.test/sitemap.xml"))).text();
  assert.match(xml, /<loc>https:\/\/example\.test\/blog\/modern-css\//);
  assert.doesNotMatch(xml, /writer-draft/);
});

await check("share page has Open Graph tags", async () => {
  const html = await (await (await load("share")).GET(new Request("https://example.test/api/share?id=use-effect"))).text();
  assert.match(html, /og:title" content="When do you actually need useEffect\?"/);
  const draft = await (await load("share")).GET(new Request("https://example.test/api/share?id=writer-draft"));
  assert.equal(draft.status, 302);
});

await check("robots points to sitemap", async () => {
  const text = await (await (await load("robots")).GET(new Request("https://example.test/robots.txt"))).text();
  assert.match(text, /Sitemap: https:\/\/example\.test\/sitemap\.xml/);
});

let token = "";
await check("subscribe → confirm → unsubscribe", async () => {
  const { POST: subscribe } = await load("subscribe");
  const bad = await subscribe(post("subscribe", { email: "nope" }));
  assert.equal(bad.status, 400);
  const email = `sub${Date.now()}@example.com`;
  const response = await subscribe(post("subscribe", { email }));
  assert.equal(response.status, 200, await response.clone().text());

  const { getFirestore } = await import("firebase-admin/firestore");
  const { getApps } = await import("firebase-admin/app");
  const db = getFirestore(getApps()[0]);
  const snapshot = await db.collection("subscribers").where("email", "==", email).get();
  assert.equal(snapshot.size, 1);
  assert.equal(snapshot.docs[0].get("status"), "pending");
  token = snapshot.docs[0].get("token");

  const confirm = await (await load("subscribe-confirm")).POST(post("subscribe-confirm", { token }));
  assert.equal(confirm.status, 200);
  assert.equal((await snapshot.docs[0].ref.get()).get("status"), "confirmed");

  const again = await subscribe(post("subscribe", { email }));
  assert.equal(again.status, 200);

  const unsubscribe = await (await load("unsubscribe")).POST(post("unsubscribe", { token }));
  assert.equal(unsubscribe.status, 200);
  assert.equal((await snapshot.docs[0].ref.get()).exists, false);
});

await check("notify-subscribers rejects non-admins", async () => {
  const response = await (await load("notify-subscribers")).POST(post("notify-subscribers", { postId: "use-effect" }));
  assert.equal(response.status, 403);
});

await check("notify-subscribers sends for admins", async () => {
  const signIn = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "password123", returnSecureToken: true }),
  }).then((r) => r.json());
  const { POST: subscribe } = await load("subscribe");
  const email = `reader${Date.now()}@example.com`;
  await subscribe(post("subscribe", { email }));
  const { getFirestore } = await import("firebase-admin/firestore");
  const { getApps } = await import("firebase-admin/app");
  const db = getFirestore(getApps()[0]);
  const sub = (await db.collection("subscribers").where("email", "==", email).get()).docs[0];
  await (await load("subscribe-confirm")).POST(post("subscribe-confirm", { token: sub.get("token") }));

  const response = await (await load("notify-subscribers")).POST(
    post("notify-subscribers", { postId: "first-job", force: true }, { Authorization: `Bearer ${signIn.idToken}` })
  );
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  assert.ok(body.sent >= 1, JSON.stringify(body));
});

await check("contact-alert only fires once for fresh messages", async () => {
  const { getFirestore, FieldValue } = await import("firebase-admin/firestore");
  const { getApps } = await import("firebase-admin/app");
  const db = getFirestore(getApps()[0]);
  const ref = await db.collection("messages").add({ name: "API Test", email: "t@example.com", message: "Hello from the API test", read: false, createdAt: FieldValue.serverTimestamp() });
  const { POST } = await load("contact-alert");
  const first = await (await POST(post("contact-alert", { messageId: ref.id }))).json();
  assert.equal(first.ok, true);
  assert.equal(first.skipped, undefined);
  const second = await (await POST(post("contact-alert", { messageId: ref.id }))).json();
  assert.equal(second.skipped, true);
  const old = await (await POST(post("contact-alert", { messageId: "m1" }))).json();
  assert.equal(old.skipped, true);
});

console.log(results.join("\n"));
process.exit(process.exitCode ?? 0);
