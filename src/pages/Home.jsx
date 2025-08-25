// src/pages/Home.jsx
import SectionContact from "../components/SectionContact";
import Work from "../components/Sectionwork";
import AboutMe from "../components/about";
import SectionBlog from "../components/sectionBlog";
import Stack from "../components/sectionStack";
import Hero from "../components/Hero";

export default function Home() {
  return (
    <>
      <Hero/>
      <AboutMe />
      <Stack />
      <Work />
      <SectionBlog />
      <SectionContact />
    </>
  );
}
