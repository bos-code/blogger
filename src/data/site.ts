/** Owner details and links shared across the site. */
/**
 * The owner's account is promoted to super_admin automatically once its email
 * is verified (also enforced in firestore.rules — keep both in sync).
 */
export const OWNER_EMAIL = "chidera9713@gmail.com";

export const site = {
  name: "John Dera",
  shortName: "Dera",
  fullName: "Chidera Okonkwo",
  role: "Frontend engineer",
  email: "chidera9713@gmail.com",
  location: "Lagos, Nigeria",
  availability: "Full-time / Freelance",
  resumeUrl: "/John-Dera-Resume.pdf",
  socials: {
    github: "https://github.com/bos-code",
    linkedin: "https://www.linkedin.com/in/chidera-okonkwo-38694433a",
  },
} as const;
