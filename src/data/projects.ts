import yakoyoKitchenMockup from "../assets/projects/yakoyo-kitchen.webp";
import studyproMockup from "../assets/projects/studypro.webp";
import tissageDeLohMockup from "../assets/projects/tissage-de-loh.webp";
import veloriaEssenceSpaMockup from "../assets/projects/veloria-essence-spa.webp";
import bloggerMockup from "../assets/projects/blogger.webp";
import financeTrackerMockup from "../assets/projects/finance-tracker.webp";
import chinelMediaMockup from "../assets/projects/chinel-media.webp";
import derashareMockup from "../assets/projects/derashare.webp";
import starliteToolsMockup from "../assets/projects/starlite-tools.webp";
import ventumMockup from "../assets/projects/ventum.webp";
import deraLibraryMockup from "../assets/projects/dera-library.webp";
import timeTableMockup from "../assets/projects/time-table.webp";
import mathExamEditorMockup from "../assets/projects/math-exam-editor.webp";
import streamvibeMockup from "../assets/projects/streamvibe.webp";
import banqueeMockup from "../assets/projects/banquee.webp";
import reggzMockup from "../assets/projects/316-reggz.webp";
import fastUiMockup from "../assets/projects/fast-ui.webp";
import type { Project } from "../types";

/**
 * Built-in project list, shown until projects are added from the dashboard
 * (Dashboard → Projects). Kept so the portfolio never renders empty.
 * Images are device mockups (desktop, tablet, phone) captured from local builds.
 * Projects added without an image get a generated cover (see ProjectCover).
 */
