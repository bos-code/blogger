import { useBlog } from "../components/BlogContext"


function AdminDashboard() {
    const {postCount} = useBlog()
   
    return (
        <div>
            <h1>{postCount} Posts</h1>
        </div>
    )
}

export default AdminDashboard
