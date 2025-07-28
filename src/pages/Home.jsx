// src/pages/Home.jsx
import { Hero } from "../components/Hero";
import Work from "../components/Sectionwork";

import AboutMe from "../components/about";

import Stack from "../components/sectionStack";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutMe />
      <Stack/>
      <Work/>
    </>
  );
}




