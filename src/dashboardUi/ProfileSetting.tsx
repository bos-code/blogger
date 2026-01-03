import { useState, FormEvent, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { motion } from "framer-motion";
import PremiumSpinner from "../components/PremiumSpinner";
import {
  UserIcon,
  EnvelopeIcon,
  PhotoIcon,
  KeyIcon,
  PaintBrushIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { showSuccess, showError } from "../utils/sweetalert";
import { useThemeStore, themes, type ThemeName } from "../stores/themeStore";

export default function ProfileSetting(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <PremiumSpinner size="lg" variant="primary" text="Loading profile..." />
      </div>
    );
  }

  const handleProfileUpdate = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updates: any = {};

      // Update Firebase Auth profile
      if (formData.name !== user.name) {
        await updateProfile(auth.currentUser!, {
          displayName: formData.name,
        });
        updates.name = formData.name;
      }

      if (formData.photoURL !== user.photoURL && formData.photoURL) {
        await updateProfile(auth.currentUser!, {
          photoURL: formData.photoURL,
        });
        updates.photoURL = formData.photoURL;
      }

      // Update Firestore user document
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "users", user.uid), updates);
      }

      // Update local state
      useAuthStore.getState().setUser(
        {
          ...user,
          name: formData.name,
          photoURL: formData.photoURL || user.photoURL,
        },
        useAuthStore.getState().role!
      );

      showSuccess("Profile Updated", "Your profile has been updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      showError(
        "Update Failed",
        "There was an error updating your profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Password Mismatch", "New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError("Invalid Password", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // Note: Firebase Auth requires re-authentication to change password
      // This is a simplified version - in production, you'd need to re-authenticate first
      const { updatePassword } = await import("firebase/auth");
      await updatePassword(auth.currentUser!, passwordData.newPassword);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showSuccess("Password Changed", "Your password has been changed successfully!");
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.code === "auth/requires-recent-login") {
        showError(
          "Re-authentication Required",
          "Please log out and log back in to change your password."
        );
      } else {
        showError(
          "Password Change Failed",
          error.message || "There was an error changing your password."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-base-content">Profile Settings</h1>
        <p className="text-base-content/70 mt-1">
          Manage your account information and preferences
        </p>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body">
          <h2 className="text-2xl font-semibold text-base-content mb-4 flex items-center gap-2">
            <UserIcon className="w-6 h-6" />
            Profile Information
          </h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Display Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email
                </span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                value={formData.email}
                disabled
                title="Email cannot be changed"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Email cannot be changed
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <PhotoIcon className="w-4 h-4" />
                  Profile Photo URL
                </span>
              </label>
              <input
                type="url"
                className="input input-bordered"
                value={formData.photoURL}
                onChange={(e) =>
                  setFormData({ ...formData, photoURL: e.target.value })
                }
                placeholder="https://example.com/photo.jpg"
              />
              {formData.photoURL && (
                <div className="mt-2">
                  <img
                    src={formData.photoURL}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body">
          <h2 className="text-2xl font-semibold text-base-content mb-4 flex items-center gap-2">
            <KeyIcon className="w-6 h-6" />
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Current Password</span>
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
                placeholder="Enter current password"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">New Password</span>
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
                placeholder="Enter new password (min 6 characters)"
                minLength={6}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm New Password</span>
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
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-error"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
