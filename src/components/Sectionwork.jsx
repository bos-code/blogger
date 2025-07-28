import ProjectMockup from "./projectMockup";
import SectionHead from "./sectionHead";

function Work() {
  return (
    <section className="work  bg-[url('./assets/codeface.png')]  bg-contain bg-repeat ">
      <div className=" bg-base-200/80 p-32 gap-16  h-ful  text-center flex flex-col items-center gap-16l">
        <SectionHead
          title={"Works"}
          descript={"I had the pleasure of working with these awesome projects"}
        />
      <ProjectMockup/>
      <ProjectMockup/>
      </div>
    </section>
  );
}

export default Work;
