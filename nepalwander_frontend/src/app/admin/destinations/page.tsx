"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { destinationsApi } from "@/lib/api/destinations";
import { Destination } from "@/types";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDestinations = async () => {
    try {
      const data = await destinationsApi.getAll({ limit: "100" });
      setDestinations(data.destinations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDestinations(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await destinationsApi.delete(id);
      setDestinations((prev) => prev.filter((d) => d._id !== id));
    } catch {
      alert("Failed to delete destination.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--color-outline)" }}>
          {destinations.length} destination{destinations.length !== 1 ? "s" : ""}
        </p>
        <Link href="/admin/destinations/new" className="btn-primary" style={{ height: 40, fontSize: 13 }}>
          + Add Destination
        </Link>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: "var(--color-outline)" }}>Loading destinations...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>No destinations yet</p>
            <p className="text-sm mb-4" style={{ color: "var(--color-outline)" }}>Add your first destination to get started.</p>
            <Link href="/admin/destinations/new" className="btn-primary" style={{ height: 40, fontSize: 13 }}>
              + Add Destination
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-low)" }}>
                {["Destination", "Region", "Difficulty", "Featured", "Active", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-outline)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {destinations.map((dest, i) => (
                <tr
                  key={dest._id}
                  style={{ borderBottom: i < destinations.length - 1 ? "1px solid var(--color-surface-high)" : "none" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-high">
                        {dest.coverImage ? (
                          <Image src={dest.coverImage} alt={dest.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--color-outline)" }}>No img</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>{dest.name}</p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>{dest.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="chip chip-inactive text-xs capitalize">{dest.region}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      dest.difficulty === "easy" ? "badge-success" :
                      dest.difficulty === "moderate" ? "badge-warning" :
                      "badge-danger"
                    }`}>
                      {dest.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${dest.isFeatured ? "badge-success" : ""}`}
                      style={!dest.isFeatured ? { backgroundColor: "var(--color-surface-high)", color: "var(--color-outline)" } : {}}>
                      {dest.isFeatured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${dest.isActive ? "badge-success" : "badge-danger"}`}>
                      {dest.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/destinations/${dest._id}/edit`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ backgroundColor: "var(--color-surface-low)", color: "var(--color-on-surface)" }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(dest._id, dest.name)}
                        disabled={deleting === dest._id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ backgroundColor: "rgba(216,90,48,0.1)", color: "var(--color-danger)" }}
                      >
                        {deleting === dest._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}