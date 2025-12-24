import { usePosts } from "../hooks/usePosts";

function AdminDashboard() {
  const { data: posts = [] } = usePosts();
  const postCount = posts.length;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Admin Dashboard</h2>
      <p>Total Posts: {postCount}</p>
    </div>
  );
}

export default AdminDashboard;
