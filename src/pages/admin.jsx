// pages/Dashboard.jsx

import BlogContext, { useBlog } from "../components/BlogContext";

export default function Dashboard() {
  const { user, role } = useBlog
  if (!user) return <div className="p-10">Loading user...</div>;

  return (
    <h1>{role}</h1>
  )
}
