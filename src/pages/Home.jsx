// src/pages/Home.jsx
// src/pages/Home.jsx
import { auth } from "../firebaseconfig";

export default function Home() {
  const user = auth.currentUser;
  const name = user?.displayName || "Guest";

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold">
        Welcome, <span className="text-primary">{name}</span>!
      </h1>
    </div>
  );
}
