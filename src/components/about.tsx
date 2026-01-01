import { Span } from "./Span";
import Scroll from "../assets/Scroll";
import comp from "../assets/about-comp.png"

function AboutMe(): React.ReactElement {
  return (
    <section
      className={`section-about bg-cover bg-center bg-base-200 bg-[url('./assets/whoop-bg.png')]`} 
    >
      <div className="all bg-base-200/90 p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20 flex flex-col gap-8 sm:gap-12 lg:gap-16 items-center justify-center h-full">
        <div className="scroll-container hidden sm:block">
          <Scroll />
        </div>
        <div className="content-container grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 pl-0 lg:pl-10 w-full">
          <div className="text-container flex flex-col gap-8 sm:gap-12 lg:gap-16 col-span-1 lg:col-span-3">
            <div className="about badge px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 lg:py-4 border-4 ubuntu-medium h-auto rounded-tl-[20px] sm:rounded-tl-[30px] lg:rounded-tl-[40px] rounded-br-[20px] sm:rounded-br-[30px] lg:rounded-br-[40px] border-primary badge-outline bg-base-100 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center lg:text-left">
              About Me
            </div>
            <div className="content">
              <div className="flex flex-col gap-3 sm:gap-4 bg-base-100 rounded-[20px] sm:rounded-[30px] lg:rounded-[40px] px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 justify-center text-sm sm:text-base ibm-plex-mono">
                <span className="htag ibm-plex text-xs sm:text-sm">{"<p>"}</span>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  <Span>Hello!</Span>
                </span>
                <p>
                  {" "}
                  My name is JohnDera and I specialize in web developement that
                  utilizes <Span>HTML</Span>,<Span> CSS</Span>,<Span> JS</Span>,
                  and <Span>REACT</Span> etc
                </p>
                <p>
                  {" "}
                  I am a highly motivated individual and eternal optimist
                  dedicated to writing clear, concise, robust code that works.
                  Striving to never stop learning and improving.
                </p>
                <p>
                  {" "}
                  When I'm not coding, I am<Span> writing blogs</Span>, reading,
                  or picking up some new hands-on art project like
                  <Span> photography</Span>.
                </p>{" "}
                <p>
                  {" "}
                  I like to have my perspective and belief systems challenged so
                  that I see the world through new eyes.
                </p>
                <span className="htag ibm-plex text-xs sm:text-sm">{"</p>"}</span>
              </div>
            </div>
          </div>
          <div className="image-container col-span-1 lg:col-span-2">
            <Image />
          </div>
        </div>
      </div>
    </section>
  );
}

function Image(): React.ReactElement {
  return (
    <img
      src={comp}
      alt="about me"
      className="rounded-[20px] sm:rounded-[30px] lg:rounded-[40px] w-full h-auto sm:h-full object-cover"
    />
  );
}

export default AboutMe