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
    title: "Software engineering",
    organisation: "Kariya Technologies",
    period: "Present",
    kind: "work",
    points: [
      "Contribute to endpoint security software and its integration with web and backend systems.",
      "Work across Go, TypeScript, desktop applications, automated testing and CI workflows.",
    ],
  },
  {
    title: "Professional experience",
    organisation: "Merx Africa",
    period: "",
    kind: "work",
    points: [],
  },
  {
    title: "Professional experience",
    organisation: "Liveizy",
    period: "",
    kind: "work",
    points: [],
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
