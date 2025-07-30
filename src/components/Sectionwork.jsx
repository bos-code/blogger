import ProjectMockup from "./projectMockup";
import SectionHead from "./sectionHead";

function Work() {
  return (
    <section className="work  bg-[url('./assets/codeface.png')] bg-contain
      bg-repeat">
      <div className=" bg-base-200/85 p-32 gap-16  text-center flex flex-col items-center  justify-center">
        <SectionHead
          title={"Works"}
          descript={"I had the pleasure of working with these awesome projects"}
        />
      <ProjectMockup/>
      </div>
    </section>
  );
}

export default Work;
