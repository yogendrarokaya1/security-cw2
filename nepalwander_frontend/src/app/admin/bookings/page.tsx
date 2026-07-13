"use client";

import { useEffect, useState } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { Booking, User, Package } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-warning",
  confirmed: "badge-success",
  cancelled: "badge-danger",
  completed: "badge-info",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi.getAll({ limit: "100" })
      .then((data) => setBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await bookingsApi.updateStatus(id, status);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status } : b));
    } catch {
      alert("Failed to update status.");
    }
  };

  const getUser = (booking: Booking): User | null =>
    typeof booking.user === "object" ? booking.user as User : null;

  const getPackage = (booking: Booking): Package | null =>
    typeof booking.package === "object" ? booking.package as Package : null;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      <p className="text-sm" style={{ color: "var(--color-outline)" }}>
        {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
      </p>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: "var(--color-outline)" }}>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold" style={{ color: "var(--color-on-surface)" }}>No bookings yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-low)" }}>
                {["Booking #", "User", "Package", "Start Date", "Guests", "Total", "Status", "Update"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-outline)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, i) => {
                const user = getUser(booking);
                const pkg = getPackage(booking);
                return (
                  <tr key={booking._id} style={{ borderBottom: i < bookings.length - 1 ? "1px solid var(--color-surface-high)" : "none" }}>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--color-outline)" }}>
                      {booking.bookingNumber ?? `#${booking._id.slice(-6).toUpperCase()}`}
                    </td>
                    <td className="px-4 py-3">
                      {user ? (
                        <>
                          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs" style={{ color: "var(--color-outline)" }}>{user.email}</p>
                        </>
                      ) : (
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>—</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                      {pkg?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                      {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: "var(--color-on-surface-variant)" }}>
                      {booking.groupSize ?? booking.travelers?.length ?? 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                      ${booking.totalPrice?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[booking.status] ?? "badge-info"}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="text-xs border rounded-lg px-2 py-1.5 outline-none font-medium"
                        style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                        value={booking.status}
                        onChange={(e) => handleStatus(booking._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}