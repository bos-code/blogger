function ProjectCard({ imgSrc, url, title }: { imgSrc: string; url: string; title: string }): JSX.Element {
  return (
    <div className="text-center">
      <div className="mockup-window bg-base-100 border border-base-300">
        <div className="grid place-content-center h-[40vh] w-[50vw]">
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
