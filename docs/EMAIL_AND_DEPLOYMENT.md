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
   private key**.
2. Paste the whole JSON file as a single-line value of
   `FIREBASE_SERVICE_ACCOUNT` in Vercel. Keep this file private.

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

Deploy the committed rules whenever they change:

```bash
pnpm dlx firebase-tools@13.35.1 deploy --only firestore:rules,firestore:indexes,storage
```
