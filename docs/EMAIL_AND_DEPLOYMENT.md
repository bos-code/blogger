# Email and deployment (free tier)

The site runs on the free tiers of Firebase (Spark plan) and Vercel (Hobby).
Email is sent through your Gmail account with Nodemailer from Vercel
serverless functions — no paid plan and no custom domain required.

## 1. Deploy to Vercel

1. Import the GitHub repository in Vercel. The framework preset is **Vite**;
   the defaults (`pnpm build`, output `dist`) work as-is.
2. Add the `VITE_FIREBASE_*` variables from `.env.example`.
3. Add `SITE_URL` (for example `https://your-site.vercel.app`).
4. Deploy. `vercel.json` already provides the SPA fallback, `/rss.xml`,
   `/sitemap.xml`, `/robots.txt` and social-share previews.
5. Add the Vercel domain to Firebase → Authentication → Settings →
   Authorized domains.

Every pull request gets its own preview deployment automatically once the
repository is connected to Vercel.

## 2. Turn on email (optional)

Without these variables the site works normally; the subscribe form says
subscriptions aren't set up yet and alerts are skipped.

### Gmail app password

1. Turn on 2-Step Verification for your Google account.
2. Open <https://myaccount.google.com/apppasswords>, create an app password
   (name it "Blog"), and copy the 16 characters.
3. In Vercel add `GMAIL_USER` (your address) and `GMAIL_APP_PASSWORD`.
   Optionally set `ALERT_EMAIL` if alerts should go elsewhere.

### Firebase service account

1. Firebase Console → Project settings → Service accounts → **Generate new
   private key**. Keep this file private.
2. In Vercel, add the credentials in **one** of these ways:
   - **Three separate values** (easiest, works on a phone). Open the file and
     copy each value *between the quotes*:
     - `FIREBASE_CLIENT_EMAIL` ← `client_email`
       (ends in `.iam.gserviceaccount.com`)
     - `FIREBASE_PRIVATE_KEY` ← `private_key`, from `-----BEGIN PRIVATE KEY-----`
       to `-----END PRIVATE KEY-----` (the `\n` bits can stay as they are)
     - the project ID is taken from `VITE_FIREBASE_PROJECT_ID`, which you
       already have (or set `FIREBASE_PROJECT_ID`).
   - **Or the whole file** as `FIREBASE_SERVICE_ACCOUNT`.

Redeploy after adding variables.

### What gets sent

| Email | Trigger | To |
| --- | --- | --- |
| Confirm subscription | Someone subscribes on the blog | Subscriber |
| New post | An admin publishes (or approves) a post — once per post | Confirmed subscribers |
| New contact message | Contact form submission | `ALERT_EMAIL` |
| Review needed | A writer submits a post for review | `ALERT_EMAIL` |

Admins can resend a post from Dashboard → Subscribers. Scheduled posts are
emailed manually from there once they go live.

### Limits

Gmail allows roughly 500 messages a day from a personal account. That suits
a personal blog with a small list; for hundreds of subscribers or more, use a
newsletter service or your own domain with a transactional email provider.
Every newsletter email carries an unsubscribe link and one-click
`List-Unsubscribe` headers.

## 3. Firebase rules

**Automatic (recommended):** add two repository secrets in GitHub → Settings
→ Secrets and variables → Actions:

- `FIREBASE_PROJECT_ID` — your Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT` — the service account JSON (the same one used
  for Vercel works if it has the "Firebase Admin" role, or give it "Firebase
  Rules Admin" + "Cloud Datastore Index Admin")

The "Deploy Firebase rules" workflow then deploys whenever the rules change on
`main`; run it once by hand from the Actions tab for the first deploy.

**Manual:** deploy from your machine:

```bash
pnpm dlx firebase-tools@13.35.1 deploy --only firestore:rules,firestore:indexes,storage
```

## 4. Security

What's in place:

- **Firestore and Storage rules** are the security boundary. Roles can't be
  self-assigned, comments and contact messages have a fixed shape and size,
  view counters only accept `+1`, and subscribers and rate-limit records are
  readable only by the server. `pnpm test:rules` checks all of this against
  the emulator (it also runs in CI).
- **Post content is sanitised** before it's shown. Embedded iframes are only
  kept for YouTube, CodePen and CodeSandbox, and links that open a new tab
  get `rel="noopener noreferrer"`.
- **Security headers** (`vercel.json`): the site can't be framed by other
  sites (clickjacking), MIME sniffing is off, plugins are blocked, and
  camera, microphone and location access are disabled.
- **Testimonials are submitted through `/api/testimonial`** (no account
  needed): validated on the server, rate-limited to 3 per IP per hour, with a
  hidden spam trap. The contact details go to the admin-only
  `testimonialContacts` collection and are never shown publicly. If email is
  configured, you also get an email for each new testimonial.
- **Newsletter sign-ups are rate-limited** to 5 per IP address per 15
  minutes, on top of the per-address cooldown, so the form can't be used to
  flood someone's inbox. Counters live in the `rateLimits` collection under
  a hash of the IP (raw addresses are never stored).

After changing `firestore.rules`, deploy them again (GitHub Action or the
Firebase Console, as in section 3).

Recommended one-time settings in the Firebase Console:

- **TTL policy** for old rate-limit records: Firestore → TTL policies →
  collection group `rateLimits`, field `expiresAt`.
- **Authorised domains** (Authentication → Settings): keep only your real
  domains and `localhost`.
- **App Check** (optional, free with reCAPTCHA v3) makes it harder for
  scripts to write to Firestore directly, e.g. spamming the contact form.
  It needs a reCAPTCHA site key and a small change in `src/firebaseconfig.ts`.

## 5. Sharing and testimonial requests

- **Request a testimonial** (Dashboard → Testimonials, the chat icon on a project in Dashboard → Projects, or a project page while signed in as admin): pick the project, add the client's name and their WhatsApp number and/or email, and an optional note. The client gets a personal page (`/testimonial/<token>`) with their name, contact and project filled in. The link works once and needs no account. Send it by email from the site (with the project picture), by WhatsApp straight to their number, or through any app with the picture attached. Track it under Testimonials → Requests (Sent → Opened → Answered).
- **Send a post** (paper-plane icon in Dashboard → Posts, or on the post itself): the same options, with the post's cover image, summary and your note.
- **Link previews**: shared links to posts, projects and testimonial requests show a card with the image and title on WhatsApp, LinkedIn, X and others. Project cards use the 1200×630 images in `public/project-images/og/`.

Emailing from the site uses the Gmail settings from step 2. Without them, use WhatsApp or "Send from my email". Redeploy `firestore.rules` after updating (it adds `testimonialRequests`).
