import { useNavigate } from "react-router-dom";
import { useEffect, useState, type ComponentType } from "react";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import AdminDashboard from "../dashboardUi/AdminDashboard";
import WriterOverview from "../dashboardUi/WriterOverview";
import Categories from "../dashboardUi/catigories";
import Post from "../dashboardUi/Post";
import ProfileSetting from "../dashboardUi/ProfileSetting";
import Users from "../dashboardUi/users";
import SuperAdminPanel from "../dashboardUi/SuperAdminPanel";
import Avatar from "../components/ui/Avatar";
import { useRole } from "../hooks/useRole";
import {
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UsersIcon,
  TagIcon,
  UserCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { showSuccess } from "../utils/sweetalert";
import type { UIState } from "../types";

type Screen = UIState["dashboardScreen"];

interface NavItem {
  screen: Screen;
  label: string;
  icon: ComponentType<{ className?: string }>;
  visible: boolean;
}

export default function Dashboard(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const signOut = useAuthStore((state) => state.signOut);
  const {
    isAdmin,
    isSuperAdmin,
    canManagePosts,
    canManageUsers,
    canManageCategories,
    canCreate,
  } = useRole();

  const dashboardScreen = useUIStore((state) => state.dashboardScreen);
  const setDashboardScreen = useUIStore((state) => state.setDashboardScreen);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems: NavItem[] = [
    { screen: "home", label: "Overview", icon: HomeIcon, visible: true },
    {
      screen: "posts",
      label: canManagePosts ? "Manage Posts" : "My Posts",
      icon: DocumentTextIcon,
      visible: canManagePosts || canCreate,
    },
    {
      screen: "users",
      label: "Users",
      icon: UsersIcon,
      visible: canManageUsers,
    },
    {
      screen: "categories",
      label: "Categories",
      icon: TagIcon,
      visible: canManageCategories,
    },
    {
      screen: "super_admin",
      label: "Super Admin",
      icon: ShieldCheckIcon,
      visible: isSuperAdmin,
    },
    {
      screen: "profile",
      label: "Profile & Settings",
      icon: UserCircleIcon,
      visible: true,
    },
  ];
  const visibleItems = navItems.filter((item) => item.visible);
  const activeScreen = visibleItems.some(
    (item) => item.screen === dashboardScreen
  )
    ? dashboardScreen
    : "home";
  const activeLabel =
    visibleItems.find((item) => item.screen === activeScreen)?.label ??
    "Overview";

  // Close the mobile drawer with Escape and keep the page from scrolling behind it.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const selectScreen = (screen: Screen) => {
    setDashboardScreen(screen);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0 });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      showSuccess("Logged Out", "You have been successfully logged out.");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return <></>;

  const sidebar = (
    <nav aria-label="Dashboard" className="flex h-full flex-col gap-1 p-4">
      <div className="flex items-center gap-3 rounded-2xl bg-base-200 p-3 mb-4">
        <Avatar name={user.name} src={user.photoURL} size="md" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{user.name || "Your account"}</p>
          <p className="truncate text-xs capitalize text-base-content/60">
            {role?.replace("_", " ")}
          </p>
        </div>
      </div>

      {canCreate && (
        <button
          type="button"
          className="btn btn-primary mb-3 justify-start gap-2"
          onClick={() => navigate("/edit")}
        >
          <PencilSquareIcon className="h-5 w-5" />
          New post
        </button>
      )}

      <ul className="flex flex-col gap-1">
        {visibleItems.map(({ screen, label, icon: Icon }) => {
          const isActive = activeScreen === screen;
          return (
            <li key={screen}>
              <button
                type="button"
                onClick={() => selectScreen(screen)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-base-content/75 hover:bg-base-200 hover:text-base-content"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error hover:bg-error/10 disabled:opacity-50"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
        {isLoggingOut ? "Logging out..." : "Log out"}
      </button>
    </nav>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-8">
      <div className="flex gap-6 lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 h-[calc(100dvh-7rem)] rounded-2xl border border-base-300 bg-base-100">
            {sidebar}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile header */}
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <button
              type="button"
              className="btn btn-square btn-ghost border border-base-300"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open dashboard menu"
              aria-expanded={mobileNavOpen}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <p className="font-semibold">{activeLabel}</p>
          </div>

          <main>
            {activeScreen === "home" &&
              (isAdmin ? <AdminDashboard /> : <WriterOverview />)}
            {activeScreen === "posts" && <Post />}
            {activeScreen === "users" && <Users />}
            {activeScreen === "categories" && <Categories />}
            {activeScreen === "super_admin" && <SuperAdminPanel />}
            {activeScreen === "profile" && <ProfileSetting />}
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard menu">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/50"
            aria-label="Close dashboard menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-base-100 shadow-2xl">
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-sm absolute right-3 top-3"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close dashboard menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="h-full pt-10">{sidebar}</div>
          </div>
        </div>
      )}
    </div>
  );
}
