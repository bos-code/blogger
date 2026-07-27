# Firebase Setup

This project uses Firebase Authentication, Cloud Firestore, and Cloud Storage.
The repository contains the rules and index definitions required by the CMS.

## 1. Create and register the project

1. Create or select a project in the
   [Firebase Console](https://console.firebase.google.com/).
2. Open Project settings → General → Your apps.
3. Register a web app and copy its configuration values.
4. Copy `.env.example` to `.env` and replace every placeholder:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
```

Do not commit `.env`. It is already ignored by Git.

## 2. Configure Authentication

Enable Email/Password in Authentication → Sign-in method. The application also
contains Google, Apple, and email-link flows; enable and configure only the
providers you intend to expose.

Add `localhost` and every deployed hostname in Authentication → Settings →
Authorized domains. Apple sign-in additionally requires the configuration
specified by Apple and Firebase for your bundle and return URLs.

CMS permissions require a verified Firebase Authentication email token. A
profile field named `emailVerified` does not replace Firebase's token claim.

## 3. Create Firestore and Storage

Create a Cloud Firestore database and a Cloud Storage bucket in regions suitable
for the application. Use the committed rules instead of leaving either service
in an open test mode.

The application uses these Firestore collections:

- `users`
- `posts`
- `comments`
- `categories`
- `notifications`
- `messages`

Post media is stored below `post-images/{uid}/`.

## 4. Deploy rules and indexes

Authenticate the Firebase CLI, select the project, and deploy the versioned
configuration:

```bash
pnpm dlx firebase-tools@13.35.1 login
pnpm dlx firebase-tools@13.35.1 use --add
pnpm dlx firebase-tools@13.35.1 deploy --only firestore:rules,firestore:indexes,storage
```

The command reads `firebase.json`, `firestore.rules`,
`firestore.indexes.json`, and `storage.rules`.

## 5. Bootstrap the first super administrator

Role escalation is intentionally blocked from normal client code.

1. Start the app and create the owner's account.
2. Verify the account's email address.
3. Copy the account UID from Authentication.
4. In Firestore, open `users/{uid}` and set `role` to `super_admin`.
5. Sign out and back in so the UI reloads the role.

Available roles are `reader`, `user`, `writer`, `admin`, and `super_admin`.

## 6. Verify the integration

```bash
pnpm dev
```

Check the following:

- A new account can sign up and receive a verification email.
- A verified writer can save a draft and submit it for review.
- A writer can upload an image smaller than 5 MB.
- An administrator can approve or reject a post.
- A guest can read approved posts but cannot read drafts.
- A user cannot promote their own role.

If Firestore reports `permission-denied`, confirm that the deployed rules match
the repository, the email is verified, and the `users/{uid}` role is correct.

## Security notes

- Firebase web configuration is public by design; security comes from Auth,
  Firestore rules, Storage rules, App Check, and provider restrictions.
- Never ship privileged server credentials or service-account JSON in a Vite
  environment variable.
- Enable Firebase App Check and billing alerts before a public production
  launch.
- Keep the committed rules and production rules synchronized.
