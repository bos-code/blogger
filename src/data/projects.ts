import portfolio from "../assets/portfolio.webp";
import banquee from "../assets/banquee.webp";
import cashapp from "../assets/cashapp.webp";
import fast from "../assets/fast.webp";
import streamvibe from "../assets/streamvibe.webp";
import store from "../assets/store.webp";
import type { Project } from "../types";

/**
 * Built-in project list, shown until projects are added from the dashboard
 * (Dashboard → Projects). Kept so the portfolio never renders empty.
 */
export const FALLBACK_PROJECTS: Project[] = [
  {
    id: "portfolio",
    slug: "portfolio",
    title: "Portfolio",
    summary: "My earlier personal portfolio: a responsive single-page site introducing my work and skills.",
    imageUrl: portfolio,
    liveUrl: "https://johndera-portfolio.vercel.app/",
    tech: ["React", "Tailwind CSS"],
    order: 1,
  },
  {
    id: "banquee",
    slug: "banquee",
    title: "Banquee",
    summary: "Responsive landing page for a digital banking product with SwiperJS animations, deployed on Vercel.",
    imageUrl: banquee,
    liveUrl: "https://banquee-eta.vercel.app/",
    tech: ["React", "SwiperJS", "Vercel"],
    order: 2,
  },
  {
    id: "cashapp",
    slug: "cashapp",
    title: "CashApp",
    summary: "Marketing site for a payments app, built mobile-first from a design file.",
    imageUrl: cashapp,
    liveUrl: "https://cash-app-beta-wine.vercel.app/",
    tech: ["React", "CSS"],
    order: 3,
  },
  {
    id: "fastui",
    slug: "fastui",
    title: "FastUi",
    summary: "UI kit showcase with reusable sections and components.",
    imageUrl: fast,
    liveUrl: "https://fast-ui-murex.vercel.app/",
    tech: ["React", "Tailwind CSS"],
    order: 4,
  },
  {
    id: "streamvibe",
    slug: "streamvibe",
    title: "StreamVibe",
    summary: "Media discovery app built on the TMDb REST API with dynamic endpoints and an MVC-style front-end architecture.",
    imageUrl: streamvibe,
    liveUrl: "https://stream-vibe-movies.vercel.app/",
    tech: ["React", "TMDb API", "REST"],
    order: 5,
  },
  {
    id: "store",
    slug: "store",
    title: "Store",
    summary: "E-commerce product page with an image gallery, lightbox and cart interactions.",
    imageUrl: store,
    liveUrl: "https://ecommerce-product-page-main-virid.vercel.app/",
    tech: ["JavaScript", "CSS"],
    order: 6,
  },
];
