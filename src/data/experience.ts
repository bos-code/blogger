/** Public professional experience and education. */
export interface TimelineEntry {
  title: string;
  organisation: string;
  period: string;
  kind: "work" | "education";
  points: string[];
}

export const TIMELINE: TimelineEntry[] = [
  {
    title: "Software Engineer",
    organisation: "Kariya Technologies",
    period: "2026 – Present",
    kind: "work",
    points: [
      "Contribute to endpoint security software and its integration with web and backend systems.",
      "Work across Go, TypeScript, desktop applications, automated testing and CI workflows.",
    ],
  },
  {
    title: "Frontend Developer",
    organisation: "Merx Africa",
    period: "February 2026",
    kind: "work",
    points: ["Built responsive layouts and reusable UI components aligned with client brand and design requirements."],
  },
  {
    title: "Frontend & Mobile Developer",
    organisation: "Liveizy Limited",
    period: "2025 – 2026",
    kind: "work",
    points: ["Built onboarding and responsive interfaces for a property and billing platform.", "Collaborated on production issue investigation and fixes."],
  },
  {
    title: "React Native Developer",
    organisation: "Gigxy",
    period: "November 2025 – March 2026",
    kind: "work",
    points: ["Built Expo marketplace booking, offer and cancellation flows.", "Integrated Stripe Connect, Firebase Cloud Messaging and Google Places."],
  },
  {
    title: "Volunteer Technical Lead & Frontend Lead",
    organisation: "MOI Doctar",
    period: "From 2025",
    kind: "work",
    points: ["Guided frontend development for a digital-health product.", "Built React/TypeScript screens and typed API integrations."],
  },
  {
    title: "Independent software development",
    organisation: "Self-directed",
    period: "2024 – Present",
    kind: "work",
    points: [
      "Build web and mobile products, APIs and personal desktop applications.",
      "Develop full-stack applications with authentication, database integrations and role-based access.",
      "Build and deploy projects across education, e-commerce, productivity and publishing.",
    ],
  },
  {
    title: "B.Sc. Computer Science",
    organisation: "Lagos State University (LASU)",
    period: "In progress",
    kind: "education",
    points: ["Combining academic foundations with practical software engineering."],
  },
];
