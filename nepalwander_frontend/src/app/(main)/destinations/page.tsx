/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import DestinationCard from "@/components/destinations/DestinationCard";
import { destinationsApi } from "@/lib/api/destinations";
import { Destination } from "@/types";

const LIMIT = 9;

const regions = [
  { label: "All", value: "" },
  { label: "Himalaya", value: "himalaya" },
  { label: "Terai", value: "terai" },
  { label: "Pokhara", value: "pokhara" },
  { label: "Kathmandu", value: "kathmandu" },
  { label: "Mustang", value: "mustang" },
  { label: "Eastern", value: "eastern" },
];

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeRegion, setActiveRegion] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params: Record<string, string> = {
      limit: String(LIMIT),
      page: String(page),
    };
    if (activeRegion) params.region = activeRegion;
    if (search) params.search = search;

    destinationsApi
      .getAll(params)
      .then((res) => {
        if (cancelled) return;
        setDestinations(res.destinations ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(() => {
        if (cancelled) return;
        setDestinations([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeRegion, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleRegion = (region: string) => {
    setActiveRegion(region);
    setPage(1);
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-[1100px] mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-extrabold text-on-surface tracking-tight uppercase">
            Explore Destinations
          </h1>
          <p className="text-[14px] text-outline mt-2">
            Discover Nepal's most beautiful places — {total} destinations curated for the modern trekker.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search destinations, regions, or activities..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-12 pl-11 pr-4 text-[14px] bg-white border border-outline-variant rounded-xl outline-none focus:border-primary shadow-card"
            />
          </div>
          <button type="submit" className="btn-primary px-6" style={{ height: 48 }}>
            Search
          </button>
        </form>

        {/* Region filters */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {regions.map((r) => (
            <button
              key={r.value}
              onClick={() => handleRegion(r.value)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all border
                ${activeRegion === r.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-on-surface border-outline-variant hover:border-primary"
                }`}
            >
              {r.label}
            </button>
          ))}
          {(search || activeRegion) && (
            <button
              onClick={() => { setSearch(""); setSearchInput(""); setActiveRegion(""); setPage(1); }}
              className="px-4 py-2 rounded-full text-[13px] font-semibold border transition-all"
              style={{ backgroundColor: "rgba(216,90,48,0.1)", color: "var(--color-danger)", borderColor: "transparent" }}
            >
              Clear ✕
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[13px] font-bold text-on-surface uppercase tracking-wide">
            {total} Destinations Found
          </p>
          <button className="flex items-center gap-2 text-[13px] text-outline border border-outline-variant px-3 py-1.5 rounded-lg hover:border-primary transition-colors">
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-[320px] animate-pulse border border-surface-container" />
            ))}
          </div>
        ) : destinations.length > 0 ? (
          <div className="grid grid-cols-2 gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {destinations.map((d) => (
              <DestinationCard key={d._id} destination={d} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-outline">
            <p className="text-[16px] font-semibold mb-2">No destinations found</p>
            <p className="text-sm">Try a different search or region filter.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-lg border border-outline-variant flex items-center justify-center hover:border-primary transition-colors text-outline disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-[13px] font-bold transition-all
                  ${page === p
                    ? "bg-primary text-white border-none"
                    : "border border-outline-variant text-outline hover:border-primary"
                  }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="w-9 h-9 rounded-lg border border-outline-variant flex items-center justify-center hover:border-primary transition-colors text-outline disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}