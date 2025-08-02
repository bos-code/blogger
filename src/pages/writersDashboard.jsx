// pages/WriterDashboard.jsx
import TipTapEditor from "../components/TipTapEditor";

export default function WriterDashboard({ user }) {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Writer Dashboard</h2>
      <p>Hello, {user?.name}</p>
      <TipTapEditor authorId={user.uid} />
    </div>
  );
}
