/**
 * Firestore security rules tests. Needs the Firestore emulator on 127.0.0.1:8080:
 *   pnpm emulators   # then, in another terminal
 *   pnpm test:rules
 */
import { after, before, beforeEach, describe, test } from "node:test";
import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteDoc, deleteField, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

let env: RulesTestEnvironment;
const OWNER_EMAIL = "chidera9713@gmail.com";

// Verified email, as the app requires for most writes.
const as = (uid: string, email = `${uid}@example.com`, verified = true) =>
  env.authenticatedContext(uid, { email, email_verified: verified }).firestore();
const anon = () => env.unauthenticatedContext().firestore();

const seed = (path: string, data: Record<string, unknown>) =>
  env.withSecurityRulesDisabled((context) => setDoc(doc(context.firestore(), path), data));

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-rules-test",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await seed("users/alice", { role: "user", name: "Alice" });
  await seed("users/reggie", { role: "reader", name: "Reggie" });
  await seed("users/wendy", { role: "writer", name: "Wendy" });
  await seed("users/adam", { role: "admin", name: "Adam" });
  await seed("posts/p1", { title: "Hello", content: "<p>Hi</p>", authorId: "wendy", authorName: "Wendy", status: "approved", views: 3, likes: 0, likedBy: [] });
});

describe("users and roles", () => {
  test("new accounts can only start as plain users", async () => {
    await assertSucceeds(setDoc(doc(as("bob"), "users/bob"), { role: "user", name: "Bob" }));
    await assertFails(setDoc(doc(as("carl"), "users/carl"), { role: "admin", name: "Carl" }));
    await assertFails(setDoc(doc(as("dan"), "users/someone-else"), { role: "user" }));
  });

  test("users can't promote themselves", async () => {
    await assertFails(updateDoc(doc(as("alice"), "users/alice"), { role: "admin" }));
    await assertFails(updateDoc(doc(as("alice"), "users/alice"), { role: "super_admin" }));
    await assertSucceeds(updateDoc(doc(as("alice"), "users/alice"), { nickname: "Ali" }));
  });

  test("only the verified site owner becomes super admin", async () => {
    await seed("users/owner", { role: "user" });
    await assertFails(updateDoc(doc(as("owner", OWNER_EMAIL, false), "users/owner"), { role: "super_admin" }));
    await assertSucceeds(updateDoc(doc(as("owner", OWNER_EMAIL), "users/owner"), { role: "super_admin" }));
    await seed("users/impostor", { role: "user" });
    await assertFails(updateDoc(doc(as("impostor", "someone@example.com"), "users/impostor"), { role: "super_admin" }));
  });

  test("admins can't create other admins", async () => {
    await assertFails(updateDoc(doc(as("adam"), "users/alice"), { role: "admin" }));
    await assertSucceeds(updateDoc(doc(as("adam"), "users/alice"), { role: "writer" }));
  });

  test("profiles are private", async () => {
    await assertFails(getDoc(doc(as("alice"), "users/wendy")));
    await assertFails(getDoc(doc(anon(), "users/alice")));
    await assertSucceeds(getDoc(doc(as("adam"), "users/alice")));
  });
});

