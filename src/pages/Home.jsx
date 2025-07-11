// src/pages/Home.jsx
import { Hero } from "./Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutMe />
    </>
  );
}

function AboutMe() {
  return (
    <section
      className={`section-about h-svh bg-cover  bg-center bg-base-200 bg-[url('./assets/whoop-bg.png')]`}
    ></section>
  );
}
