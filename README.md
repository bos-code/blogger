# Blogger (React + Vite)

Role-aware blogging platform with Firebase Auth/Firestore, TipTap editor, AI assistance, and an admin dashboard.

## Features
- Email/password, Google, Apple, and magic-link auth with email verification enforcement.
- Role-based access (reader/user/writer/admin/super_admin) guarded by `ProtectedRoute`.
- Firestore-backed CMS: create/edit/draft/publish posts, admin approval workflow, optimistic like/unlike.
- TipTap editor with syntax highlighting, live preview, autosave, and AI helper (Hugging Face API).
- Admin dashboard: stats, user management, categories, notifications, and super-admin panel.
- Public blog listing/detail with reading progress and motion polish.

## Quick Start
```bash
pnpm install
pnpm dev
```
Visit http://localhost:5173

## Environment
Copy `.env.example` to `.env` and fill values:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_HUGGINGFACE_API_KEY=...   # optional, for AI assistant
```
See `FIREBASE_SETUP.md` for screenshots and troubleshooting.

## Scripts
- `pnpm dev` – run Vite dev server
- `pnpm build` – production build
- `pnpm preview` – preview build locally
- `pnpm lint` – ESLint

## Firebase Rules
Rules live in `firestore.rules`. Public users can read **approved** posts; all writes/other reads remain role-gated. Deploy via Firebase CLI after edits.

## Known Gaps / Next Up
- Image uploads use base64; add Firebase Storage for persistent media.
- Public blog depends on Firestore availability; ensure `.env` is set or add a cache layer.
- Add tests (React Query hooks, auth flows) and CI.

## Tech Stack
React 19, Vite 7, TypeScript, Tailwind v4 + DaisyUI/Heroui, TanStack Query, Zustand, TipTap, SweetAlert2, Framer Motion, Firebase.
