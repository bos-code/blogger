function ProjectCard({ imgSrc, url, title }: { imgSrc: string; url: string; title: string }): React.ReactElement {
  return (
    <div className="text-center w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
      <div className="mockup-window bg-base-100 border border-base-300">
        <div className="w-full aspect-video">
          <img
            src={imgSrc}
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="link text-primary no-underline border-b-2 transition-all border-transparent inline-block p-1 origin-right duration-500 hover:border-white"
      >
        View Website
      </a>
    </div>
  );
}

export default ProjectCard;
