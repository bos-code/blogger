/**
 * Seeds the local Firebase emulators with demo users and content.
 *
 *   pnpm emulators          # in one terminal
 *   pnpm seed:emulators     # in another
 *
 * Accounts (password for all: "password123"):
 *   admin@example.com   super_admin
 *   writer@example.com  writer
 *   reader@example.com  user
 */
const PROJECT = process.env.FIREBASE_PROJECT ?? "demo-blogger";
const HOST = process.env.FIREBASE_EMULATOR_HOST ?? "127.0.0.1";
const AUTH = `http://${HOST}:9099`;
const FIRESTORE = `http://${HOST}:8080/v1/projects/${PROJECT}/databases/(default)/documents`;
const OWNER = { Authorization: "Bearer owner", "Content-Type": "application/json" };

const request = async (url, init) => {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${url} -> ${response.status} ${await response.text()}`);
  }
  return response.json();
};

/** Converts a plain JS value into Firestore REST "Value" JSON. */
const toValue = (value) => {
  if (value === null || value === undefined) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === "object") {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toValue(v)])) } };
  }
  return { stringValue: String(value) };
};

const setDocument = (path, data) =>
  request(`${FIRESTORE}/${path}`, {
    method: "PATCH",
    headers: OWNER,
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toValue(v)])) }),
  });

const createUser = async ({ email, name, role }) => {
  const created = await request(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123", displayName: name, returnSecureToken: true }),
  });
  await request(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:update`, {
    method: "POST",
    headers: OWNER,
    body: JSON.stringify({ localId: created.localId, emailVerified: true }),
  });
  await setDocument(`users/${created.localId}`, {
    uid: created.localId,
    email,
    name,
    photoURL: null,
    role,
    emailVerified: true,
    createdAt: new Date(),
  });
  return created.localId;
};

const daysAgo = (days) => new Date(Date.now() - days * 86400000);

const richContent = `
<p>React's <code>useEffect</code> is one of the most used — and most misused — hooks. This post walks through when you actually need it.</p>
<h2>Effects synchronise with the outside world</h2>
<p>An effect lets a component stay in sync with something React doesn't control: a subscription, a timer, the DOM.</p>
<div class="callout" data-variant="tip"><p>If you can calculate something during render, you don't need an effect.</p></div>
<pre><code class="language-javascript">useEffect(() =&gt; {
  const id = setInterval(tick, 1000);
  return () =&gt; clearInterval(id);
}, []);</code></pre>
<h2>Common mistakes</h2>
<h3>Deriving state</h3>
<p>Copying props into state with an effect causes an extra render and stale values.</p>
<ul><li><p>Compute derived values inline.</p></li><li><p>Use <code>useMemo</code> only when it's expensive.</p></li></ul>
<h3>Missing dependencies</h3>
<table><tbody><tr><th><p>Symptom</p></th><th><p>Cause</p></th></tr><tr><td><p>Stale value</p></td><td><p>Dependency left out of the array</p></td></tr><tr><td><p>Infinite loop</p></td><td><p>New object created every render</p></td></tr></tbody></table>
<blockquote><p>Effects are an escape hatch, not the main road.</p></blockquote>
<h2>Wrapping up</h2>
<p>Reach for an effect when you're talking to something outside React — and clean up after yourself.</p>`;

const simple = (topic) => `
<p>${topic} is a topic I keep coming back to. Here are a few notes from recent projects.</p>
<h2>What I learned</h2>
<p>Small, focused components are easier to test and easier to change later.</p>
<h2>Next steps</h2>
<p>I'll follow up with a deeper dive and some code examples.</p>`;

