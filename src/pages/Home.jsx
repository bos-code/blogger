// src/pages/Home.jsx
import { Hero } from "../components/Hero";
import SectionContact from "../components/SectionContact";
import Work from "../components/Sectionwork";

import AboutMe from "../components/about";
import SectionBlog from "../components/sectionBlog";

import Stack from "../components/sectionStack";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutMe />
      <Stack/>
      <Work/>
      <SectionBlog/>
      <SectionContact/>
    </>
  );
}




