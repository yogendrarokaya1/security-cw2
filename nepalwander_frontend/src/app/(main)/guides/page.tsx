/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { guidesApi } from "@/lib/api/guides";
import { Guide, User } from "@/types";

const SPECIALTIES = ["trekking", "cultural", "wildlife", "adventure", "spiritual", "photography", "culinary"];
const LANGUAGES = ["nepali", "english", "hindi", "chinese", "japanese", "german", "french"];
const REGIONS = ["himalaya", "terai", "pokhara", "kathmandu", "mustang", "eastern"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="13" height="13" viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? "#F0A500" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function GuideCard({ guide }: { guide: Guide }) {
  const user = typeof guide.user === "object" ? guide.user as User : null;
  const name = user ? `${user.firstName} ${user.lastName}` : "Unknown Guide";
  const photo = guide.profileImage ?? user?.profileImage;

  return (
    <div className="card flex gap-5 hover:shadow-md transition-all" style={{ padding: 20 }}>
      {/* Avatar + NMA badge */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-xl overflow-hidden" style={{ backgroundColor: "var(--color-surface-high)" }}>
          {photo ? (
            <Image src={photo} alt={name} width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: "var(--color-primary)" }}>
              {name[0]}
            </div>
          )}
        </div>
        {guide.isNmaVerified && (
          <div className="absolute -top-2 -left-2 flex flex-col items-center justify-center rounded-md text-white"
            style={{ backgroundColor: "var(--color-primary)", width: 36, height: 36, fontSize: 8, fontWeight: 700, lineHeight: 1.2 }}>
            <span>NMA</span>
            <span>✓</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-base" style={{ color: "var(--color-on-surface)" }}>{name}</h3>
              {guide.isNmaVerified && (
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(0,108,73,0.1)", color: "var(--color-primary)" }}>
                  NMA CERTIFIED
                </span>
              )}
            </div>
            <StarRating rating={guide.rating} />
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-base" style={{ color: "var(--color-primary)" }}>
              NPR {guide.pricePerDay.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: "var(--color-outline)" }}>/day</p>
          </div>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 mb-3">
          {guide.regions?.length > 0 && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              {guide.regions.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(" + ")}
            </span>
          )}
          {guide.languages?.length > 0 && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              {guide.languages.map((l) => l.slice(0, 2).toUpperCase()).join(", ")}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
            {guide.totalTrips} trips
          </span>
          {guide.nmaCertNumber && (
            <span className="text-xs" style={{ color: "var(--color-outline)" }}>
              Cert: #{guide.nmaCertNumber}
            </span>
          )}
        </div>

        {/* Specialties */}
        {guide.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {guide.specialties.map((s) => (
              <span key={s} className="chip chip-inactive capitalize" style={{ height: 24, padding: "0 10px", fontSize: 11 }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/guides/${guide._id}`}
            className="btn-primary text-sm"
            style={{ height: 38, padding: "0 20px", fontSize: 13 }}
          >
            View Profile
          </Link>
          <button
            className="text-sm font-semibold px-5 h-9 rounded-lg border transition-all hover:bg-surface-low"
            style={{ borderColor: "var(--color-on-surface)", color: "var(--color-on-surface)", fontSize: 13 }}
          >
            Hire Guide
          </button>
          <button
            className="flex items-center gap-1.5 text-sm font-medium px-4 h-9 rounded-lg border transition-all hover:bg-surface-low"
            style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-outline)", fontSize: 13 }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Message
          </button>
          <div className="ml-auto flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${guide.isAvailable ? "bg-success" : "bg-danger"}`}
              style={{ backgroundColor: guide.isAvailable ? "var(--color-success)" : "var(--color-danger)" }} />
            <span className="text-xs font-medium" style={{ color: guide.isAvailable ? "var(--color-success)" : "var(--color-danger)" }}>
              {guide.isAvailable ? "Available" : "Busy"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [language, setLanguage] = useState("");
  const [region, setRegion] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const LIMIT = 10;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(LIMIT),
      };
      if (search) params.search = search;
      if (specialty) params.specialty = specialty;
      if (language) params.language = language;
      if (region) params.region = region;
      if (availableOnly) params.isAvailable = "true";

      const data = await guidesApi.getAll(params);
      setGuides(data.guides ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, specialty, language, region, availableOnly]);

  useEffect(() => { fetchGuides(); }, [fetchGuides]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const resetFilters = () => {
    setSpecialty(""); setLanguage(""); setRegion("");
    setAvailableOnly(false); setSearch(""); setSearchInput(""); setPage(1);
  };

  const hasFilters = specialty || language || region || availableOnly || search;

  const FilterDropdown = ({ label, value, options, onChange }: {
    label: string; value: string;
    options: string[]; onChange: (v: string) => void;
  }) => (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 px-4 h-10 rounded-lg border text-sm font-medium transition-all"
        style={{
          borderColor: value ? "var(--color-primary)" : "var(--color-outline-variant)",
          backgroundColor: value ? "rgba(0,108,73,0.08)" : "white",
          color: value ? "var(--color-primary)" : "var(--color-on-surface)",
        }}
      >
        {value ? value.charAt(0).toUpperCase() + value.slice(1) : label}
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div className="absolute top-full left-0 mt-1 rounded-xl shadow-lg overflow-hidden z-20 hidden group-hover:block"
        style={{ backgroundColor: "white", minWidth: 160, border: "1px solid var(--color-outline-variant)" }}>
        <button onClick={() => { onChange(""); setPage(1); }}
          className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-low transition-all"
          style={{ color: "var(--color-outline)" }}>
          All
        </button>
        {options.map((opt) => (
          <button key={opt} onClick={() => { onChange(opt); setPage(1); }}
            className="w-full text-left px-4 py-2.5 text-sm capitalize hover:bg-surface-low transition-all"
            style={{ color: value === opt ? "var(--color-primary)" : "var(--color-on-surface)", fontWeight: value === opt ? 600 : 400 }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div style={{ backgroundColor: "var(--color-navy)", padding: "48px 16px 40px" }}>
        <div className="container-main text-center">
          <h1 className="font-bold text-white mb-2" style={{ fontSize: 32 }}>FIND A GUIDE</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>
            Browse NMA-certified local trekking guides
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="container-main py-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-3 px-4 rounded-xl border"
            style={{ backgroundColor: "white", height: 48, borderColor: "var(--color-outline-variant)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              style={{ color: "var(--color-outline)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="flex-1 text-sm outline-none bg-transparent"
              placeholder="Search by name, region, language, specialty..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: 48, padding: "0 24px" }}>
            Search
          </button>
        </form>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown label="Region ▾" value={region} options={REGIONS} onChange={setRegion} />
          <FilterDropdown label="Language ▾" value={language} options={LANGUAGES} onChange={setLanguage} />
          <FilterDropdown label="Specialty ▾" value={specialty} options={SPECIALTIES} onChange={setSpecialty} />

          {/* Availability toggle */}
          <button
            onClick={() => { setAvailableOnly(!availableOnly); setPage(1); }}
            className="flex items-center gap-1.5 px-4 h-10 rounded-lg border text-sm font-medium transition-all"
            style={{
              borderColor: availableOnly ? "var(--color-primary)" : "var(--color-outline-variant)",
              backgroundColor: availableOnly ? "rgba(0,108,73,0.08)" : "white",
              color: availableOnly ? "var(--color-primary)" : "var(--color-on-surface)",
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: availableOnly ? "var(--color-success)" : "var(--color-outline)" }} />
            Available Now
          </button>

          {hasFilters && (
            <button onClick={resetFilters}
              className="text-xs font-semibold px-3 h-10 rounded-lg transition-all"
              style={{ backgroundColor: "rgba(216,90,48,0.1)", color: "var(--color-danger)" }}>
              Clear filters
            </button>
          )}

          <p className="ml-auto text-sm" style={{ color: "var(--color-outline)" }}>
            {total} guide{total !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Guide list */}
      <div className="container-main pb-16">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm" style={{ color: "var(--color-outline)" }}>Finding guides...</p>
          </div>
        ) : guides.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-bold text-lg mb-2" style={{ color: "var(--color-on-surface)" }}>No guides found</p>
            <p className="text-sm mb-4" style={{ color: "var(--color-outline)" }}>Try adjusting your filters.</p>
            <button onClick={resetFilters} className="btn-primary" style={{ height: 44 }}>Clear Filters</button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {guides.map((guide) => (
              <GuideCard key={guide._id} guide={guide} />
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
          </div>
        )}
      </div>
    </div>
  );
}