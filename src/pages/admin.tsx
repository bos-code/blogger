import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import AdminDashboard from "../dashboardUi/AdminDashboard";
import Categories from "../dashboardUi/catigories";
import Post from "../dashboardUi/Post";
import ProfileSetting from "../dashboardUi/ProfileSetting";
import Users from "../dashboardUi/users";
import SuperAdminPanel from "../dashboardUi/SuperAdminPanel";
import PremiumSpinner from "../components/PremiumSpinner";
import { useRole } from "../hooks/useRole";
import {
  HomeIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { showSuccess } from "../utils/sweetalert";

export default function Dashboard(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const signOut = useAuthStore((state) => state.signOut);

  const {
    isAdmin,
    isSuperAdmin,
    canManagePosts,
    canManageUsers,
    canManageCategories,
    canCreate,
  } = useRole();

  const dashboardScreen = useUIStore((state) => state.dashboardScreen);
  const setDashboardScreen = useUIStore((state) => state.setDashboardScreen);

  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /** Sidebar state (persistent) */
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("dashboard-sidebar-open");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("dashboard-sidebar-open", String(sidebarOpen));
  }, [sidebarOpen]);

  /** External navigation hook */
  useEffect(() => {
    const handler = (event: CustomEvent) => {
      if (event.detail?.screen) {
        setDashboardScreen(event.detail.screen);
      }
    };

    window.addEventListener("set-dashboard-screen", handler as EventListener);
    return () =>
      window.removeEventListener(
        "set-dashboard-screen",
        handler as EventListener
      );
  }, [setDashboardScreen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      showSuccess("Logged Out", "You have been successfully logged out.");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <PremiumSpinner size="lg" variant="primary" text="Loading user..." />
      </div>
    );
  }

  const { photoURL, name } = user;

  const getUserInitials = (name?: string | null) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <div className="flex -m-12 px-20 mb-10 bg-base-200 min-h-svh">
      <div className="w-dvw h-dvh glassy overflow-hidden p-10 pb-80 rounded-4xl shadow-2xl relative">
        {/* Profile */}
        <div className="absolute top-5 right-5 flex gap-3">
          <div className="w-12 h-12 rounded-full ring ring-primary overflow-hidden">
            {photoURL ? (
              <img src={photoURL} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center">
                {getUserInitials(name)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{name}</h2>
            <p className="text-sm capitalize text-secondary">{role}</p>
          </div>
        </div>

        <div className={`drawer ${sidebarOpen ? "lg:drawer-open" : ""}`}>
          <input
            type="checkbox"
            className="drawer-toggle"
            checked={sidebarOpen}
            onChange={(e) => setSidebarOpen(e.target.checked)}
          />

          {/* CONTENT */}
          <div className="drawer-content flex justify-center items-center">
            <label className="btn btn-circle btn-primary lg:hidden fixed top-4 left-4">
              <Bars3Icon className="w-6 h-6" />
            </label>

            {(isAdmin || isSuperAdmin) && dashboardScreen === "home" && (
              <AdminDashboard />
            )}

            {!isAdmin && !isSuperAdmin && dashboardScreen === "home" && (
              <div className="card bg-base-100 p-6">
                <h2 className="text-xl font-bold">Welcome</h2>
                <p>Select an option from the sidebar.</p>
              </div>
            )}

            {dashboardScreen === "posts" && canManagePosts && <Post />}
            {dashboardScreen === "users" && canManageUsers && <Users />}
            {dashboardScreen === "categories" && canManageCategories && (
              <Categories />
            )}
            {dashboardScreen === "super_admin" && isSuperAdmin && (
              <SuperAdminPanel />
            )}
            {dashboardScreen === "profile" && <ProfileSetting />}
          </div>

          {/* SIDEBAR */}
          <div className="drawer-side">
            <label className="drawer-overlay" />
            <ul className="menu w-72 bg-primary p-4 gap-6">
              {(isAdmin || isSuperAdmin) && (
                <li>
                  <button onClick={() => setDashboardScreen("home")}>
                    <HomeIcon className="w-5 h-5" /> Admin Home
                  </button>
                </li>
              )}

              {canManagePosts && (
                <li>
                  <button onClick={() => setDashboardScreen("posts")}>
                    Manage Posts
                  </button>
                </li>
              )}

              {canManageUsers && (
                <li>
                  <button onClick={() => setDashboardScreen("users")}>
                    Manage Users
                  </button>
                </li>
              )}

              {canManageCategories && (
                <li>
                  <button onClick={() => setDashboardScreen("categories")}>
                    Manage Categories
                  </button>
                </li>
              )}

              {isSuperAdmin && (
                <li>
                  <button onClick={() => setDashboardScreen("super_admin")}>
                    <ShieldCheckIcon className="w-5 h-5" /> Super Admin
                  </button>
                </li>
              )}

              <li>
                <button onClick={() => setDashboardScreen("profile")}>
                  Profile Settings
                </button>
              </li>

              {canCreate && (
                <li>
                  <button onClick={() => navigate("/create-post")}>
                    Create Post
                  </button>
                </li>
              )}

              <li className="mt-auto">
                <button
                  className="text-error"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
