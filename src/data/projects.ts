import banquee from "../assets/banquee.webp";
import streamvibe from "../assets/streamvibe.webp";
import type { Project } from "../types";

/**
 * Built-in project list, shown until projects are added from the dashboard
 * (Dashboard → Projects). Kept so the portfolio never renders empty.
 * Projects without a screenshot get a generated cover (see ProjectCover).
 */
export const FALLBACK_PROJECTS: Project[] = [
  {
    id: "moidoctar",
    slug: "moidoctar",
    title: "MoiDoctar",
    summary: "AI-assisted health triage: describe symptoms on an interactive body map, get guidance, track medication and find real care nearby.",
    description: `MoiDoctar helps people make sense of symptoms before they reach a clinic. Users pinpoint pain on an interactive body map, answer a guided triage flow and get an AI-assisted assessment, then keep a history of symptoms and medication reminders.

The React + TypeScript front end talks to a FastAPI backend with endpoints for auth, triage, symptoms, medication, support and an admin area. AI requests go through an LLM gateway with request logging and cost tracking, and fall back gracefully when it is unavailable.

Nearby Care uses the browser's location and the OpenStreetMap Overpass API to list real hospitals, clinics and pharmacies sorted by distance, and notifications are stored as real events rather than seeded data.`,
    liveUrl: "https://moidoctar8.pxxlspace.cv",
    repoUrl: "https://github.com/MOI-DOCTAR-ORG/moidoctar",
    tech: ["React", "TypeScript", "FastAPI", "Python", "TanStack Query", "Tailwind CSS"],
    order: 1,
  },
  {
    id: "blogger",
    slug: "blogger",
    title: "Portfolio & Publishing CMS",
    summary: "This site: a portfolio with a full blog CMS, Notion-style editor, review workflow, roles, newsletter and analytics on free tiers.",
    description: `The site you're on. Visitors browse projects and articles; writers draft in a Notion-style TipTap editor with slash commands, tables, embeds, autosave, version history and shareable preview links; admins review, publish and run everything from a dashboard.

Firebase handles auth, Firestore and storage, with permissions enforced by security rules. Vercel functions serve RSS, a sitemap, social-share previews and a double opt-in newsletter sent with Nodemailer.

Quality is covered by unit tests, API checks against the Firebase emulators and Playwright end-to-end tests on desktop and mobile in CI.`,
    repoUrl: "https://github.com/bos-code/blogger",
    tech: ["React 19", "TypeScript", "Firebase", "TipTap", "TanStack Query", "Playwright"],
    order: 2,
  },
  {
    id: "finance-tracker",
    slug: "finance-tracker",
    title: "Finance Tracker",
    summary: "Mobile-first personal finance app with offline transaction entry, savings goals, cashflow analytics and PIN/biometric lock.",
    description: `A personal finance app for Android built with Expo and React Native. Users record revenue and expenditure with categories and notes, browse them as a list or calendar, and see monthly and yearly cashflow trends and category breakdowns.

Transactions can be captured offline; changes are queued and synced to Supabase automatically when the device reconnects. Savings and item-based goals track progress over time.

Supabase Auth handles accounts and password resets, and the app is protected by a secure PIN with optional biometrics.`,
    repoUrl: "https://github.com/bos-code/finance_tracker",
    tech: ["React Native", "Expo", "Supabase", "TanStack Query", "NativeWind"],
    order: 3,
  },
  {
    id: "derashare",
    slug: "derashare",
    title: "Dera Share",
    summary: "Real-time text bridge between two paired devices: 6-digit rooms, WebSockets, no account and no database.",
    description: `Dera Share moves text between your phone and laptop instantly. One device opens a temporary room, the other joins with a 6-digit code, and anything typed or pasted appears on both sides in real time.

A Next.js + TypeScript client talks to a small Node.js WebSocket relay. Rooms hold at most two devices, keep text only in memory, reconnect automatically and expire after a five-minute grace period, so nothing is stored permanently.

It installs as a PWA, and CI runs formatting, linting, type checks, server integration tests and a production build on every push.`,
    liveUrl: "https://derashare.vercel.app",
    repoUrl: "https://github.com/bos-code/Derashare",
    tech: ["Next.js", "TypeScript", "WebSockets", "Node.js", "PWA"],
    order: 4,
  },
  {
    id: "starlite-tools",
    slug: "starlite-tools",
    title: "Starlite Tools Showroom",
    summary: "Industrial product catalogue and quote-request site with 193 product pages, filters, comparison and a WhatsApp handoff.",
    description: `A digital showroom for an industrial tools distributor, built for contractors, technicians, dealers and bulk buyers.

The catalogue has 193 statically generated product pages, search, category, brand and availability filters, sorting, side-by-side comparison and pagination. Buyers build a persistent quote list, submit it with an optional WhatsApp handoff, and dealers can follow up from a local quote-history dashboard.

Built with the Next.js App Router, React 19, TypeScript and Tailwind CSS 4.`,
    repoUrl: "https://github.com/bos-code/starlight",
    tech: ["Next.js", "React 19", "TypeScript", "Tailwind CSS"],
    order: 5,
  },
  {
    id: "ventum",
    slug: "ventum",
    title: "Ventum Global Automation",
    summary: "Business website and admin console for an automation supplier: product catalogue, enquiries and an installable admin PWA.",
    description: `A website for an automation and electrical supplier in Lagos, paired with a private admin console.

Visitors browse brands and products and send enquiries. Staff sign in to an admin area, installable as a PWA, to manage products and images, handle enquiries and update site settings, all backed by Appwrite.

A scheduled GitHub Action sends an activity report so the business sees new enquiries without logging in. Built with Next.js server actions and GSAP animation.`,
    repoUrl: "https://github.com/bos-code/ventum-automation",
    tech: ["Next.js", "TypeScript", "Appwrite", "GSAP", "GitHub Actions"],
    order: 6,
  },
  {
    id: "dera-library",
    slug: "dera-library",
    title: "Dera Library",
    summary: "Offline-first Android document library that finds the files already on your phone and organises them into one searchable library.",
    description: `Dera Library turns the documents scattered across a phone (downloads, WhatsApp and Telegram folders, SD cards) into one searchable library without copying, moving or uploading anything.

A custom native module walks shared storage when all-files access is granted, with Storage Access Framework folder and file pickers and a MediaStore fallback for stricter setups. Everything is indexed locally in SQLite and organised with collections, tags, favourites and history.

Built with Expo Router, React Native, Reanimated and FlashList.`,
    repoUrl: "https://github.com/bos-code/Dera_library",
    tech: ["React Native", "Expo", "SQLite", "Kotlin module"],
    order: 7,
  },
  {
    id: "time-table",
    slug: "time-table",
    title: "School Timetable Generator",
    summary: "Generates clash-free school timetables from teachers, classes and weekly lesson counts using a constraint solver.",
    description: `Building a school timetable by hand takes days. Here, staff add teachers, configure the school week, and assign each teacher a subject, class and number of lessons per week.

A FastAPI backend feeds that demand into Google OR-Tools, which blocks teacher and class clashes and spreads lessons across the week. The React + Vite front end handles data entry, validation and the generated timetable.`,
    repoUrl: "https://github.com/bos-code/time-table",
    tech: ["React", "FastAPI", "OR-Tools", "Material UI", "Tailwind CSS"],
    order: 8,
  },
  {
    id: "math-exam-editor",
    slug: "math-exam-editor",
    title: "Math Exam Editor",
    summary: "Browser-based editor for WAEC-style maths exams with rich text, LaTeX input, Excel import and Excel/JSON export.",
    description: `A front-end-only tool for building mathematics exams. Questions are written in a TipTap rich-text editor with MathLive for LaTeX input and KaTeX for display.

Existing question banks can be imported from Excel with a preview step, and finished exams export to Excel or JSON. Everything runs in memory, with no backend.`,
    repoUrl: "https://github.com/bos-code/editor",
    tech: ["React", "TypeScript", "TipTap", "MathLive", "KaTeX", "SheetJS"],
    order: 9,
  },
  {
    id: "streamvibe",
    slug: "streamvibe",
    title: "StreamVibe",
    summary: "Media discovery app built on the TMDb REST API with dynamic endpoints and an MVC-style front-end architecture.",
    imageUrl: streamvibe,
    liveUrl: "https://stream-vibe-movies.vercel.app/",
    repoUrl: "https://github.com/bos-code/stream-vibe-movies",
    tech: ["React", "TMDb API", "REST"],
    order: 10,
  },
  {
    id: "banquee",
    slug: "banquee",
    title: "Banquee",
    summary: "Responsive landing page for a digital banking product with SwiperJS animations, deployed on Vercel.",
    imageUrl: banquee,
    liveUrl: "https://banquee-eta.vercel.app/",
    repoUrl: "https://github.com/bos-code/Banquee",
    tech: ["React", "SwiperJS", "Vercel"],
    order: 11,
  },
];
