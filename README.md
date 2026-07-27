# John Dera Portfolio + CMS

[![CI](https://github.com/bos-code/blogger/actions/workflows/ci.yml/badge.svg)](https://github.com/bos-code/blogger/actions/workflows/ci.yml)

A responsive software-engineering portfolio with a Firebase-backed publishing
system. The public site presents projects and articles, while verified writers
and administrators get a role-aware CMS for drafting, scheduling, reviewing,
and publishing rich-text posts.

## What is included

- Responsive portfolio homepage, project showcase, contact form, and public
  blog.
- Email/password, Google, Apple, and email-link authentication flows.
- Email-verification and role guards for protected routes and operations.
- TipTap editor with headings, links, images, YouTube embeds, code blocks,
  syntax highlighting, previews, local autosave, excerpts, tags, categories,
  cover images, and scheduled publishing.
- Firebase Storage uploads with image-only validation, a 5 MB limit, and
  per-author media paths.
- Draft, pending, approved, and rejected post states with administrator
  moderation.
- Dashboard analytics, user and role management, categories, profile settings,
  notifications, likes, comments, and view counts.
- Sanitized rich-text rendering with DOMPurify.
- Route-level lazy loading, optimized WebP assets, and stable vendor chunking.
- ESLint, strict TypeScript checks, Node tests, and GitHub Actions CI.

## Roles and permissions

| Role | Main permissions |
| --- | --- |
| Guest | View approved, currently published posts and submit the contact form |
| `reader` | Guest access plus verified-account features such as likes |
| `user` | Read, like, and comment on posts |
| `writer` | Create and edit owned drafts, submit posts, and upload post images |
| `admin` | Review all posts, publish or reject content, and manage standard users and categories |
| `super_admin` | All administrator permissions plus protected administrator-role management |

Authorization is enforced in both the UI and Firebase rules. UI guards are not
treated as a security boundary.

## Tech stack

- React 19, TypeScript, Vite 7, and React Router
- Tailwind CSS 4, DaisyUI, HeroUI, Framer Motion, GSAP, and Swiper
- TanStack Query and Zustand
- TipTap, Lowlight, and Highlight.js
- Firebase Authentication, Cloud Firestore, and Cloud Storage
- SweetAlert2 and DOMPurify
- pnpm 11 and Node.js 24

## Quick start

Prerequisites:

- Node.js 24
- pnpm 11.7.0 through Corepack
- A Firebase web project

```bash
git clone https://github.com/bos-code/blogger.git
cd blogger
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Open `http://localhost:5173`.

The portfolio shell can render without valid Firebase credentials, but
authentication, posts, comments, contact messages, and uploads require a
configured Firebase project.

## Environment variables

Fill the copied `.env` file with values from Firebase Console → Project
settings → Your apps.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firestore project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Cloud Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase web app ID |
| `VITE_HUGGINGFACE_API_KEY` | No | Enables the optional writing assistant |

Every `VITE_` value is embedded in browser code. Firebase web configuration is
designed for this and is protected by Firebase rules. A Hugging Face token is
different: use only a narrowly scoped development token here. For production,
proxy AI requests through a server-side function and keep the token there.

## Firebase setup

1. Create a Firebase project and register a web app.
2. Enable Email/Password authentication. Enable Google, Apple, or email-link
   sign-in only if those flows will be used, and configure their provider
   requirements.
3. Create Cloud Firestore and Cloud Storage.
4. Add local and production hosts to Authentication → Settings → Authorized
   domains.
5. Deploy the committed rules and index:

```bash
pnpm dlx firebase-tools@13.35.1 login
pnpm dlx firebase-tools@13.35.1 use --add
pnpm dlx firebase-tools@13.35.1 deploy --only firestore:rules,firestore:indexes,storage
```

6. Sign up the first owner, verify the email address, then set
   `users/{uid}.role` to `super_admin` directly in the Firebase Console. Client
   code cannot self-promote an account.

The deployed configuration is sourced from:

- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `firebase.json`

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for the longer Firebase checklist.

## Data model

| Collection or path | Purpose |
| --- | --- |
| `users/{uid}` | Profile and CMS role |
| `posts/{postId}` | Article content, state, schedule, likes, and views |
| `comments/{commentId}` | Post comments |
| `categories/{categoryId}` | Administrator-managed categories |
| `notifications/{notificationId}` | Account or global CMS notifications |
| `messages/{messageId}` | Portfolio contact submissions |
| `post-images/{uid}/{file}` | Publicly readable, author-owned post media in Storage |

Approved posts are publicly readable. Private post states are restricted to
their author and administrators. Scheduled posts stay hidden in the public UI
until their publish time. Rich HTML is sanitized before preview and display.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Create the production bundle in `dist/` |
| `pnpm preview` | Preview the production bundle locally |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run strict TypeScript checks |
| `pnpm test` | Run the Node test suite |
| `pnpm check` | Run lint, type-checking, tests, and build |

Run `pnpm check` before pushing. The same command runs in
`.github/workflows/ci.yml` for every push and pull request.

## Project structure

```text
src/
├── components/       Shared portfolio, editor, and feedback UI
├── dashboardUi/      Writer and administrator CMS screens
├── hooks/            TanStack Query data and mutation hooks
├── pages/            Route-level pages
├── services/         AI and Firebase Storage services
├── stores/           Authentication and UI state
├── types/            Shared TypeScript contracts
└── utils/            Date, role, alert, query, and sanitization helpers
tests/                Node utility tests
firestore.rules       Firestore authorization and validation
storage.rules         Storage authorization and upload constraints
```

## Production deployment

1. Run `pnpm check`.
2. Configure the same environment variables in the hosting platform.
3. Build with `pnpm build` and publish `dist/`.
4. Configure an SPA fallback from unknown paths to `index.html` so routes such
   as `/blog/:id` and `/admin` work on a hard refresh.
5. Add the production domain to Firebase Authentication authorized domains.
6. Deploy Firebase rules whenever their committed versions change.

This repository does not currently declare an open-source license.
