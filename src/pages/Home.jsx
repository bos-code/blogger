// src/pages/Home.jsx
import dera from "../assets/dera.png";
export default function Home() {
  return (
    <div className="p-6 text-center">
      <h1 className="heading--primary">developer</h1>
      <div className="hero__content flex items-center justify-center gap-40">
        <div className="about-me bg-base-100 p-4 rounded-lg shadow-md flex items-center justify-center gap-6">
          <img src={dera} alt=" dera's logo">
        </div>
        <div className="textbox">
          <div className="text"></div>
          <div className="stack"></div>
        </div>
      </div>
    </div>
  );
}
