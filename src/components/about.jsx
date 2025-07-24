import { Span } from "./Span";
import Scroll from "../assets/Scroll";
import comp from "../assets/about-comp.png"
function AboutMe() {
  return (
    <section
      className={`section-about    bg-cover  bg-center bg-base-200 bg-[url('./assets/whoop-bg.png')]`}
    >
      <div className="all bg-base-200/90 p-32 flex flex-col   items-center justify-center h-full">
        <div className="scroll-container">
          <Scroll />
        </div>
        <div className="content-container grid grid-cols-3 gap-32 pl-10">
          <div className="text-container flex flex-col gap-16 col-span-2 ">
            <div className="about badge px-10 py-4 border-4 ubuntu-medium h-auto rounded-tl-[40px] rounded-br-[40px] border-primary badge-outline bg-base-100 text-6xl">
              About Me
            </div>
            <div className="content">
              <p className="flex flex-col gap-4 bg-base-100 rounded-[40px] px-10 py-6 justify-center text-base ibm-plex-mono">
                <span className="htag ibm-plex">{"<p>"}</span>
                <h3 className="text-4xl font-bold">
                  <Span>Hello!</Span>
                </h3>
                <p>
                  {" "}
                  My name is Sinan and I specialize in web developement that
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
                  When I'm not coding, I am<Span> writing bolgs</Span>, reading,
                  or picking up some new hands-on art project like
                  <Span> photography</Span>.
                </p>{" "}
                <p>
                  {" "}
                  I like to have my perspective and belief systems challenged so
                  that I see the world through new eyes.
                </p>
                <span className="htag ibm-plex">{"</p>"}</span>
              </p>
            </div>
          </div>
          <div className="image-container col-span-1">
<Image  />
          </div>
        </div>
      </div>
    </section>
  );
}

function  Image() {
    return (
       
        <img
            src={comp}
            alt="about me"
            className="rounded-[40px] w-full h-full object-cover"
        />

    );
}

export default AboutMe