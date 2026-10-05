import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar } from "./Navbar";
import MouseOrb from "./components/mouseOrb";
import FooterComp from "./components/FooterComp";
import NotificationModal from "./components/NotificationModal";
import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import "sweetalert2/dist/sweetalert2.min.css";
import "./styles/sweetalert.css";
import { useAuthStore } from "./stores/authStore";
import PremiumSpinner from "./components/PremiumSpinner";
import { Analytics } from "@vercel/analytics/react";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const CompleteSignIn = lazy(() => import("./pages/CompleteSignIn"));
const Blog = lazy(() => import("./pages/blogpage"));
const BlogPostDetail = lazy(() => import("./pages/BlogPostDetail"));
const Admin = lazy(() => import("./pages/admin"));
const CreatePost = lazy(() => import("./dashboardUi/CreateNewPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthorPage = lazy(() => import("./pages/AuthorPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const PreviewPage = lazy(() => import("./pages/PreviewPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));

function App(): React.ReactElement {
  const initAuth = useAuthStore((state) => state.initAuth);
  const { pathname } = useLocation();
  // The editor is a full-screen workspace without the site chrome.
  const isEditor = pathname === "/edit" || pathname.startsWith("/edit/");

  useEffect(() => {
    const unsub = initAuth();
    return () => {
      if (unsub) unsub();
    };
  }, [initAuth]);

  return (
    <div className="App min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-content"
      >
        Skip to content
      </a>
      <MouseOrb />
      {!isEditor && <Navbar />}

      <div id="main-content" className="flex-1">
      {/* Suspense shows fallback while component loads */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <PremiumSpinner size="lg" variant="primary" text="Loading..." />
          </div>
        }
      >
        <Routes>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/complete-signin" element={<CompleteSignIn />} />
          <Route path="/blogpage" element={<Navigate to="/blog" replace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id/:slug?" element={<BlogPostDetail />} />
          <Route path="/author/:authorId" element={<AuthorPage />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/preview/:id" element={<PreviewPage />} />
          <Route path="/subscribe/confirm" element={<SubscriptionPage action="confirm" />} />
          <Route path="/unsubscribe" element={<SubscriptionPage action="unsubscribe" />} />
          <Route path="/privacy" element={<LegalPage page="privacy" />} />
          <Route path="/terms" element={<LegalPage page="terms" />} />
          <Route path="/create-post" element={<Navigate to="/edit" replace />} />
          <Route
            path="/edit/:postId?"
            element={
              <ProtectedRoute
                requireEmailVerified={true}
                requiredRole={["writer", "admin", "super_admin"]}
              >
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </div>

      {!isEditor && <FooterComp />}
      <NotificationModal />
      <Analytics />
    </div>
  );
}

export default App;
