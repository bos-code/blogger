import { Routes, Route } from "react-router-dom";
import { Navbar } from "./Navbar";
import Home from "./pages/Home";
import Login from "./pages/login";
import "./App.css";

import Signup from "./pages/signup";
import Blog from "./pages/blogpage";
import Admin from "./pages/admin";
import MouseOrb from "./mouseOrb";

function App() {
  return (
    <>
    
    <MouseOrb />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />{" "}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/blogpage" element={<Blog />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;
