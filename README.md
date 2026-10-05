# John Dera — Portfolio, Blog & CMS

[![CI](https://github.com/bos-code/blogger/actions/workflows/ci.yml/badge.svg)](https://github.com/bos-code/blogger/actions/workflows/ci.yml)

A responsive developer portfolio with a full publishing system. Visitors browse
projects and articles; writers draft in a Notion-style editor; administrators
review, publish and run the site from a dashboard. It runs entirely on free
tiers: Firebase (Spark) and Vercel (Hobby).

## Features

**Portfolio** — hero, about, skills, experience timeline, project grid with
case-study pages (editable from the CMS), contact form, downloadable CV,
light/dark themes.

**Blog** — search, category/tag filters, featured post, series, related posts,
table of contents, syntax-highlighted code with copy buttons, likes, bookmarks,
threaded comments, author pages, RSS, sitemap, social-share previews.

**Editor** — TipTap with a `/` block menu, floating format menus, tables,
callouts, task lists, image upload (paste/drag/drop) with captions and alt text,
a media library, YouTube/CodePen/CodeSandbox embeds, cover images, SEO fields,
scheduling, autosave to Firestore with a local backup, version history,
conflict detection, live preview (desktop/mobile), focus mode, shareable draft
preview links, and optional AI title/excerpt suggestions.

**Dashboard** — overview with a 30-day views chart and review queue; posts
with bulk actions, featuring and reject-with-reason; users and roles;
categories; projects; contact-message inbox; newsletter subscribers; saved
posts; profile and appearance settings; in-app notifications.

**Email (optional)** — double opt-in newsletter, new-post emails, and owner
alerts for contact messages and posts awaiting review, sent with Nodemailer
through Gmail. See [docs/EMAIL_AND_DEPLOYMENT.md](docs/EMAIL_AND_DEPLOYMENT.md).

## Roles

| Role | Can |
| --- | --- |
| Guest | Read published posts, subscribe, use the contact form |
| `reader` | Like and save posts |
| `user` | …and comment |
| `writer` | …and write posts, submit them for review, upload images |
| `admin` | …and review/publish any post, manage users, categories, projects, messages, subscribers |
| `super_admin` | …and manage administrators |

Permissions are enforced by `firestore.rules` and `storage.rules`; the UI
mirrors them but is not the security boundary.

## Tech stack

React 19, TypeScript, Vite 7, React Router 7, Tailwind CSS 4 + DaisyUI 5,
TanStack Query, Zustand, TipTap 3, Framer Motion, Firebase (Auth, Firestore,
Storage), Vercel functions (Nodemailer, Firebase Admin), Playwright.

## Getting started

Requirements: Node.js 24, pnpm 11.7 (via Corepack), Java 11+ for the emulators.

```bash
corepack enable
pnpm install --frozen-lockfile
```

### Option A — local emulators (no Firebase project needed)

```bash
pnpm emulators          # terminal 1: Auth, Firestore and Storage emulators
pnpm seed:emulators     # terminal 2: demo users, posts, comments, analytics
pnpm dev:emulators      # terminal 2: http://localhost:5173
```

Demo accounts (password `password123`): `admin@example.com` (super admin),
`writer@example.com` (writer), `reader@example.com` (user). The `/api`
functions run inside the dev server; emails are printed instead of sent.

### Option B — your Firebase project

```bash
cp .env.example .env    # fill in the VITE_FIREBASE_* values
pnpm dev
```

Then follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md): enable sign-in methods,
deploy the rules and indexes, and promote your first account to
`super_admin` in the Firebase Console.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server (serves `/api` locally too) |
| `pnpm dev:emulators` | Dev server wired to the local emulators |
| `pnpm build` / `pnpm preview` | Production build / preview |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript (app, API, tests, config) |
| `pnpm test` | Unit tests (Node test runner) |
| `pnpm test:api` | API checks against running emulators |
| `pnpm test:e2e` | Emulators + seed + API checks + Playwright (desktop & mobile) |
| `pnpm check` | Lint, typecheck, unit tests and build (runs in CI) |

## Project structure

```text
api/                 Vercel functions: RSS, sitemap, robots, share previews,
                     draft previews, newsletter and email alerts
src/
├── components/      Site UI (article/, auth/, ui/ primitives)
├── dashboardUi/     Dashboard screens and the post editor page
├── editor/          TipTap extensions, menus, dialogs, settings, versions
├── hooks/           Data hooks (TanStack Query + Firestore)
├── pages/           Route-level pages
├── services/        Storage uploads, API client, AI, email triggers
├── stores/          Auth, theme, UI and notification state
├── data/            Site details, projects, experience
└── utils/           Pure helpers (dates, posts, auth errors, analytics…)
e2e/                 Playwright end-to-end tests
scripts/             Emulator seed data and API test runner
tests/               Unit tests
firestore.rules      Firestore authorization and validation
storage.rules        Storage authorization and upload limits
vercel.json          SPA fallback, feeds and share-preview routing
```

## Deployment

See [docs/EMAIL_AND_DEPLOYMENT.md](docs/EMAIL_AND_DEPLOYMENT.md) for Vercel,
environment variables, Gmail setup and rules deployment, and
[TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues.

This repository does not currently declare an open-source license.
