"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { guidesApi } from "@/lib/api/guides";
import { adminApi } from "@/lib/api/admin";
import { Guide, User } from "@/types";

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchGuides = async () => {
    try {
      const data = await guidesApi.getAll({ limit: "100" });
      setGuides(data.guides ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGuides(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete guide "${name}"? This cannot be undone.`)) return;
    setActionLoading(id + "_delete");
    try {
      await guidesApi.delete(id);
      setGuides((prev) => prev.filter((g) => g._id !== id));
    } catch {
      alert("Failed to delete guide.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyNma = async (id: string) => {
    setActionLoading(id + "_nma");
    try {
      await adminApi.verifyNma(id);
      setGuides((prev) => prev.map((g) => g._id === id ? { ...g, isNmaVerified: true } : g));
    } catch {
      alert("Failed to verify NMA.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setActionLoading(id + "_status");
    try {
      await adminApi.toggleGuideStatus(id);
      setGuides((prev) => prev.map((g) => g._id === id ? { ...g, isAvailable: !g.isAvailable } : g));
    } catch {
      alert("Failed to toggle status.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--color-outline)" }}>
          {guides.length} guide{guides.length !== 1 ? "s" : ""}
        </p>
        <Link href="/admin/guides/new" className="btn-primary" style={{ height: 40, fontSize: 13 }}>
          + Create Guide Profile
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: "var(--color-outline)" }}>Loading guides...</p>
          </div>
        ) : guides.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>No guides yet</p>
            <p className="text-sm mb-4" style={{ color: "var(--color-outline)" }}>
              Create a guide profile for an approved guide user.
            </p>
            <Link href="/admin/guides/new" className="btn-primary" style={{ height: 40, fontSize: 13 }}>
              + Create Guide Profile
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-low)" }}>
                {["Guide", "Specialties", "Exp", "Languages", "Price/Day", "NMA", "Available", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-outline)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guides.map((guide, i) => {
                const user = typeof guide.user === "object" ? guide.user as User : null;
                const name = user ? `${user.firstName} ${user.lastName}` : "Unknown";
                const email = user?.email ?? "";
                const photo = guide.profileImage ?? user?.profileImage;

                return (
                  <tr key={guide._id} style={{ borderBottom: i < guides.length - 1 ? "1px solid var(--color-surface-high)" : "none" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                          {photo ? (
                            <Image src={photo} alt={name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: "var(--color-primary)" }}>
                              {name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>{name}</p>
                          <p className="text-xs" style={{ color: "var(--color-outline)" }}>{email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {guide.specialties?.slice(0, 2).map((s) => (
                          <span key={s} className="chip chip-inactive capitalize" style={{ height: 22, padding: "0 8px", fontSize: 11 }}>{s}</span>
                        ))}
                        {(guide.specialties?.length ?? 0) > 2 && (
                          <span className="text-xs" style={{ color: "var(--color-outline)" }}>+{guide.specialties.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                      {guide.experience}y
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                      {guide.languages?.slice(0, 2).map((l) => l.slice(0, 2).toUpperCase()).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                      NPR {guide.pricePerDay?.toLocaleString()}/d
                    </td>
                    <td className="px-4 py-3">
                      {guide.isNmaVerified ? (
                        <span className="badge badge-success text-xs">✓ Verified</span>
                      ) : (
                        <button
                          onClick={() => handleVerifyNma(guide._id)}
                          disabled={actionLoading === guide._id + "_nma"}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
                          style={{ backgroundColor: "rgba(24,95,165,0.1)", color: "var(--color-info)" }}
                        >
                          {actionLoading === guide._id + "_nma" ? "..." : "Verify NMA"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(guide._id)}
                        disabled={actionLoading === guide._id + "_status"}
                        className={`badge ${guide.isAvailable ? "badge-success" : "badge-danger"} cursor-pointer`}
                      >
                        {actionLoading === guide._id + "_status" ? "..." : guide.isAvailable ? "Available" : "Busy"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/guides/${guide._id}/edit`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: "var(--color-surface-low)", color: "var(--color-on-surface)" }}>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(guide._id, name)}
                          disabled={actionLoading === guide._id + "_delete"}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: "rgba(216,90,48,0.1)", color: "var(--color-danger)" }}>
                          {actionLoading === guide._id + "_delete" ? "..." : "Delete"}
                        </button>
                      </div>
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