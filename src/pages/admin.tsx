import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import AdminDashboard from "../dashboardUi/AdminDashboard";
import Categories from "../dashboardUi/catigories";
import Post from "../dashboardUi/Post";
import ProfileSetting from "../dashboardUi/ProfileSetting";
import Users from "../dashboardUi/users";

export default function Dashboard(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const dashboardScreen = useUIStore((state) => state.dashboardScreen);
  const setDashboardScreen = useUIStore((state) => state.setDashboardScreen);
  const navigate = useNavigate();

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
      <div className=" flex justify-center items-center">Loading user...</div>
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

        <div className="drawer  lg:drawer-closed">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <label htmlFor="my-drawer-2" className="drawer-overlay">
            open
          </label>
          <div className="drawer-content flex flex-col items-center justify-center">
            {/* Page content here */}
            {dashboardScreen === "home" && <AdminDashboard />}
            {dashboardScreen === "posts" && <Post />}
            {dashboardScreen === "users" && <Users />}
            {dashboardScreen === "categories" && <Categories />}
            {dashboardScreen === "profile" && <ProfileSetting />}
          </div>
          <div className="drawer-side rounded-2xl">
            <label
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu shadow-lg text-base-content min-h-full w-70 bg-primary flex flex-col gap-12 p-4">
              {/* Sidebar content here */}
              <div
                onClick={handleBackToDashboard}
                className="flex  font-bold text-2xl items-center gap-2 mb-3 text-base-300 cursor-pointer"
              >
                <span>{"</>"}</span>
                <span className="capitalize  underline-offset-2 underline">
                  john dera
                </span>
              </div>
              <ul className="flex dash flex-col gap-6 text-accent-content">
                {role === "admin" && (
                  <>
                    <li>
                      <button
                        className="btn btn-dash border-2"
                        onClick={handleManagePosts}
                      >
                        <span> Manage Posts</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className="btn btn-dash border-2"
                        onClick={handleManageUsers}
                      >
                        <span> Manage Users</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className="btn btn-dash border-2"
                        onClick={handleManageCategories}
                      >
                        <span> Manage Categories</span>
                      </button>
                    </li>
                  </>
                )}
                <li>
                  <button
                    className="btn btn-dash border-2"
                    onClick={handleProfileSettings}
                  >
                    <span> Profile Settings</span>
                  </button>
                </li>
                <li>
                  <button
                    className="btn btn-dash border-2"
                    onClick={handleCreatePost}
                  >
                    <span>Create New Post</span>
                  </button>
                </li>
              </ul>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
