// pages/ReaderDashboard.jsx
import { useState } from "react";

export default function ReaderDashboard({ user }) {
  const [newName, setNewName] = useState("");

  const handleNameChange = () => {
    // Firebase displayName update goes here
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Reader Dashboard</h2>
      <p>Welcome, {user?.name}</p>

      <div className="space-y-2">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Change your name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleNameChange}>
          Update Name
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Watch List</h3>
        <p className="text-sm text-gray-500">No items yet.</p>
      </div>

      <button className="btn btn-outline btn-secondary mt-4">Manage Subscriptions</button>
    </div>
  );
}
