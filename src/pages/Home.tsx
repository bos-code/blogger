import SectionContact from "../components/SectionContact";
import Work from "../components/Sectionwork";
import AboutMe from "../components/about";
import SectionBlog from "../components/sectionBlog";
import Stack from "../components/sectionStack";
import Experience from "../components/Experience";
import Hero from "../components/Hero";
import SectionNav from "../components/SectionNav";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { site } from "../data/site";

export default function Home(): React.ReactElement {
  useDocumentMeta({
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.fullName,
      alternateName: site.name,
      jobTitle: site.role,
      email: `mailto:${site.email}`,
      url: typeof window !== "undefined" ? window.location.origin : undefined,
      sameAs: Object.values(site.socials),
    },
  });

  return (
    <>
      <SectionNav />
      <Hero />
      <AboutMe />
      <Stack />
      <Experience />
      <Work />
      <SectionBlog />
      <SectionContact />
    </>
  );
}
