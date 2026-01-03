import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar } from "./Navbar";
import MouseOrb from "./components/mouseOrb";
import FooterComp from "./components/FooterComp";
import ApprovalModal from "./components/ApprovalModal";
import NotificationModal from "./components/NotificationModal";
import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import "sweetalert2/dist/sweetalert2.min.css";
import "./styles/sweetalert.css";
import { useAuthStore } from "./stores/authStore";
import EditPost from "./dashboardUi/EditPost";
import CreatePost from "./dashboardUi/CreateNewPost";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Blog = lazy(() => import("./pages/blogpage"));
const BlogPostDetail = lazy(() => import("./pages/BlogPostDetail"));
const Admin = lazy(() => import("./pages/admin"));

function App(): React.ReactElement {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    const unsub = initAuth();
    return () => {
      if (unsub) unsub();
    };
  }, [initAuth]);

  return (
    <div className="App min-h-screen flex flex-col  ">
      <MouseOrb />
      <Navbar />

      {/* Suspense shows fallback while component loads */}
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/blogpage" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPostDetail />} />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute requireEmailVerified={true}>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireEmailVerified={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>

      <FooterComp />
      <ApprovalModal />
      <NotificationModal />
    </div>
  );
}

export default App;








