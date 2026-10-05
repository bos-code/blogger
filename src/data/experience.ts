/** Timeline entries taken from the resume (public/John-Dera-Resume.pdf). */
export interface TimelineEntry {
  title: string;
  organisation: string;
  period: string;
  kind: "work" | "education";
  points: string[];
}

export const TIMELINE: TimelineEntry[] = [
  {
    title: "Frontend Developer",
    organisation: "Self-directed",
    period: "2024 – Present",
    kind: "work",
    points: [
      "Built and deployed multiple front-end applications with React and JavaScript.",
      "Integrated REST APIs and Firebase services into production interfaces.",
      "Converted Figma designs into responsive, accessible UIs.",
      "Built a role-based CMS blog platform with a TipTap editor, and a quiz platform with admin, teacher and student roles.",
    ],
  },
  {
    title: "B.Sc. Computer Science",
    organisation: "Lagos State University (LASU)",
    period: "In progress",
    kind: "education",
    points: ["Combining academic foundations with production-level front-end work."],
  },
];
