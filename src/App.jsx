import { Routes, Route } from "react-router-dom";
import { Navbar } from "./Navbar";
import Home from "./pages/Home";
import Login from "./pages/login";import "./App.css";

import Signup from "./pages/signup";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} /> {/* 👈 This fixes the "/" error */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
