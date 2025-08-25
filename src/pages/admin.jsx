// pages/Dashboard.jsx
import WriterDashboard from "./writersDashboard";
import AdminDashboard from "./adminDashboard";
import BlogContext, { useBlog } from "../components/BlogContext";

export default function Dashboard() {
  const { user, role } = useBlog
  if (!user) return <div className="p-10">Loading user...</div>;


}
