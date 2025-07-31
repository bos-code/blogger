import ProjectCard from "./ProjectCard";
import portfolio from "../assets/portfolio.png"; // ✅ Fixed typo
import project2 from "../assets/banquee.png";
import project3 from "../assets/cashapp.png";
import project4 from "../assets/fastUi.png";
import project5 from "../assets/streamvibe.png";
import project6 from "../assets/store.png";

function ProjectMockup() {
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
      title: "streamVibe",
      imgSrc: project5,
      url: "https://stream-vibe-movies.vercel.app/",
    },
    {
      title: "Store",
      imgSrc: project6,
      url: "https://ecommerce-product-page-main-virid.vercel.app/",
    },
  ];

  return (
    <div className="carousel w-full">
      {projects.map((project, idx) => {
        const prevIdx = idx === 0 ? projects.length : idx;
        const nextIdx = idx + 2 > projects.length ? 1 : idx + 2;

        return (
          <div
            key={project.title}
            id={`slide${idx + 1}`}
            className="carousel-item relative w-full flex justify-center"
          >
            <ProjectCard {...project} />

            {projects.length > 1 && (
              <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                <a href={`#slide${prevIdx}`} className="btn btn-circle">
                  ❮
                </a>
                <a href={`#slide${nextIdx}`} className="btn btn-circle">
                  ❯
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProjectMockup;
