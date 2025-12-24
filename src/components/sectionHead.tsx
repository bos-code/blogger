import Scroll from "../assets/Scroll";

function SectionHead({ title, descript }: { title: string; descript: string }): JSX.Element {
  return (
    <>
      <div className="section-head text-center flex flex-col items-center gap-16">
        <Scroll />
        <div className="textbox flex flex-col gap-4">
          <h2 className="  text-primary text-6xl  leading-[72px]  border-b-2 border-primary inline-block self-center  indicator">
            {title}
            <span className="indicator-item status status-primary indicator-bottom"></span>
            <span className="indicator-item status status-primary indicator-bottom -left-3 bg-primary text-transparent"></span>
          </h2>
          <p className="text-base ibm-plex-mono ">{descript}</p>
        </div>
      </div>
    </>
  );
}

export default SectionHead;
