/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { bookingsApi } from "@/lib/api/bookings";
import { authApi } from "@/lib/api/auth";
import { Booking, Package } from "@/types";

const NAV_ITEMS = [
  { key: "trips", label: "My Trips", icon: "🗺️" },
  { key: "bookings", label: "Bookings", icon: "📅" },
  { key: "wishlist", label: "Wishlist", icon: "❤️" },
  { key: "documents", label: "Documents", icon: "📄" },
  { key: "reviews", label: "Reviews", icon: "⭐" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: "rgba(29,158,117,0.1)", color: "var(--color-success)" },
  pending: { bg: "rgba(240,165,0,0.1)", color: "var(--color-warning)" },
  cancelled: { bg: "rgba(216,90,48,0.1)", color: "var(--color-danger)" },
  completed: { bg: "rgba(24,95,165,0.1)", color: "var(--color-info)" },
};

export default function DashboardPage() {
  const { user, loading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("trips");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    nationality: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? "",
        nationality: user.nationality ?? "",
      });
      bookingsApi.getMyBookings()
        .then(setBookings)
        .finally(() => setBookingsLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const upcomingBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const pastBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");
  const upcoming = upcomingBookings[0] ?? null;

  const getPackage = (b: Booking): Package | null =>
    typeof b.package === "object" ? b.package as Package : null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const updated = await authApi.updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone || undefined,
        nationality: profileForm.nationality || undefined,
      });
      updateUser(updated);
      setEditing(false);
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setProfileError(msg ?? "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const inputClass = "input-field";
  const labelClass = "block text-xs font-semibold mb-1.5";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface-low)" }}>
      <div className="container-main py-8">
        <div className="flex gap-6 items-start">

          {/* ── SIDEBAR ── */}
          <aside className="shrink-0 sticky top-6" style={{ width: 200 }}>
            <div className="card" style={{ padding: 16 }}>
              {/* User avatar */}
              <div className="flex flex-col items-center gap-2 pb-4 mb-4" style={{ borderBottom: "1px solid var(--color-surface-high)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "var(--color-primary)" }}>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs capitalize" style={{ color: "var(--color-outline)" }}>{user.role}</p>
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-outline)" }}>
                My Account
              </p>
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveNav(item.key)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all"
                    style={{
                      backgroundColor: activeNav === item.key ? "var(--color-primary)" : "transparent",
                      color: activeNav === item.key ? "white" : "var(--color-on-surface-variant)",
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="my-2" style={{ borderTop: "1px solid var(--color-surface-high)" }} />
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all"
                  style={{ color: "var(--color-danger)" }}
                >
                  <span>🚪</span>
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Welcome */}
            <div>
              <h1 className="font-bold text-xl mb-0.5" style={{ color: "var(--color-on-surface)" }}>
                Hello, {user.firstName}! 👋
              </h1>
              <p className="text-sm" style={{ color: "var(--color-outline)" }}>
                {bookingsLoading ? "Loading your trips..." :
                  bookings.length === 0 ? "You have no bookings yet. Explore Nepal!" :
                    `You have ${upcomingBookings.length} upcoming trip${upcomingBookings.length !== 1 ? "s" : ""}.`}
              </p>
            </div>

            {/* ── MY TRIPS TAB ── */}
            {activeNav === "trips" && (
              <>
                <div className="flex gap-5 items-start">
                  {/* Upcoming trip */}
                  <div className="flex-1">
                    {bookingsLoading ? (
                      <div className="card flex items-center justify-center" style={{ height: 200 }}>
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : upcoming ? (
                      <div className="card" style={{ padding: 20 }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                            UPCOMING TRIP
                          </span>
                          <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                            style={{ backgroundColor: STATUS_COLORS[upcoming.status]?.bg, color: STATUS_COLORS[upcoming.status]?.color }}>
                            ✓ {upcoming.status.charAt(0).toUpperCase() + upcoming.status.slice(1)}
                          </span>
                        </div>
                        <p className="font-semibold text-sm mb-3" style={{ color: "var(--color-on-surface)" }}>
                          {getPackage(upcoming)?.title ?? "Package"} — {new Date(upcoming.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <div className="flex gap-3 mb-4">
                          <div className="relative rounded-xl overflow-hidden shrink-0" style={{ width: 120, height: 90 }}>
                            {getPackage(upcoming)?.coverImage ? (
                              <Image src={getPackage(upcoming)!.coverImage} alt="Trip" fill sizes="120px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full" style={{ backgroundColor: "var(--color-surface-high)" }} />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            {[
                              { label: "DURATION", value: `${getPackage(upcoming)?.duration ?? "—"} Days` },
                              { label: "GROUP SIZE", value: `${upcoming.groupSize ?? upcoming.travelers?.length ?? 1} Travelers` },
                              { label: "BOOKING #", value: upcoming.bookingNumber ?? `#${upcoming._id.slice(-6).toUpperCase()}` },
                              { label: "TOTAL PAID", value: `NPR ${upcoming.totalPrice?.toLocaleString() ?? "—"}` },
                            ].map((info) => (
                              <div key={info.label} className="p-2 rounded-lg" style={{ backgroundColor: "var(--color-surface-low)" }}>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--color-outline)" }}>{info.label}</p>
                                <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{info.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/packages/${getPackage(upcoming)?.slug ?? ""}`} className="btn-primary flex-1 text-center text-sm" style={{ height: 40, fontSize: 13 }}>
                            View Details
                          </Link>
                          <button className="px-4 h-10 rounded-lg border text-sm font-semibold transition-all hover:bg-surface-low"
                            style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface-variant)" }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="card flex flex-col items-center justify-center text-center" style={{ padding: 32 }}>
                        <span className="text-4xl mb-3">🏔️</span>
                        <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>No upcoming trips</p>
                        <p className="text-sm mb-4" style={{ color: "var(--color-outline)" }}>Start planning your Nepal adventure!</p>
                        <Link href="/packages" className="btn-primary" style={{ height: 40, fontSize: 13 }}>Browse Packages</Link>
                      </div>
                    )}
                  </div>

                  {/* Past trips */}
                  {pastBookings.length > 0 && (
                    <div style={{ width: 220 }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-outline)" }}>
                        Past Trips ({pastBookings.length})
                      </p>
                      <div className="flex flex-col gap-3">
                        {pastBookings.slice(0, 3).map((b) => {
                          const pkg = getPackage(b);
                          return (
                            <div key={b._id} className="card flex items-center gap-3" style={{ padding: 12 }}>
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                {pkg?.coverImage ? (
                                  <Image src={pkg.coverImage} alt={pkg.title ?? ""} fill sizes="48px" className="object-cover" />
                                ) : (
                                  <div className="w-full h-full" style={{ backgroundColor: "var(--color-surface-high)" }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs truncate" style={{ color: "var(--color-on-surface)" }}>{pkg?.title ?? "Package"}</p>
                                <p className="text-xs" style={{ color: "var(--color-outline)" }}>
                                  {new Date(b.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} • {b.status}
                                </p>
                              </div>
                              <button className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0"
                                style={{ backgroundColor: "var(--color-surface-low)", color: "var(--color-on-surface)" }}>
                                Review
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Offline guide banner */}
                <div className="rounded-xl flex items-center justify-between p-5" style={{ backgroundColor: "var(--color-navy)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📥</span>
                    <div>
                      <p className="font-bold text-sm text-white">DOWNLOAD OFFLINE GUIDE + EMERGENCY MAP</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Offline access for your trek. Recommended for remote areas.</p>
                    </div>
                  </div>
                  <button className="shrink-0 px-4 h-10 rounded-lg border text-sm font-semibold text-white transition-all"
                    style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                    Get PDF Package
                  </button>
                </div>
              </>
            )}

            {/* ── BOOKINGS TAB ── */}
            {activeNav === "bookings" && (
              <div className="card p-0 overflow-hidden">
                <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>All Bookings</h2>
                </div>
                {bookingsLoading ? (
                  <div className="p-12 flex justify-center">
                    <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>No bookings yet</p>
                    <p className="text-sm mb-4" style={{ color: "var(--color-outline)" }}>Your bookings will appear here.</p>
                    <Link href="/packages" className="btn-primary" style={{ height: 40, fontSize: 13 }}>Browse Packages</Link>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "var(--color-surface-low)", borderBottom: "1px solid var(--color-outline-variant)" }}>
                        {["Booking #", "Package", "Date", "Travelers", "Total", "Status"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-outline)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => {
                        const pkg = getPackage(b);
                        const statusStyle = STATUS_COLORS[b.status] ?? { bg: "var(--color-surface-low)", color: "var(--color-outline)" };
                        return (
                          <tr key={b._id} style={{ borderBottom: i < bookings.length - 1 ? "1px solid var(--color-surface-high)" : "none" }}>
                            <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--color-outline)" }}>
                              {b.bookingNumber ?? `#${b._id.slice(-6).toUpperCase()}`}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{pkg?.title ?? "—"}</td>
                            <td className="px-4 py-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                              {new Date(b.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-center" style={{ color: "var(--color-on-surface-variant)" }}>
                              {b.groupSize ?? b.travelers?.length ?? 1}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                              NPR {b.totalPrice?.toLocaleString() ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── WISHLIST TAB ── */}
            {activeNav === "wishlist" && (
              <div className="card flex flex-col items-center justify-center text-center" style={{ padding: 48 }}>
                <span className="text-4xl mb-3">❤️</span>
                <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>No saved packages yet</p>
                <p className="text-sm mb-4" style={{ color: "var(--color-outline)" }}>Click the heart icon on any package to save it here.</p>
                <Link href="/packages" className="btn-primary" style={{ height: 40, fontSize: 13 }}>Explore Packages</Link>
              </div>
            )}

            {/* ── DOCUMENTS TAB ── */}
            {activeNav === "documents" && (
              <div className="card flex flex-col items-center justify-center text-center" style={{ padding: 48 }}>
                <span className="text-4xl mb-3">📄</span>
                <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>No documents uploaded</p>
                <p className="text-sm" style={{ color: "var(--color-outline)" }}>Upload passport, permits, and insurance documents here.</p>
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeNav === "reviews" && (
              <div className="card flex flex-col items-center justify-center text-center" style={{ padding: 48 }}>
                <span className="text-4xl mb-3">⭐</span>
                <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>No reviews yet</p>
                <p className="text-sm" style={{ color: "var(--color-outline)" }}>Complete a trip to leave a review.</p>
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeNav === "settings" && (
              <div className="card" style={{ padding: 24 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Account Settings</h2>
                  {!editing && (
                    <button
                      onClick={() => { setEditing(true); setProfileError(""); setProfileSuccess(""); }}
                      className="btn-ghost text-sm"
                      style={{ height: 36 }}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                {/* Success message */}
                {profileSuccess && (
                  <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: "rgba(29,158,117,0.1)", color: "var(--color-success)" }}>
                    {profileSuccess}
                  </div>
                )}

                {/* Error message */}
                {profileError && (
                  <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: "rgba(186,26,26,0.1)", color: "var(--color-error)" }}>
                    {profileError}
                  </div>
                )}

                <div style={{ maxWidth: 480 }}>
                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
                      style={{ backgroundColor: "var(--color-primary)" }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: "var(--color-on-surface)" }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm" style={{ color: "var(--color-outline)" }}>{user.email}</p>
                      <span className="text-xs capitalize font-semibold px-2 py-0.5 rounded mt-1 inline-block"
                        style={{ backgroundColor: "rgba(0,108,73,0.1)", color: "var(--color-primary)" }}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {editing ? (
                    <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>First Name</label>
                          <input
                            className={inputClass}
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                            required
                            minLength={2}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Last Name</label>
                          <input
                            className={inputClass}
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                            required
                            minLength={2}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Email</label>
                        <input
                          className={inputClass}
                          value={user.email}
                          readOnly
                          style={{ backgroundColor: "var(--color-surface-low)", cursor: "not-allowed", opacity: 0.7 }}
                        />
                        <p className="text-xs mt-1" style={{ color: "var(--color-outline)" }}>Email cannot be changed.</p>
                      </div>

                      <div>
                        <label className={labelClass}>Phone</label>
                        <input
                          className={inputClass}
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+977 98XXXXXXXX"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Nationality</label>
                        <input
                          className={inputClass}
                          value={profileForm.nationality}
                          onChange={(e) => setProfileForm((p) => ({ ...p, nationality: e.target.value }))}
                          placeholder="e.g. Nepali"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary" style={{ height: 44 }} disabled={profileSaving}>
                          {profileSaving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false);
                            setProfileError("");
                            setProfileForm({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              phone: user.phone ?? "",
                              nationality: user.nationality ?? "",
                            });
                          }}
                          className="btn-secondary"
                          style={{ height: 44 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {[
                        { label: "First Name", value: user.firstName },
                        { label: "Last Name", value: user.lastName },
                        { label: "Email", value: user.email },
                        { label: "Phone", value: user.phone ?? "Not set" },
                        { label: "Nationality", value: user.nationality ?? "Not set" },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className={labelClass}>{field.label}</label>
                          <div className="input-field flex items-center" style={{ backgroundColor: "var(--color-surface-low)", cursor: "default", color: "var(--color-on-surface)" }}>
                            {field.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}