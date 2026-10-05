import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ComputerDesktopIcon, MoonIcon, SunIcon, CheckIcon } from "@heroicons/react/24/outline";
import { auth, db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import { themes, useThemeStore, type ThemeMode } from "../stores/themeStore";
import { uploadImageToStorage } from "../services/storageService";
import { getAuthErrorMessage } from "../utils/authErrors";
import { showError, showSuccess } from "../utils/sweetalert";
import PageHeader from "../components/ui/PageHeader";
import Avatar from "../components/ui/Avatar";
import PasswordInput from "../components/auth/PasswordInput";

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="surface p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-base-content/65">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function ProfileSetting(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const emailVerified = useAuthStore((state) => state.emailVerified);
  const signOut = useAuthStore((state) => state.signOut);
  const setUser = useAuthStore((state) => state.setUser);
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    nickname: user?.nickname ?? "",
    photoURL: user?.photoURL ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const usesPassword = Boolean(
    auth.currentUser?.providerData.some((provider) => provider.providerId === "password")
  );

  // Nickname lives only in Firestore; refresh it in case the store is stale.
  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        const nickname = snapshot.data()?.nickname;
        if (typeof nickname === "string") setProfile((current) => ({ ...current, nickname }));
      })
      .catch(() => undefined);
  }, [user?.uid]);

  if (!user) return <></>;

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const name = profile.name.trim();
    if (name.length < 2) return showError("Name required", "Please enter your name.");
    setSavingProfile(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error("Please sign in again.");
      const photoURL = profile.photoURL.trim() || null;
      await updateProfile(firebaseUser, { displayName: name, photoURL });
      await updateDoc(doc(db, "users", user.uid), {
        name,
        nickname: profile.nickname.trim() || null,
        photoURL,
      });
      setUser({ ...user, name, nickname: profile.nickname.trim() || null, photoURL }, role ?? "user");
      showSuccess("Profile updated");
    } catch (error) {
      showError("Update failed", getAuthErrorMessage(error, "Your profile couldn't be saved."));
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToStorage(file, { userId: user.uid, folder: "post-images" });
      setProfile((current) => ({ ...current, photoURL: url }));
    } catch (error) {
      showError(
        "Upload failed",
        error instanceof Error && !error.message.startsWith("Firebase")
          ? error.message
          : "Photo uploads are available to writers. Paste an image URL instead."
      );
    } finally {
      setUploading(false);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    if (!passwords.current) return setPasswordError("Enter your current password.");
    if (passwords.next.length < 8) return setPasswordError("New password must be at least 8 characters.");
    if (passwords.next !== passwords.confirm) return setPasswordError("New passwords don't match.");

    const firebaseUser = auth.currentUser;
    if (!firebaseUser?.email) return setPasswordError("Please sign in again.");
    setSavingPassword(true);
    try {
      await reauthenticateWithCredential(
        firebaseUser,
        EmailAuthProvider.credential(firebaseUser.email, passwords.current)
      );
      await updatePassword(firebaseUser, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
      showSuccess("Password changed");
    } catch (error) {
      setPasswordError(getAuthErrorMessage(error, "Your password couldn't be changed."));
    } finally {
      setSavingPassword(false);
    }
  };

  const modes: Array<{ value: ThemeMode; label: string; icon: typeof SunIcon }> = [
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "system", label: "System", icon: ComputerDesktopIcon },
  ];

  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile & settings" description="Manage how you appear and how the site looks for you." />
      <div className="flex flex-col gap-6">
        <Card title="Profile" description="Shown on your posts and comments.">
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={profile.name} src={profile.photoURL} size="xl" />
              <div className="flex flex-col gap-2">
                <label className="btn btn-ghost btn-sm border border-base-300">
                  {uploading ? <span className="loading loading-spinner loading-xs" /> : "Upload photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => void uploadPhoto(event.target.files?.[0])} />
                </label>
                {profile.photoURL && (
                  <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => setProfile((current) => ({ ...current, photoURL: "" }))}>
                    Remove photo
                  </button>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className="field-label">Full name</label>
                <input id="profile-name" className="input w-full" value={profile.name} maxLength={80} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div>
                <label htmlFor="profile-nickname" className="field-label">
                  Display name <span className="font-normal text-base-content/55">(optional)</span>
                </label>
                <input id="profile-nickname" className="input w-full" value={profile.nickname} maxLength={30} onChange={(event) => setProfile((current) => ({ ...current, nickname: event.target.value }))} placeholder="Shown instead of your full name" />
              </div>
            </div>
            <div>
              <label htmlFor="profile-photo" className="field-label">Photo URL</label>
              <input id="profile-photo" type="url" className="input w-full" value={profile.photoURL} onChange={(event) => setProfile((current) => ({ ...current, photoURL: event.target.value }))} placeholder="https://…" />
            </div>
            <div>
              <label htmlFor="profile-email" className="field-label">Email</label>
              <input id="profile-email" type="email" className="input w-full" value={user.email ?? ""} disabled />
              <p className="mt-1 text-xs text-base-content/60">
                {emailVerified ? "Verified" : "Not verified"} · Role: <span className="capitalize">{role?.replace("_", " ")}</span>
              </p>
            </div>
            <button type="submit" className="btn btn-primary self-start" disabled={savingProfile || uploading}>
              {savingProfile && <span className="loading loading-spinner loading-xs" />}
              Save profile
            </button>
          </form>
        </Card>

        <Card title="Appearance" description="Applies across the whole site on this device.">
          <fieldset>
            <legend className="field-label">Colour mode</legend>
            <div className="grid grid-cols-3 gap-2">
              {modes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  aria-pressed={mode === value}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm ${
                    mode === value ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-5">
            <legend className="field-label">Dark mode palette</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.values(themes).map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => setTheme(theme.name)}
                  aria-pressed={currentTheme === theme.name}
                  className={`relative rounded-xl border-2 p-2 text-left ${
                    currentTheme === theme.name ? "border-primary" : "border-base-300 hover:border-primary/50"
                  }`}
                >
                  <span className="flex h-12 overflow-hidden rounded-lg" aria-hidden="true">
                    <span className="flex-1" style={{ background: theme.colors.base100 }} />
                    <span className="w-1/3" style={{ background: theme.colors.primary }} />
                    <span className="w-1/6" style={{ background: theme.colors.accent }} />
                  </span>
                  <span className="mt-1.5 block text-xs font-medium">{theme.displayName}</span>
                  {currentTheme === theme.name && (
                    <CheckIcon className="absolute right-2 top-2 h-4 w-4 rounded-full bg-primary p-0.5 text-primary-content" />
                  )}
                </button>
              ))}
            </div>
          </fieldset>
        </Card>

        <Card
          title="Password"
          description={usesPassword ? "Confirm your current password to choose a new one." : "You sign in with Google, Apple or an email link, so there's no password to change."}
        >
          {usesPassword && (
            <form onSubmit={changePassword} className="flex flex-col gap-4">
              <div>
                <label htmlFor="password-current" className="field-label">Current password</label>
                <PasswordInput id="password-current" autoComplete="current-password" value={passwords.current} onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="password-new" className="field-label">New password</label>
                  <PasswordInput id="password-new" autoComplete="new-password" value={passwords.next} onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))} />
                </div>
                <div>
                  <label htmlFor="password-confirm" className="field-label">Confirm new password</label>
                  <PasswordInput id="password-confirm" autoComplete="new-password" value={passwords.confirm} onChange={(event) => setPasswords((current) => ({ ...current, confirm: event.target.value }))} />
                </div>
              </div>
              {passwordError && <p role="alert" className="text-sm text-error">{passwordError}</p>}
              <button type="submit" className="btn btn-primary self-start" disabled={savingPassword}>
                {savingPassword && <span className="loading loading-spinner loading-xs" />}
                Change password
              </button>
            </form>
          )}
        </Card>

        <Card title="Session">
          <button
            type="button"
            className="btn btn-ghost border border-base-300 text-error"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
          >
            Log out
          </button>
        </Card>
      </div>
    </div>
  );
}