const main = async () => {
  console.log(`Seeding emulators for project "${PROJECT}"…`);
  const admin = await createUser({ email: "admin@example.com", name: "Chidera Okonkwo", role: "super_admin" });
  const writer = await createUser({ email: "writer@example.com", name: "Ada Writer", role: "writer" });
  const reader = await createUser({ email: "reader@example.com", name: "Riley Reader", role: "user" });

  for (const [id, name] of [["react", "React"], ["css", "CSS"], ["career", "Career"]]) {
    await setDocument(`categories/${id}`, { name, createdAt: new Date() });
  }

  const posts = [
    {
      id: "use-effect",
      title: "When do you actually need useEffect?",
      content: richContent,
      excerpt: "Effects are an escape hatch. Here's how to tell when you really need one.",
      category: "React",
      tags: ["react", "hooks"],
      authorId: admin,
      authorName: "Chidera",
      status: "approved",
      featured: true,
      views: 142,
      likedBy: [reader, writer],
      createdAt: daysAgo(2),
      series: "React foundations",
      seriesOrder: 2,
    },
    {
      id: "react-state",
      title: "Thinking in React state",
      content: simple("State management"),
      category: "React",
      tags: ["react", "state"],
      authorId: admin,
      authorName: "Chidera",
      status: "approved",
      views: 88,
      likedBy: [reader],
      createdAt: daysAgo(9),
      series: "React foundations",
      seriesOrder: 1,
    },
    {
      id: "modern-css",
      title: "Modern CSS layout with grid and container queries",
      content: simple("CSS layout"),
      category: "CSS",
      tags: ["css", "layout"],
      authorId: writer,
      authorName: "Ada",
      status: "approved",
      views: 61,
      likedBy: [],
      createdAt: daysAgo(15),
    },
    {
      id: "first-job",
      title: "What I wish I knew before my first developer job",
      content: simple("Starting a career"),
      category: "Career",
      tags: ["career"],
      authorId: admin,
      authorName: "Chidera",
      status: "approved",
      views: 203,
      likedBy: [writer],
      createdAt: daysAgo(30),
    },
    {
      id: "writer-pending",
      title: "Accessible forms in React",
      content: simple("Accessible forms"),
      category: "React",
      tags: ["a11y", "forms"],
      authorId: writer,
      authorName: "Ada",
      status: "pending",
      views: 0,
      likedBy: [],
      createdAt: daysAgo(1),
    },
    {
      id: "writer-draft",
      title: "Draft: notes on TypeScript generics",
      content: simple("TypeScript generics"),
      category: "",
      tags: [],
      authorId: writer,
      authorName: "Ada",
      status: "draft",
      views: 0,
      likedBy: [],
      createdAt: daysAgo(0),
    },
  ];
  for (const { id, likedBy, ...post } of posts) {
    await setDocument(`posts/${id}`, {
      ...post,
      likedBy,
      likes: likedBy.length,
      authorAvatar: null,
      updatedAt: post.createdAt,
    });
  }

  await setDocument("comments/c1", {
    postId: "use-effect",
    authorId: reader,
    authorName: "Riley Reader",
    authorAvatar: null,
    content: "This cleared up a lot for me — the table of symptoms is great.",
    parentId: null,
    createdAt: daysAgo(1),
  });
  await setDocument("comments/c2", {
    postId: "use-effect",
    authorId: admin,
    authorName: "Chidera",
    authorAvatar: null,
    content: "Glad it helped! A follow-up on useLayoutEffect is coming.",
    parentId: "c1",
    createdAt: daysAgo(0.5),
  });

  await setDocument("messages/m1", {
    name: "Jordan Client",
    email: "jordan@example.com",
    message: "Hi! I'd love to chat about a React dashboard project for my startup.",
    read: false,
    createdAt: daysAgo(0.2),
  });

  for (let day = 0; day < 30; day++) {
    const date = daysAgo(day).toISOString().slice(0, 10);
    const views = Math.round(20 + 15 * Math.sin(day / 3) + (30 - day));
    await setDocument(`dailyStats/${date}`, {
      date,
      views,
      posts: { "use-effect": Math.round(views * 0.5), "first-job": Math.round(views * 0.3), "react-state": Math.round(views * 0.2) },
    });
  }

  await setDocument("notifications/n1", {
    userId: "all",
    type: "new_post",
    message: 'New post: "When do you actually need useEffect?"',
    blogId: "use-effect",
    readBy: [],
    createdAt: daysAgo(2),
  });

  console.log("Done. Log in with admin@example.com / writer@example.com / reader@example.com (password123).");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
