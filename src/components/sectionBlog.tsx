import SectionHead from "./sectionHead"

function SectionBlog(): React.ReactElement {
  return (
    <section className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24">
      <SectionHead
        title={"Blogs"}
        descript={
          "My thoughts on technology and business, welcome to subscribe"
        }
      />
    </section>
  );
}

export default SectionBlog
