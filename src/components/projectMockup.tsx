import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Mousewheel } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import ProjectCard from "./ProjectCard";
import portfolio from "../assets/portfolio.png";
import project2 from "../assets/banquee.png";
import project3 from "../assets/cashapp.png";
import project4 from "../assets/fast.png";
import project5 from "../assets/streamvibe.png";
import project6 from "../assets/store.png";

function ProjectMockup(): JSX.Element {
  const projects = [
    {
      title: "Portfolio",
      imgSrc: portfolio,
      url: "https://johndera-portfolio.vercel.app/",
    },
    {
      title: "Banquee",
      imgSrc: project2,
      url: "https://banquee-eta.vercel.app/",
    },
    {
      title: "CashApp",
      imgSrc: project3,
      url: "https://cash-app-beta-wine.vercel.app/",
    },
    {
      title: "FastUi",
      imgSrc: project4,
      url: "https://fast-ui-murex.vercel.app/",
    },
    {
      title: "StreamVibe",
      imgSrc: project5,
      url: "https://stream-vibe-movies.vercel.app/",
    },
    {
      title: "Store",
      imgSrc: project6,
      url: "https://ecommerce-product-page-main-virid.vercel.app/",
    },
  ];

  // Refs for navigation buttons
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative w-full py-8">
      <Swiper
        modules={[Navigation, Keyboard, Mousewheel]}
        slidesPerView={1}
        spaceBetween={30}
        loop={true}
        grabCursor={true}
        keyboard={{ enabled: true, onlyInViewport: true }}
        mousewheel={true}
        navigation={{
          prevEl: prevRef.current || ".prev",
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        className="w-full"
      >
        {projects.map((project, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex justify-center">
              <ProjectCard {...project} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Nav buttons */}
      <div className="absolute inset-0 flex items-center justify-between z-20 px-6 pointer-events-none">
        <button
          ref={prevRef}
          className="btn btn-circle pointer-events-auto prev"
          aria-label="Previous"
        >
          ❮
        </button>
        <button
          ref={nextRef}
          className="btn btn-circle pointer-events-auto"
          aria-label="Next"
        >
          ❯
        </button>
      </div>
    </div>
  );
}

export default ProjectMockup;
