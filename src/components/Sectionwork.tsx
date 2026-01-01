import ProjectMockup from "./projectMockup";
import SectionHead from "./sectionHead";

function Work(): React.ReactElement {
  return (
    <section className="work bg-[url('./assets/codeface.png')] bg-contain bg-repeat">
      <div className="bg-base-200/85 p-4 sm:p-8 md:p-16 lg:p-24 xl:p-32 gap-8 sm:gap-12 lg:gap-16 text-center flex flex-col items-center justify-center">
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
