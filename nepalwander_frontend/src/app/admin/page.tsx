"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/admin/Statcard";
import { destinationsApi } from "@/lib/api/destinations";
import { packagesApi } from "@/lib/api/packages";
import { guidesApi } from "@/lib/api/guides";
import { bookingsApi } from "@/lib/api/bookings";

interface Stats {
  destinations: number;
  packages: number;
  guides: number;
  bookings: number;
}

const QUICK_LINKS = [
  { label: "Add Destination", href: "/admin/destinations/new", color: "var(--color-primary)" },
  { label: "Add Package", href: "/admin/packages/new", color: "var(--color-info)" },
  { label: "Add Guide", href: "/admin/guides/new", color: "var(--color-success)" },
  { label: "View Bookings", href: "/admin/bookings", color: "var(--color-warning)" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ destinations: 0, packages: 0, guides: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dest, pkg, guide, booking] = await Promise.allSettled([
          destinationsApi.getAll(),
          packagesApi.getAll(),
          guidesApi.getAll(),
          bookingsApi.getMyBookings(),
        ]);

        setStats({
          destinations: dest.status === "fulfilled" ? dest.value.total ?? dest.value.destinations?.length ?? 0 : 0,
          packages: pkg.status === "fulfilled" ? pkg.value.total ?? pkg.value.packages?.length ?? 0 : 0,
          guides: guide.status === "fulfilled" ? guide.value.total ?? guide.value.guides?.length ?? 0 : 0,
          bookings: booking.status === "fulfilled" ? booking.value?.length ?? 0 : 0,
        });
      } catch {
        // stats stay 0
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard
          label="Destinations"
          value={loading ? "—" : stats.destinations}
          color="var(--color-primary)"
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          }
        />
        <StatCard
          label="Packages"
          value={loading ? "—" : stats.packages}
          color="var(--color-info)"
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          }
        />
        <StatCard
          label="Guides"
          value={loading ? "—" : stats.guides}
          color="var(--color-success)"
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          }
        />
        <StatCard
          label="Bookings"
          value={loading ? "—" : stats.bookings}
          color="var(--color-warning)"
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-bold text-base mb-4" style={{ color: "var(--color-on-surface)" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl text-center text-sm font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: `${link.color}10`, color: link.color }}
            >
              <span className="text-lg">+</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Nav cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Manage Destinations", href: "/admin/destinations", desc: "Add, edit, delete destinations" },
          { label: "Manage Packages", href: "/admin/packages", desc: "Create and publish tour packages" },
          { label: "Manage Guides", href: "/admin/guides", desc: "Register and manage guides" },
          { label: "Bookings", href: "/admin/bookings", desc: "View and manage all bookings" },
          { label: "Users", href: "/admin/users", desc: "Manage registered users" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card hover:shadow-md transition-all group"
          >
            <p className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors" style={{ color: "var(--color-on-surface)" }}>
              {item.label}
            </p>
            <p className="text-xs" style={{ color: "var(--color-outline)" }}>{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}