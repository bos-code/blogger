import { usePosts } from "../hooks/usePosts";

export default function AdminDashboard(): React.ReactElement {
  const { data: posts = [] } = usePosts();
  const postCount = posts.length;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Admin Dashboard</h2>
      <p>Total Posts: {postCount}</p>
    </div>
  );
}
