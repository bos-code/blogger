import Discord from "../assets/discord";
import Github from "../assets/github";
import IconInstagram from "../assets/icon-instagram";

function FooterComp(): JSX.Element {
  return (
    <footer className="footer mt-auto  sm:footer-horizontal bg-base-200 border-t-1  flex justify-between border-base-300 items-center px-32 py-4  text-base  ubuntu-light ">
      <aside className="grid-flow-col items-center  text-base  ubuntu-light ">
        <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
      </aside>
      <div className="privacy">
        <ul className="flex  items-center justify-center gap-8">
          <li>
            <a href="#" className="">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="#" className="">
              Terms & Conditions
            </a>
          </li>
        </ul>
      </div>
      <div className="media">
        <ul className=" flex items-center justify-center gap-8">
          <li className="">
            <a
              href=" #"
              className=" p-2 inline-block bg-secondary rounded-full"
            >
              <IconInstagram />
            </a>
          </li>
          <li className="">
            <a
              href=" #"
              className=" p-2  inline-block bg-secondary rounded-full"
            >
              <Discord />
            </a>
          </li>
          <li className="">
            <a
              href=" #"
              className=" p-2 inline-block bg-secondary rounded-full"
            >
              <Github />
            </a>
          </li>
        </ul>
      </div>
      <div className="developer">
        <h4 className="text-base  ubuntu-light">
          Developed by{" "}
          <span className=" underline-offset-4 text-secondary underline">
            Chidera Okonkwo
          </span>
        </h4>
      </div>
    </footer>
  );
}

export default FooterComp;