export const FALLBACK_PROJECTS: Project[] = [
  {
    id: "yakoyo-kitchen",
    slug: "yakoyo-kitchen",
    title: "Yakoyo African Kitchen",
    imageUrl: yakoyoKitchenMockup,
    summary: "Online ordering and catering platform for a Nigerian restaurant in Delaware, with Stripe payments and a full operations dashboard.",
    description: `Yakoyo African Kitchen brings an authentic Nigerian menu online for a restaurant in Wilmington, Delaware. Customers browse the menu, build a cart, pay online and request catering quotes.

Behind it is a complete operations dashboard: live sales metrics by date range, orders with payment status, customer history, printable receipts and kitchen tickets, catering quotes and confirmations, menu and media management, staff accounts, an audit log and Telegram notifications for new activity.

Built with Next.js, TypeScript, Prisma on PostgreSQL, Supabase Auth, Stripe and Cloudinary, deployed on Vercel.`,
    liveUrl: "https://yakoyokitchen.com",
    tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Stripe", "Supabase"],
    order: 1,
  },
  {
    id: "studypro",
    slug: "studypro",
    title: "StudyPro",
    imageUrl: studyproMockup,
    summary: "Study platform for Nigerian schools: topic practice, timed tests, exam preparation, progress tracking, leaderboards and an admin content studio.",
    description: `StudyPro helps secondary-school students practise and prepare for exams. Students sign in with a student ID and passcode, practise by topic, take timed tests and external-exam tracks, and follow their results, history and place on the leaderboard.

Staff manage students, classes, subjects, topics, the question bank and assessments, and review attempts and analytics, with role- and permission-based access for super admins, admins, subject teachers and form teachers.

The Next.js 16 front end talks to a NestJS API backed by Prisma and PostgreSQL, with JWT sessions in httpOnly cookies, rate limiting, Supabase Storage for files and optional Telegram and AI-assisted question import. Grading happens on the server so scores can't be tampered with in the browser.`,
    tech: ["Next.js 16", "NestJS", "PostgreSQL", "Prisma", "TypeScript"],
    order: 2,
  },
  {
    id: "tissage-de-loh",
    slug: "tissage-de-loh",
    title: "Tissage De Loh",
    imageUrl: tissageDeLohMockup,
    summary: "Custom e-commerce rebuild for a hair and wig brand, moving off WordPress to Next.js, Supabase and Stripe.",
    description: `Tissage De Loh sells wigs, closures, frontals and bundles. The store was rebuilt from WordPress into a custom full-stack shop.

Shoppers browse the catalogue, pay with Stripe, place custom orders and look up order status without an account. The brand gets an admin area, email updates, web-push notifications and policy pages for shipping and returns.

Built with Next.js, TypeScript, Supabase (PostgreSQL and Auth), Stripe, GSAP and Zod, with tests run by Vitest and deployment on Vercel.`,
    tech: ["Next.js", "TypeScript", "Supabase", "Stripe", "GSAP"],
    order: 3,
  },
  {
    id: "veloria-essence-spa",
    slug: "veloria-essence-spa",
    title: "Veloria Essence Spa",
    imageUrl: veloriaEssenceSpaMockup,
    summary: "Luxury spa website with online booking requests, branded email confirmations and a separate admin dashboard for bookings and content.",
    description: `Veloria Essence Spa is a premium spa and wellness brand. Its website introduces the spa, its services, packages and prices, a gallery, testimonials and FAQs, and lets visitors request appointments online or reach the spa on WhatsApp.

Booking and contact requests are validated with Zod and trigger branded emails built with React Email: a confirmation to the customer, an alert to the spa, and reschedule requests. Staff also get Telegram notifications. The home page uses GSAP and Three.js for a calm, animated luxury feel.

A separate admin dashboard (React, Vite and Firebase) lets the spa confirm, cancel or complete bookings on a schedule view, and manage services, testimonials, media, locations on a map and business details, behind a passcode gate.`,
    tech: ["Next.js", "Firebase", "React Email", "GSAP", "Three.js", "Zod"],
    order: 4,
  },
  {
    id: "316-reggz",
    slug: "316-reggz",
    title: "316 REGGZ",
    imageUrl: reggzMockup,
    summary: "Image-led portfolio for an independent Lagos creative studio, built like an album rather than a filing cabinet.",
    description: `316 REGGZ is a creative studio in Lagos working across design, motion, branding and visual direction. The website puts the artwork first: large images, typography with attitude, and motion as part of the storytelling.

At its centre is the Album, a growing archive of music artwork, brand identities, campaign visuals and motion work, with a page for each project, plus company, works and contact pages.

Built with Next.js, TypeScript and Sass, with GSAP animation, Swiper carousels and a masonry gallery, statically generated for speed.`,
    liveUrl: "https://316-reggz-website.vercel.app",
    tech: ["Next.js", "TypeScript", "Sass", "GSAP", "Swiper"],
    order: 5,
  },
  {
    id: "blogger",
    slug: "blogger",
    title: "Portfolio & Publishing CMS",
    imageUrl: bloggerMockup,
    summary: "This site: a portfolio with a full blog CMS, Notion-style editor, review workflow, roles, newsletter and analytics on free tiers.",
    description: `The site you're on. Visitors browse projects and articles; writers draft in a Notion-style TipTap editor with slash commands, tables, embeds, autosave, version history and shareable preview links; admins review, publish and run everything from a dashboard.

Firebase handles auth, Firestore and storage, with permissions enforced by security rules. Vercel functions serve RSS, a sitemap, social-share previews and a double opt-in newsletter sent with Nodemailer.

Quality is covered by unit tests, API checks against the Firebase emulators and Playwright end-to-end tests on desktop and mobile in CI.`,
    repoUrl: "https://github.com/bos-code/blogger",
    tech: ["React 19", "TypeScript", "Firebase", "TipTap", "TanStack Query", "Playwright"],
    order: 6,
  },
  {
    id: "finance-tracker",
    slug: "finance-tracker",
    title: "Finance Tracker",
    imageUrl: financeTrackerMockup,
    summary: "Mobile-first personal finance app with offline transaction entry, savings goals, cashflow analytics and PIN/biometric lock.",
    description: `A personal finance app for Android built with Expo and React Native. Users record revenue and expenditure with categories and notes, browse them as a list or calendar, and see monthly and yearly cashflow trends and category breakdowns.

Transactions can be captured offline; changes are queued and synced to Supabase automatically when the device reconnects. Savings and item-based goals track progress over time.

Supabase Auth handles accounts and password resets, and the app is protected by a secure PIN with optional biometrics.`,
    repoUrl: "https://github.com/bos-code/finance_tracker",
    tech: ["React Native", "Expo", "Supabase", "TanStack Query", "NativeWind"],
    order: 7,
  },
  {
    id: "chinel-media",
    slug: "chinel-media",
    title: "Chinel Media",
    imageUrl: chinelMediaMockup,
    summary: "Website for a creative printing and media agency, with interactive 3D scenes, scroll animation and case-study pages.",
    description: `Chinel Media is a branding, printing and media agency. Its website presents services, portfolio case studies, clients, the team, the agency's process and insights.

The home page uses interactive 3D scenes built with Three.js and React Three Fiber, GSAP scroll reveals and Lenis smooth scrolling, while service and portfolio pages are generated from structured content.

Built with Next.js, TypeScript and Tailwind CSS, with forms validated by React Hook Form and Zod.`,
    tech: ["Next.js", "Three.js", "React Three Fiber", "GSAP", "TypeScript"],
    order: 8,
  },
  {
    id: "derashare",
    slug: "derashare",
    title: "Dera Share",
    imageUrl: derashareMockup,
    summary: "Real-time text bridge between two paired devices: 6-digit rooms, WebSockets, no account and no database.",
    description: `Dera Share moves text between your phone and laptop instantly. One device opens a temporary room, the other joins with a 6-digit code, and anything typed or pasted appears on both sides in real time.

A Next.js + TypeScript client talks to a small Node.js WebSocket relay. Rooms hold at most two devices, keep text only in memory, reconnect automatically and expire after a five-minute grace period, so nothing is stored permanently.

It installs as a PWA, and CI runs formatting, linting, type checks, server integration tests and a production build on every push.`,
    liveUrl: "https://derashare.vercel.app",
    repoUrl: "https://github.com/bos-code/Derashare",
    tech: ["Next.js", "TypeScript", "WebSockets", "Node.js", "PWA"],
    order: 9,
  },
  {
    id: "starlite-tools",
    slug: "starlite-tools",
    title: "Starlite Tools Showroom",
    imageUrl: starliteToolsMockup,
    summary: "Industrial product catalogue and quote-request site with 193 product pages, filters, comparison and a WhatsApp handoff.",
    description: `A digital showroom for an industrial tools distributor, built for contractors, technicians, dealers and bulk buyers.

The catalogue has 193 statically generated product pages, search, category, brand and availability filters, sorting, side-by-side comparison and pagination. Buyers build a persistent quote list, submit it with an optional WhatsApp handoff, and dealers can follow up from a local quote-history dashboard.

Built with the Next.js App Router, React 19, TypeScript and Tailwind CSS 4.`,
    repoUrl: "https://github.com/bos-code/starlight",
    tech: ["Next.js", "React 19", "TypeScript", "Tailwind CSS"],
    order: 10,
  },
  {
    id: "ventum",
    slug: "ventum",
    title: "Ventum Global Automation",
    imageUrl: ventumMockup,
    summary: "Business website and admin console for an automation supplier: product catalogue, enquiries and an installable admin PWA.",
    description: `A website for an automation and electrical supplier in Lagos, paired with a private admin console.

Visitors browse brands and products and send enquiries. Staff sign in to an admin area, installable as a PWA, to manage products and images, handle enquiries and update site settings, all backed by Appwrite.

A scheduled GitHub Action sends an activity report so the business sees new enquiries without logging in. Built with Next.js server actions and GSAP animation.`,
    repoUrl: "https://github.com/bos-code/ventum-automation",
    tech: ["Next.js", "TypeScript", "Appwrite", "GSAP", "GitHub Actions"],
    order: 11,
  },
  {
    id: "dera-library",
    slug: "dera-library",
    title: "Dera Library",
    imageUrl: deraLibraryMockup,
    summary: "Offline-first Android document library that finds the files already on your phone and organises them into one searchable library.",
    description: `Dera Library turns the documents scattered across a phone (downloads, WhatsApp and Telegram folders, SD cards) into one searchable library without copying, moving or uploading anything.

A custom native module walks shared storage when all-files access is granted, with Storage Access Framework folder and file pickers and a MediaStore fallback for stricter setups. Everything is indexed locally in SQLite and organised with collections, tags, favourites and history.

Built with Expo Router, React Native, Reanimated and FlashList.`,
    repoUrl: "https://github.com/bos-code/Dera_library",
    tech: ["React Native", "Expo", "SQLite", "Kotlin module"],
    order: 12,
  },
  {
    id: "time-table",
    slug: "time-table",
    title: "TimeTink",
    imageUrl: timeTableMockup,
    summary: "School timetable generator that builds clash-free timetables from teachers, classes and weekly lesson counts using a constraint solver.",
    description: `Building a school timetable by hand takes days. Here, staff add teachers, configure the school week, and assign each teacher a subject, class and number of lessons per week.

A FastAPI backend feeds that demand into Google OR-Tools, which blocks teacher and class clashes and spreads lessons across the week. The React + Vite front end handles data entry, validation and the generated timetable.`,
    repoUrl: "https://github.com/bos-code/time-table",
    tech: ["React", "FastAPI", "OR-Tools", "Material UI", "Tailwind CSS"],
    order: 13,
  },
  {
    id: "math-exam-editor",
    slug: "math-exam-editor",
    title: "Math Exam Editor",
    imageUrl: mathExamEditorMockup,
    summary: "Browser-based editor for WAEC-style maths exams with rich text, LaTeX input, Excel import and Excel/JSON export.",
    description: `A front-end-only tool for building mathematics exams. Questions are written in a TipTap rich-text editor with MathLive for LaTeX input and KaTeX for display.

Existing question banks can be imported from Excel with a preview step, and finished exams export to Excel or JSON. Everything runs in memory, with no backend.`,
    repoUrl: "https://github.com/bos-code/editor",
    tech: ["React", "TypeScript", "TipTap", "MathLive", "KaTeX", "SheetJS"],
    order: 14,
  },
  {
    id: "fast-ui",
    slug: "fast-ui",
    title: "FastUI",
    imageUrl: fastUiMockup,
    summary: "Dark, animated agency landing page with a swipeable work gallery, pricing, FAQ and contact sections.",
    description: `FastUI is a responsive landing page for a design agency, with a glassmorphism navigation bar, a gradient hero, and sections for services, a work gallery, pricing, FAQs and contact.

The work gallery is a SwiperJS carousel that adapts from desktop to touch-friendly swiping on phones, and GSAP drives the entrance animations.

Built with Tailwind CSS, SwiperJS and GSAP on Vite, and deployed on Vercel.`,
    liveUrl: "https://fast-ui-murex.vercel.app",
    repoUrl: "https://github.com/bos-code/fast-ui",
    tech: ["Tailwind CSS", "SwiperJS", "GSAP", "Vite"],
    order: 15,
  },
  {
    id: "streamvibe",
    slug: "streamvibe",
    title: "StreamVibe",
    imageUrl: streamvibeMockup,
    summary: "Media discovery app built on the TMDb REST API with dynamic endpoints and an MVC-style front-end architecture.",
    liveUrl: "https://stream-vibe-movies.vercel.app/",
    repoUrl: "https://github.com/bos-code/stream-vibe-movies",
    tech: ["React", "TMDb API", "REST"],
    order: 16,
  },
  {
    id: "banquee",
    slug: "banquee",
    title: "Banquee",
    imageUrl: banqueeMockup,
    summary: "Responsive landing page for a digital banking product with SwiperJS animations, deployed on Vercel.",
    liveUrl: "https://banquee-eta.vercel.app/",
    repoUrl: "https://github.com/bos-code/Banquee",
    tech: ["React", "SwiperJS", "Vercel"],
    order: 17,
  },
];
