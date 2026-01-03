import { useLocation, useNavigate } from "react-router-dom";
import CreatePost from "./CreateNewPost";

/**
 * EditPost component - Wrapper that passes edit state to CreatePost
 * The CreatePost component handles both creating and editing posts
 */
export default function EditPost(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  
  // If no edit state, redirect to create post
  if (!location.state) {
    navigate("/create-post");
    return <div>Redirecting...</div>;
  }

  // Pass the edit state to CreatePost component
  return <CreatePost />;
}
