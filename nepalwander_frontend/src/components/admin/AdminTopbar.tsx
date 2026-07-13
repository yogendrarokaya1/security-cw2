"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/destinations": "Destinations",
  "/admin/destinations/new": "New Destination",
  "/admin/packages": "Packages",
  "/admin/packages/new": "New Package",
  "/admin/guides": "Guides",
  "/admin/guides/new": "New Guide",
  "/admin/bookings": "Bookings",
  "/admin/users": "Users",
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getTitle = () => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname.includes("/edit")) return "Edit";
    return "Admin";
  };

  return (
    <header
      className="h-16 px-6 flex items-center justify-between border-b shrink-0"
      style={{
        backgroundColor: "white",
        borderColor: "var(--color-outline-variant)",
      }}
    >
      <h1 className="text-lg font-bold" style={{ color: "var(--color-on-surface)" }}>
        {getTitle()}
      </h1>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs" style={{ color: "var(--color-outline)" }}>
            Super Admin
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <button
          onClick={logout}
          className="ml-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{ color: "var(--color-danger)", backgroundColor: "rgba(216,90,48,0.08)" }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}