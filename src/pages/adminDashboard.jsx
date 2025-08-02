// pages/AdminDashboard.jsx
import UserManagement from "../components/userManagement";
import TipTapEditor from "../components/tiptapEditor";

export default function AdminDashboard({ user }) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>
      <p>Welcome Admin, {user.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4 bg-base-200 shadow-md">
          <h3 className="font-semibold text-lg mb-2">Write Blog</h3>
          <TipTapEditor authorId={user.uid} />
        </div>

        <div className="card p-4 bg-base-200 shadow-md">
          <UserManagement />
        </div>

        <div className="card p-4 bg-base-200 shadow-md">
          <h3 className="font-semibold text-lg mb-2">Analytics</h3>
          <iframe
            src="https://analytics.google.com/"
            className="w-full h-64 border rounded-lg"
            title="Analytics"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
