import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { site } from "../data/site";

const UPDATED = "October 2026";

function Privacy() {
  return (
    <>
      <p>
        This site is the personal portfolio and blog of {site.fullName}. This page explains what
        information is collected when you use it and how it is used.
      </p>
      <h2>What is collected</h2>
      <ul>
        <li>
          <strong>Contact form:</strong> your name, email address and message, so I can reply.
        </li>
        <li>
          <strong>Accounts:</strong> if you sign up, your name, email address, profile photo (if you
          add one), and the posts, comments, likes and saved posts you create.
        </li>
        <li>
          <strong>Email subscription:</strong> your email address and whether you confirmed it, so new
          posts can be sent to you.
        </li>
        <li>
          <strong>Basic analytics:</strong> anonymous page views and post view counts, used to see
          which content is useful.
        </li>
      </ul>
      <h2>How it is stored</h2>
      <p>
        Data is stored with Google Firebase (authentication, database and file storage). Emails are
        sent through Gmail. The site is hosted on Vercel.
      </p>
      <h2>How it is used</h2>
      <p>
        Your information is only used to run this site: replying to messages, letting you sign in,
        showing your comments, and sending the emails you asked for. It is never sold or shared for
        advertising.
      </p>
      <h2>Your choices</h2>
      <ul>
        <li>Every newsletter email has an unsubscribe link.</li>
        <li>You can edit your profile and delete your comments at any time.</li>
        <li>
          To delete your account or any data about you, email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </li>
      </ul>
      <h2>Cookies and local storage</h2>
      <p>
        The site stores a few settings in your browser (theme preference, sign-in session and
        unsaved editor drafts). It does not use advertising cookies.
      </p>
    </>
  );
}

function Terms() {
  return (
    <>
      <p>By using this site you agree to these terms.</p>
      <h2>Content</h2>
      <p>
        Articles and project descriptions are written by {site.fullName} and invited writers. They are
        shared for learning and are provided as-is, without warranty. Code samples may be reused in
        your own projects unless a post says otherwise.
      </p>
      <h2>Your contributions</h2>
      <p>
        You are responsible for the comments and posts you publish. Please be respectful: spam,
        harassment and illegal content will be removed and accounts may be suspended.
      </p>
      <h2>Accounts</h2>
      <p>
        Keep your login details safe. Accounts that misuse the site may be restricted or removed.
      </p>
      <h2>Changes</h2>
      <p>These terms may be updated; the date below shows the latest version.</p>
      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </>
  );
}

export default function LegalPage({ page }: { page: "privacy" | "terms" }): React.ReactElement {
  const title = page === "privacy" ? "Privacy policy" : "Terms of use";
  useDocumentMeta({ title });

  return (
    <article className="page-container max-w-3xl pb-20 pt-4">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-base-content/60">Last updated {UPDATED}</p>
      <div className="prose mt-8 max-w-none prose-headings:text-base-content prose-a:text-primary">
        {page === "privacy" ? <Privacy /> : <Terms />}
      </div>
      <Link to="/" className="btn btn-ghost mt-10 border border-base-300">
        Back to home
      </Link>
    </article>
  );
}
