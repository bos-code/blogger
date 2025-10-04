// pages/Dashboard.jsx

import  { useBlog } from "../components/BlogContext";



export default function Dashboard() {
  const { user, role } = useBlog()
  const { photoURL, name } = user || {};
  if (!user) return <div className="p-10">Loading user...</div>;

  const fallbackImg = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
    name || "anime"
  )}`;


  return (
    <div className=" flex -m-12 px-20  mb-10 items-center justify-center gap-2 bg- min-h-svh ">


      <div
        className=" w-dvw  h-dvh rounded-4xl border-l-2
    border-r-4 border-primary glassy overflow-hidden    shadow-2xl"
      >
        <div className="drawer  lg:drawer-open">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="post">h</div>
            {/* Page content here */}
            <label
              htmlFor="my-drawer-2"
              className="btn btn-primary drawer-button lg:hidden"
            >
              Open drawer
            </label>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu shadow-ce text-base-content min-h-full w-70 bg-primary flex flex-col p-4">
              {/* Sidebar content here */}
            
              <li>
                <a className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
                    <img src={photoURL ||
                      fallbackImg} alt={name} />
                  </div>
                </a>
              </li>
              <li>
                <a className="text-lg font-bold">{name}</a>
              </li>
              <li>
                <a className="text-sm italic">{role}</a>
              </li>
              <div className="divider"></div>
              <li>
               
              </li>
              {role === "admin" && (
                < >
                  <li>
                    <button onClick={handleManagePosts}>Manage Posts</button>
                  </li>
                  <li>
                    <button onClick={handleManageUsers}>Manage Users</button>
                  </li>
                  <li>
                    <button onClick={handleManageCategories}>Manage Categories</button>
                    
                  </li>
                  </>
              )}
            <li>
              <button onClick={handleProfileSettings}>Profile Settings</button>
            </li>
            <li>
              <button onClick={handleCreatePost}>Create New Post</button>
            </li>
          </ul>
              

          </div>
        </div>
      </div>
    </div>
  );
}
