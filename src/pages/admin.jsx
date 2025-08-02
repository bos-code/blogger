// pages/Dashboard.jsx
import ReaderDashboard from "./readersDashboard";
import WriterDashboard from "./writersDashboard";
import AdminDashboard from "./adminDashboard";

export default function Dashboard({ user, role }) {
  if (!user) return <div className="p-10">Loading user...</div>;

  switch (role) {
    case "admin":
      return <AdminDashboard user={user} />;
    case "writer":
      return <WriterDashboard user={user} />;
    default:
      return <AdminDashboard user={user} />;
  }
}
