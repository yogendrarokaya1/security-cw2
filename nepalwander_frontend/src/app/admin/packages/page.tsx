"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { packagesApi } from "@/lib/api/packages";
import { Package } from "@/types";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      const data = await packagesApi.getAll({ limit: "100" });
      setPackages(data.packages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await packagesApi.delete(id);
      setPackages((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete package.");
    } finally {
      setDeleting(null);
    }
  };

  const statusColor = (status: string) => {
    if (status === "published") return "badge-success";
    if (status === "draft") return "badge-warning";
    return "badge-info";
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--color-outline)" }}>
          {packages.length} package{packages.length !== 1 ? "s" : ""}
        </p>
        <Link href="/admin/packages/new" className="btn-primary" style={{ height: 40, fontSize: 13 }}>
          + Add Package
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: "var(--color-outline)" }}>Loading packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>No packages yet</p>
            <p className="text-sm mb-4" style={{ color: "var(--color-outline)" }}>Create your first tour package.</p>
            <Link href="/admin/packages/new" className="btn-primary" style={{ height: 40, fontSize: 13 }}>+ Add Package</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-low)" }}>
                {["Package", "Duration", "Price", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-outline)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, i) => (
                <tr key={pkg._id} style={{ borderBottom: i < packages.length - 1 ? "1px solid var(--color-surface-high)" : "none" }}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>{pkg.title}</p>
                    <p className="text-xs" style={{ color: "var(--color-outline)" }}>{pkg.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                    {pkg.duration} days
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                    ${pkg.price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColor(pkg.status)}`}>{pkg.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/packages/${pkg._id}/edit`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: "var(--color-surface-low)", color: "var(--color-on-surface)" }}>
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(pkg._id, pkg.title)}
                        disabled={deleting === pkg._id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: "rgba(216,90,48,0.1)", color: "var(--color-danger)" }}>
                        {deleting === pkg._id ? "..." : "Delete"}
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