describe("posts", () => {
  test("anyone can add exactly one view, and nothing else", async () => {
    await assertSucceeds(updateDoc(doc(anon(), "posts/p1"), { views: increment(1) }));
    await assertFails(updateDoc(doc(anon(), "posts/p1"), { views: increment(2) }));
    await assertFails(updateDoc(doc(anon(), "posts/p1"), { views: increment(1), updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(anon(), "posts/p1"), { title: "Defaced" }));
  });

  test("users can't edit someone else's post", async () => {
    await assertFails(updateDoc(doc(as("alice"), "posts/p1"), { content: "<p>hacked</p>" }));
  });
});

describe("comments", () => {
  const comment = (extra: Record<string, unknown> = {}) => ({
    postId: "p1",
    authorId: "alice",
    authorName: "Alice",
    authorAvatar: null,
    content: "Nice post",
    parentId: null,
    createdAt: serverTimestamp(),
    ...extra,
  });

  test("verified users can comment as themselves", async () => {
    await assertSucceeds(setDoc(doc(as("alice"), "comments/c1"), comment()));
  });

  test("rejects readers, impersonation, extra fields and long content", async () => {
    await assertFails(setDoc(doc(as("reggie"), "comments/c2"), comment({ authorId: "reggie" })));
    await assertFails(setDoc(doc(as("alice", "alice@example.com", false), "comments/c3"), comment()));
    await assertFails(setDoc(doc(as("alice"), "comments/c4"), comment({ authorId: "wendy" })));
    await assertFails(setDoc(doc(as("alice"), "comments/c5"), comment({ pinned: true })));
    await assertFails(setDoc(doc(as("alice"), "comments/c6"), comment({ content: "x".repeat(501) })));
    await assertFails(setDoc(doc(as("alice"), "comments/c7"), comment({ createdAt: new Date(2000, 0, 1) })));
  });
});

describe("analytics", () => {
  test("daily stats only accept a single +1", async () => {
    const day = "2026-10-11";
    await assertSucceeds(setDoc(doc(anon(), `dailyStats/${day}`), { date: day, views: increment(1), posts: { p1: increment(1) } }, { merge: true }));
    await assertFails(setDoc(doc(anon(), `dailyStats/${day}`), { date: day, views: increment(5) }, { merge: true }));
    await assertFails(
      setDoc(doc(anon(), `dailyStats/${day}`), { date: day, views: increment(1), posts: { p2: increment(1), p3: increment(1) } }, { merge: true })
    );
    await assertFails(updateDoc(doc(anon(), `dailyStats/${day}`), { views: increment(1), "posts.p1": deleteField() }));
    await assertFails(getDoc(doc(anon(), `dailyStats/${day}`)));
  });
});

describe("projects", () => {
  const project = (extra: Record<string, unknown> = {}) => ({
    title: "Yakoyo", slug: "yakoyo", summary: "Ordering platform", imageUrl: "/project-images/yakoyo-kitchen.webp",
    tech: ["Next.js"], order: 1, createdAt: serverTimestamp(), ...extra,
  });

  test("anyone can read; only admins write well-formed projects", async () => {
    await assertSucceeds(setDoc(doc(as("adam"), "projects/x1"), project()));
    await assertSucceeds(getDoc(doc(anon(), "projects/x1")));
    await assertFails(setDoc(doc(as("wendy"), "projects/x2"), project()));
    await assertFails(setDoc(doc(as("adam"), "projects/x3"), project({ html: "<script>" })));
    await assertFails(setDoc(doc(as("adam"), "projects/x4"), project({ summary: "" })));
    await assertFails(setDoc(doc(as("adam"), "projects/x5"), project({ tech: Array.from({ length: 21 }, (_, i) => `t${i}`) })));
    await assertFails(setDoc(doc(anon(), "projects/x6"), project()));
    await assertSucceeds(deleteDoc(doc(as("adam"), "projects/x1")));
  });
});

describe("testimonials", () => {
  const testimonial = (extra: Record<string, unknown> = {}) => ({
    authorId: "alice", authorName: "Alice", authorAvatar: null, authorTitle: "Founder, Acme",
    projectSlug: "yakoyo-kitchen", rating: 5, content: "Delivered on time and the site converts well.",
    status: "pending", createdAt: serverTimestamp(), ...extra,
  });

  test("verified users submit as pending; nobody can self-approve", async () => {
    await assertSucceeds(setDoc(doc(as("alice"), "testimonials/t1"), testimonial()));
    await assertFails(setDoc(doc(as("alice"), "testimonials/t2"), testimonial({ status: "approved" })));
    await assertFails(setDoc(doc(as("alice"), "testimonials/t3"), testimonial({ authorId: "wendy" })));
    await assertFails(setDoc(doc(as("alice", "alice@example.com", false), "testimonials/t4"), testimonial()));
    await assertFails(setDoc(doc(anon(), "testimonials/t5"), testimonial()));
    await assertFails(setDoc(doc(as("alice"), "testimonials/t6"), testimonial({ content: "Too short" })));
    await assertFails(setDoc(doc(as("alice"), "testimonials/t7"), testimonial({ rating: 6 })));
    await assertFails(setDoc(doc(as("alice"), "testimonials/t8"), testimonial({ featured: true })));
    await assertFails(updateDoc(doc(as("alice"), "testimonials/t1"), { status: "approved" }));
  });

  test("only approved ones are public; admins moderate", async () => {
    await seed("testimonials/p1", { ...testimonial(), createdAt: new Date() });
    await assertFails(getDoc(doc(anon(), "testimonials/p1")));
    await assertFails(getDoc(doc(as("wendy"), "testimonials/p1")));
    await assertSucceeds(getDoc(doc(as("alice"), "testimonials/p1")));
    await assertFails(updateDoc(doc(as("wendy"), "testimonials/p1"), { status: "approved" }));
    await assertFails(updateDoc(doc(as("adam"), "testimonials/p1"), { content: "Edited by admin" }));
    await assertSucceeds(updateDoc(doc(as("adam"), "testimonials/p1"), { status: "approved", reviewedAt: serverTimestamp() }));
    await assertSucceeds(getDoc(doc(anon(), "testimonials/p1")));
  });

  test("submitters can alert admins, but only about a testimonial", async () => {
    const note = (type: string) => ({ userId: "admins", type, message: "x", link: "/admin", read: false, readBy: [], createdAt: serverTimestamp() });
    await assertSucceeds(setDoc(doc(as("alice"), "notifications/n1"), note("pending_testimonial")));
    await assertFails(setDoc(doc(as("alice"), "notifications/n2"), note("pending_post")));
    await assertFails(setDoc(doc(anon(), "notifications/n3"), note("pending_testimonial")));
  });
});

describe("server-only and private data", () => {
  test("subscribers and rate limits are closed to clients", async () => {
    await seed("subscribers/s1", { email: "x@example.com", token: "secret" });
    await seed("rateLimits/r1", { count: 1 });
    await assertFails(getDoc(doc(anon(), "subscribers/s1")));
    await assertFails(getDoc(doc(as("alice"), "subscribers/s1")));
    await assertFails(setDoc(doc(anon(), "subscribers/s2"), { email: "y@example.com" }));
    await assertFails(getDoc(doc(as("adam"), "rateLimits/r1")));
    await assertFails(setDoc(doc(anon(), "rateLimits/r2"), { count: 0 }));
  });

  test("contact messages: anyone can send, only admins can read", async () => {
    const message = { name: "Jordan", email: "jordan@example.com", message: "Hello there, let's work together.", createdAt: serverTimestamp(), read: false };
    await assertSucceeds(setDoc(doc(anon(), "messages/m1"), message));
    await assertFails(setDoc(doc(anon(), "messages/m2"), { ...message, priority: "urgent" }));
    await assertFails(getDoc(doc(anon(), "messages/m1")));
    await assertSucceeds(getDoc(doc(as("adam"), "messages/m1")));
  });
});
