/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import { packagesApi } from "@/lib/api/packages";
import { Package } from "@/types";
import PackageCard from "@/components/packages/PackageCard";

const DIFFICULTIES = ["easy", "moderate", "hard", "extreme"];
const DURATIONS = [
  { label: "1–3 days", min: 1, max: 3 },
  { label: "4–7 days", min: 4, max: 7 },
  { label: "8–14 days", min: 8, max: 14 },
  { label: "15+ days", min: 15, max: 999 },
];
const BUDGETS = [
  { label: "Under NPR 20K", max: 20000 },
  { label: "NPR 20K–50K", min: 20000, max: 50000 },
  { label: "NPR 50K–100K", min: 50000, max: 100000 },
  { label: "NPR 100K+", min: 100000 },
];

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState<{ min?: number; max?: number }>({});
  const [budget, setBudget] = useState<{ min?: number; max?: number }>({});

  const LIMIT = 9;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(LIMIT),
      };
      if (search) params.search = search;
      if (difficulty) params.difficulty = difficulty;
      if (duration.min) params.minDuration = String(duration.min);
      if (duration.max && duration.max < 999) params.maxDuration = String(duration.max);
      if (budget.min) params.minPrice = String(budget.min);
      if (budget.max) params.maxPrice = String(budget.max);

      const data = await packagesApi.getAll(params);
      setPackages(data.packages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, difficulty, duration, budget]);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const resetFilters = () => {
    setDifficulty("");
    setDuration({});
    setBudget({});
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  const hasFilters = difficulty || duration.min || budget.min || budget.max || search;

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          minHeight: 340,
          background: "linear-gradient(to bottom, rgba(13,27,42,0.7) 0%, rgba(13,27,42,0.85) 100%), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600') center/cover",
        }}
      >
        <div className="relative z-10 flex flex-col items-center gap-4 px-4" style={{ maxWidth: 680 }}>
          <h1 className="text-white font-bold" style={{ fontSize: 42, letterSpacing: "-0.02em" }}>
            TOUR PACKAGES
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16 }}>
            Find the perfect Nepal adventure — {total > 0 ? total : ""} professional itineraries curated for you.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="w-full flex gap-2 mt-2" style={{ maxWidth: 600 }}>
            <div className="flex-1 flex items-center gap-3 px-4 rounded-xl" style={{ backgroundColor: "white", height: 52 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--color-outline)", flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="flex-1 text-sm outline-none bg-transparent"
                placeholder="Search packages by name, destination..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ color: "var(--color-on-surface)" }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ height: 52, padding: "0 28px" }}>
              Search
            </button>
          </form>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {/* Difficulty */}
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all"
                style={{
                  backgroundColor: difficulty ? "var(--color-primary)" : "rgba(255,255,255,0.15)",
                  borderColor: difficulty ? "var(--color-primary)" : "rgba(255,255,255,0.3)",
                  color: "white",
                  backdropFilter: "blur(8px)",
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.12.81.32 1.6.58 2.37a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l1.41-1.41a2 2 0 012.11-.45c.77.26 1.56.46 2.37.58A2 2 0 0122 16.92z"/></svg>
                {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : "Difficulty"}
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div className="absolute top-full left-0 mt-1 rounded-xl shadow-lg overflow-hidden z-20 hidden group-hover:block" style={{ backgroundColor: "white", minWidth: 140 }}>
                <button onClick={() => { setDifficulty(""); setPage(1); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-low transition-all" style={{ color: "var(--color-on-surface)" }}>All</button>
                {DIFFICULTIES.map((d) => (
                  <button key={d} onClick={() => { setDifficulty(d); setPage(1); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-low transition-all capitalize" style={{ color: difficulty === d ? "var(--color-primary)" : "var(--color-on-surface)", fontWeight: difficulty === d ? 600 : 400 }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all"
                style={{
                  backgroundColor: duration.min ? "var(--color-primary)" : "rgba(255,255,255,0.15)",
                  borderColor: duration.min ? "var(--color-primary)" : "rgba(255,255,255,0.3)",
                  color: "white",
                  backdropFilter: "blur(8px)",
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {duration.min ? `${duration.min}–${duration.max === 999 ? "+" : duration.max} days` : "Duration"}
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div className="absolute top-full left-0 mt-1 rounded-xl shadow-lg overflow-hidden z-20 hidden group-hover:block" style={{ backgroundColor: "white", minWidth: 160 }}>
                <button onClick={() => { setDuration({}); setPage(1); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-low" style={{ color: "var(--color-on-surface)" }}>All</button>
                {DURATIONS.map((d) => (
                  <button key={d.label} onClick={() => { setDuration({ min: d.min, max: d.max }); setPage(1); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-low" style={{ color: duration.min === d.min ? "var(--color-primary)" : "var(--color-on-surface)", fontWeight: duration.min === d.min ? 600 : 400 }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all"
                style={{
                  backgroundColor: budget.max || budget.min ? "var(--color-primary)" : "rgba(255,255,255,0.15)",
                  borderColor: budget.max || budget.min ? "var(--color-primary)" : "rgba(255,255,255,0.3)",
                  color: "white",
                  backdropFilter: "blur(8px)",
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                Budget
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div className="absolute top-full left-0 mt-1 rounded-xl shadow-lg overflow-hidden z-20 hidden group-hover:block" style={{ backgroundColor: "white", minWidth: 180 }}>
                <button onClick={() => { setBudget({}); setPage(1); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-low" style={{ color: "var(--color-on-surface)" }}>All</button>
                {BUDGETS.map((b) => (
                  <button key={b.label} onClick={() => { setBudget({ min: b.min, max: b.max }); setPage(1); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-low" style={{ color: (budget.max === b.max && budget.min === b.min) ? "var(--color-primary)" : "var(--color-on-surface)", fontWeight: (budget.max === b.max && budget.min === b.min) ? 600 : 400 }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-main py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
              Showing {packages.length} of {total} packages
            </p>
            {hasFilters && (
              <button onClick={resetFilters} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all" style={{ backgroundColor: "rgba(216,90,48,0.1)", color: "var(--color-danger)" }}>
                Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--color-surface-high)" }}>
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                style={{
                  backgroundColor: view === v ? "white" : "transparent",
                  color: view === v ? "var(--color-primary)" : "var(--color-outline)",
                  boxShadow: view === v ? "var(--shadow-card)" : "none",
                }}
              >
                {v === "grid" ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                ) : (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                )}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Package grid/list */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm" style={{ color: "var(--color-outline)" }}>Loading packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-bold text-lg mb-2" style={{ color: "var(--color-on-surface)" }}>No packages found</p>
            <p className="text-sm mb-4" style={{ color: "var(--color-outline)" }}>Try adjusting your filters or search term.</p>
            <button onClick={resetFilters} className="btn-primary" style={{ height: 44 }}>Clear Filters</button>
          </div>
        ) : (
          <div
            className={view === "grid" ? "grid gap-5" : "flex flex-col gap-4"}
            style={view === "grid" ? { gridTemplateColumns: "repeat(3, 1fr)" } : {}}
          >
            {packages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} view={view} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-10 h-10 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: page === p ? "var(--color-primary)" : "white",
                  color: page === p ? "white" : "var(--color-on-surface)",
                  border: page === p ? "none" : "1px solid var(--color-outline-variant)",
                }}
              >
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{ backgroundColor: "white", border: "1px solid var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}