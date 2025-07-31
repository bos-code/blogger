import { Routes, Route } from "react-router-dom";
import { Navbar } from "./Navbar";
import MouseOrb from "./components/mouseOrb";
import FooterComp from "./components/FooterComp";
import { lazy, Suspense } from "react";
import "./App.css";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const Blog = lazy(() => import("./pages/blogpage"));
const Admin = lazy(() => import("./pages/admin"));

function App() {
  return (
    <>
      <MouseOrb />
      <Navbar />

      {/* Suspense shows fallback while component loads */}
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/blogpage" element={<Blog />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>

      <FooterComp />
    </>
  );
}

export default App;
