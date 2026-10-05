# Troubleshooting

## "Missing or insufficient permissions"

- Verify your email address — most writes require a verified account.
- Make sure the latest `firestore.rules` / `storage.rules` are deployed
  (see `docs/EMAIL_AND_DEPLOYMENT.md`).
- Roles are read from `users/{uid}.role`. The first owner must be promoted to
  `super_admin` in the Firebase Console.

## Signed in but sent to "Verify your email"

Open the verification link, then press **I've verified my email** (or just
return to the tab — it re-checks automatically).

## Images fail to upload

Uploads require a verified `writer`, `admin` or `super_admin` account, an
image file, and a size under 5 MB (enforced by `storage.rules`).

## Subscribe form says subscriptions aren't set up

Email needs `GMAIL_USER`, `GMAIL_APP_PASSWORD` and `FIREBASE_SERVICE_ACCOUNT`
on the deployment. Locally, `pnpm dev:emulators` logs emails instead of
sending them.

## Routes 404 after a hard refresh

The host must serve `index.html` for unknown paths. `vercel.json` does this on
Vercel; configure the equivalent rewrite elsewhere.

## Comments don't load

The comments query needs the composite index in `firestore.indexes.json`;
deploy indexes with the Firebase CLI.

## The AI button is missing

It only appears when `VITE_HUGGINGFACE_API_KEY` is set.

## End-to-end tests

`pnpm test:e2e` needs Java 11+ (for the Firebase emulators) and a Chromium
browser for Playwright (`pnpm exec playwright install chromium`).
