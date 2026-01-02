import { useState, FormEvent } from "react";
import { useAuthStore } from "../stores/authStore";
import { useUpdateUser } from "../hooks/useUsers";
import { useMutation } from "@tanstack/react-query";
import {
  updateProfile,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../firebaseconfig";
import { motion } from "framer-motion";
import { CompactSpinner } from "../components/PremiumSpinner";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhotoIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { showSuccess, showError } from "../utils/sweetalert";

export default function ProfileSetting(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const updateUser = useUpdateUser();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      email?: string;
      photoURL?: string;
    }) => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error("No user logged in");

      const updates: any = {};

      // Update Firebase Auth profile
      if (data.name && data.name !== user?.name) {
        await updateProfile(firebaseUser, { displayName: data.name });
        updates.name = data.name;
      }

      if (data.photoURL && data.photoURL !== user?.photoURL) {
        await updateProfile(firebaseUser, { photoURL: data.photoURL });
        updates.photoURL = data.photoURL;
      }

      if (data.email && data.email !== user?.email) {
        await updateEmail(firebaseUser, data.email);
        updates.email = data.email;
      }

      // Update Firestore user document
      if (Object.keys(updates).length > 0 && user?.uid) {
        await updateUser.mutateAsync({
          uid: user.uid,
          data: updates,
        });
      }
    },
    onSuccess: () => {
      showSuccess("Profile Updated", "Your profile has been updated successfully!");
      // Reload page to reflect changes
      window.location.reload();
    },
    onError: (error: Error) => {
      showError("Update Failed", error.message || "Failed to update profile.");
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error("No user logged in");
      }

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        data.currentPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, data.newPassword);
    },
    onSuccess: () => {
      showSuccess(
        "Password Updated",
        "Your password has been updated successfully!"
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      showError(
        "Password Update Failed",
        error.message || "Failed to update password. Please check your current password."
      );
    },
  });

  const handleProfileSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Password Mismatch", "New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError(
        "Password Too Short",
        "Password must be at least 6 characters long."
      );
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const fallbackImg = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
    user?.name || "user"
  )}`;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-base-content">Profile Settings</h1>
        <p className="text-base-content/70 mt-1">
          Manage your account information and security
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <button
          className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <UserIcon className="w-5 h-5 mr-2" />
          Profile Information
        </button>
        <button
          className={`tab ${activeTab === "password" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          <LockClosedIcon className="w-5 h-5 mr-2" />
          Change Password
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title mb-4">Update Profile</h2>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="avatar mb-4">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={profileData.photoURL || fallbackImg}
                    alt={user?.name || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <p className="text-sm text-base-content/70 text-center">
                Profile picture URL
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Photo URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <PhotoIcon className="w-4 h-4" />
                    Profile Picture URL
                  </span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={profileData.photoURL}
                  onChange={(e) =>
                    setProfileData({ ...profileData, photoURL: e.target.value })
                  }
                  placeholder="https://example.com/photo.jpg"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Leave empty to use default avatar
                  </span>
                </label>
              </div>

              <div className="card-actions justify-end mt-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <CompactSpinner size="sm" variant="primary" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <PencilIcon className="w-4 h-4" />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title mb-4">Change Password</h2>
            <p className="text-sm text-base-content/70 mb-6">
              Enter your current password and choose a new one
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter your current password"
                  required
                />
              </div>

              {/* New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter your new password (min. 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                />
                {passwordData.newPassword &&
                  passwordData.confirmPassword &&
                  passwordData.newPassword !== passwordData.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        Passwords do not match
                      </span>
                    </label>
                  )}
              </div>

              <div className="card-actions justify-end mt-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? (
                    <>
                      <CompactSpinner size="sm" variant="primary" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
