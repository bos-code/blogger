import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import AdminDashboard from "../dashboardUi/AdminDashboard";
import Categories from "../dashboardUi/catigories";
import Post from "../dashboardUi/Post";
import ProfileSetting from "../dashboardUi/ProfileSetting";
import Users from "../dashboardUi/users";
import PremiumSpinner from "../components/PremiumSpinner";
import { useRole } from "../hooks/useRole";
import { HomeIcon, XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";

export default function Dashboard(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const {
    isAdmin,
    canManagePosts,
    canManageUsers,
    canManageCategories,
    canCreate,
  } = useRole();
  const dashboardScreen = useUIStore((state) => state.dashboardScreen);
  const setDashboardScreen = useUIStore((state) => state.setDashboardScreen);
  const navigate = useNavigate();

  // Sidebar state - stays open by default, persists in localStorage
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("dashboard-sidebar-open");
    return saved !== null ? saved === "true" : true; // Default to open
  });

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("dashboard-sidebar-open", String(sidebarOpen));
  }, [sidebarOpen]);

  function handleCreatePost(): void {
    navigate("/create-post");
  }
  function handleManagePosts(): void {
    setDashboardScreen("posts");
  }

  function handleManageUsers(): void {
    setDashboardScreen("users");
  }

  function handleManageCategories(): void {
    setDashboardScreen("categories");
  }

  function handleProfileSettings(): void {
    setDashboardScreen("profile");
  }

  function handleBackToDashboard(): void {
    setDashboardScreen("home");
  }

  const { photoURL, name } = user || {};
  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <PremiumSpinner size="lg" variant="primary" text="Loading user..." />
      </div>
    );

  const fallbackImg = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
    name || "anime"
  )}`;

  return (
    <div className=" flex -m-12 px-20  mb-10 items-center justify-center gap-2 bg-base-200 min-h-svh ">
      <div
        className=" w-dvw  h-dvh border-l-2
    border-r-4 border-primary glassy overflow-hidden p-10 pb-80 rounded-4xl shadow-2xl relative"
      >
        <div className="profile absolute top-5 right-5 flex items-center justify-center">
          <img
            src={photoURL || fallbackImg}
            alt="Profile"
            className=" size-13 rounded-full object-cover mb-2"
          />
          <div className="ml-4">
            {" "}
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-sm text-secondary capitalize">{role}</p>
          </div>
        </div>

        <div className={`drawer ${sidebarOpen ? "lg:drawer-open" : "lg:drawer-closed"}`}>
          <input
            id="my-drawer-2"
            type="checkbox"
            className="drawer-toggle"
            checked={sidebarOpen}
            onChange={(e) => setSidebarOpen(e.target.checked)}
          />
          <div className="drawer-content flex flex-col items-center justify-center">
            {/* Toggle button for mobile */}
            <label
              htmlFor="my-drawer-2"
              className="btn btn-primary btn-circle fixed top-4 left-4 z-50 lg:hidden"
            >
              <Bars3Icon className="w-6 h-6" />
            </label>
            {/* Page content here */}
            {dashboardScreen === "home" && isAdmin && <AdminDashboard />}
            {dashboardScreen === "home" && !isAdmin && (
              <div className="w-full max-w-7xl mx-auto p-6">
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body text-center">
                    <h2 className="text-2xl font-bold text-base-content mb-4">
                      Welcome to Dashboard
                    </h2>
                    <p className="text-base-content/70">
                      Select an option from the sidebar to get started.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {dashboardScreen === "posts" && canManagePosts && <Post />}
            {dashboardScreen === "users" && canManageUsers && <Users />}
            {dashboardScreen === "categories" && canManageCategories && <Categories />}
            {dashboardScreen === "profile" && <ProfileSetting />}
          </div>
          <div className="drawer-side rounded-2xl">
            <label
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
              onClick={() => setSidebarOpen(false)}
            ></label>
            <ul className="menu shadow-lg text-base-content min-h-full w-70 bg-primary flex flex-col gap-12 p-4 relative">
              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-base-content hover:bg-base-content/20 lg:flex hidden"
                aria-label="Close sidebar"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Sidebar content here */}
              <div
                onClick={handleBackToDashboard}
                className="flex font-bold text-2xl items-center gap-2 mb-3 text-base-300 cursor-pointer"
              >
                <span>{"</>"}</span>
                <span className="capitalize underline-offset-2 underline">
                  {name || "john dera"}
                </span>
              </div>
              <ul className="flex dash flex-col gap-6 text-accent-content">
                {/* Admin Home - Only visible to admins */}
                {isAdmin && (
                  <li>
                    <button
                      className="btn btn-dash border-2"
                      onClick={handleBackToDashboard}
                    >
                      <HomeIcon className="w-5 h-5" />
                      <span> Admin Home</span>
                    </button>
                  </li>
                )}

                {/* Manage Posts - Only visible to admins */}
                {canManagePosts && (
                  <li>
                    <button
                      className="btn btn-dash border-2"
                      onClick={handleManagePosts}
                    >
                      <span> Manage Posts</span>
                    </button>
                  </li>
                )}

                {/* Manage Users - Only visible to admins */}
                {canManageUsers && (
                  <li>
                    <button
                      className="btn btn-dash border-2"
                      onClick={handleManageUsers}
                    >
                      <span> Manage Users</span>
                    </button>
                  </li>
                )}

                {/* Manage Categories - Only visible to admins */}
                {canManageCategories && (
                  <li>
                    <button
                      className="btn btn-dash border-2"
                      onClick={handleManageCategories}
                    >
                      <span> Manage Categories</span>
                    </button>
                  </li>
                )}

                {/* Profile Settings - Available to all authenticated users */}
                <li>
                  <button
                    className="btn btn-dash border-2"
                    onClick={handleProfileSettings}
                  >
                    <span> Profile Settings</span>
                  </button>
                </li>

                {/* Create New Post - Available to writers and admins */}
                {canCreate && (
                  <li>
                    <button
                      className="btn btn-dash border-2"
                      onClick={handleCreatePost}
                    >
                      <span>Create New Post</span>
                    </button>
                  </li>
                )}
              </ul>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
