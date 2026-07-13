/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Mountain } from "lucide-react";
import ExploreFilters from "@/components/explore/ExploreFilters";
import ExploreMap from "@/components/explore/ExploreMap";
import PackageResultCard from "@/components/explore/PackageResultCard";
import { packagesApi } from "@/lib/api/packages";

const defaultFilters = {
  search: "",
  activities: ["Trekking", "Cultural"],
  duration: "",
  budgetMax: 50000,
  difficulties: ["Easy", "Moderate"],
  seasons: ["Spring", "Autumn"],
};

export default function ExplorePage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [sort, setSort] = useState("Recommended");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPackages = () => {
    setLoading(true);
    packagesApi.getAll()
      .then((res) => {
        setPackages(res.packages);
        setTotal(res.total);
      })
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await packagesApi.getAll();
        if (mounted) {
          setPackages(res.packages);
          setTotal(res.total);
        }
      } catch {
        if (mounted) {
          setPackages([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleReset = () => {
    setFilters(defaultFilters);
    fetchPackages();
  };

  return (
    <div className="bg-surface min-h-screen flex">

      {/* Filters sidebar */}
      <ExploreFilters
        filters={filters}
        onChange={setFilters}
        onApply={fetchPackages}
        onReset={handleReset}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Map */}
        <ExploreMap />

        {/* Results */}
        <div className="px-6 py-5 flex-1">

          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-bold text-on-surface">
                RESULTS —{" "}
                <span className="text-primary">{total || packages.length}</span> packages found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-outline">Sort:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-[12px] font-semibold text-on-surface pr-7 outline-none focus:border-primary cursor-pointer"
                >
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                  <option>Duration</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Package list */}
          <div className="flex flex-col gap-3">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl h-[140px] animate-pulse border border-surface-container" />
              ))
            ) : packages.length > 0 ? (
              packages.map((pkg) => (
                <PackageResultCard key={pkg._id} pkg={pkg} />
              ))
            ) : (
              <div className="text-center py-12 text-outline">
                <Mountain size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-[14px]">No packages found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {packages.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-colors
                    ${page === p
                      ? "bg-primary text-white"
                      : "bg-white border border-outline-variant text-outline hover:border-primary"
                    }`}
                >
                  {p}
                </button>
              ))}
              <button className="text-[12px] text-primary font-bold">→</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}