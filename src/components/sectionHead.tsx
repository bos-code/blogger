import Scroll from "../assets/Scroll";

function SectionHead({ title, descript }: { title: string; descript: string }): React.ReactElement {
  return (
    <div className="section-head text-center flex flex-col items-center gap-8 sm:gap-12 lg:gap-16">
      <div className="hidden sm:block">
        <Scroll />
      </div>
      <div className="textbox flex flex-col gap-3 sm:gap-4">
        <h2 className="text-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[72px] border-b-2 border-primary inline-block self-center indicator">
          {title}
          <span className="indicator-item status status-primary indicator-bottom"></span>
          <span className="indicator-item status status-primary indicator-bottom -left-3 bg-primary text-transparent"></span>
        </h2>
        <p className="text-sm sm:text-base ibm-plex-mono px-4">{descript}</p>
      </div>
    </div>
  );
}

export default SectionHead;
