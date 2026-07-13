"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [tripMode, setTripMode] = useState<"budget" | "luxury">("budget");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative w-full h-130 overflow-visible">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-50"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80')" }}
      />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-28 text-center px-4">
        <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight mb-2 max-w-xl">
          Explore Nepal. Plan Smart. Travel Better.
        </h1>
        <p className="text-white/80 text-sm mb-7">
          Trusted by 10,000+ travelers to witness Nepal
        </p>

        {/* Search bar */}
        <div className="flex items-center bg-white rounded-lg px-4 py-1.5 w-full max-w-125 gap-2 shadow-xl">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search destination, activity or package..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 border-none outline-none text-sm text-on-surface bg-transparent font-jakarta"
          />
          <button
            onClick={handleSearch}
            className="btn-primary px-5 h-9 text-sm rounded-md"
          >
            Search
          </button>
        </div>
      </div>

      {/* Trip Mode Bar — floats below hero */}
      <div className="absolute -bottom-7 left-0 right-0 z-10 flex items-center justify-between px-6">
        <div className="bg-white rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-modal">
          <span className="text-[10px] font-bold tracking-widest text-secondary">TRIP MODE:</span>
          <div className="flex bg-surface-low rounded-md p-0.5 gap-0.5">
            <button
              onClick={() => setTripMode("budget")}
              className={`px-4 py-1.5 rounded text-sm font-semibold transition-all ${
                tripMode === "budget" ? "bg-primary text-white" : "text-on-surface-variant bg-transparent"
              }`}
            >
              Budget
            </button>
            <button
              onClick={() => setTripMode("luxury")}
              className={`px-4 py-1.5 rounded text-sm font-semibold transition-all ${
                tripMode === "luxury" ? "bg-primary text-white" : "text-on-surface-variant bg-transparent"
              }`}
            >
              Luxury
            </button>
          </div>
        </div>

        <button onClick={() => router.push("/plan")} className="btn-primary px-8">
          Plan My Trip
        </button>
      </div>
    </section>
  );
}
