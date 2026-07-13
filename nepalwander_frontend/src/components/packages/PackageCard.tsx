"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "@/types";

interface PackageCardProps {
  pkg: Package;
  view?: "grid" | "list";
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#1D9E75",
  moderate: "#F0A500",
  hard: "#D85A30",
  extreme: "#ba1a1a",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.round(rating) ? "#F0A500" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function PackageCard({ pkg, view = "grid" }: PackageCardProps) {
  const diffColor = DIFFICULTY_COLORS[pkg.difficulty] ?? "#565e74";
  const destination = typeof pkg.destination === "object" ? pkg.destination : null;

  if (view === "list") {
    return (
      <Link href={`/packages/${pkg.slug}`} className="block">
        <div
          className="card flex gap-4 hover:shadow-md transition-all"
          style={{ padding: 16, borderRadius: 16 }}
        >
          <div className="relative shrink-0 rounded-xl overflow-hidden" style={{ width: 180, height: 120 }}>
            {pkg.coverImage ? (
              <Image src={pkg.coverImage} alt={pkg.title} fill sizes="180px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--color-surface-high)" }}>
                <span className="text-xs" style={{ color: "var(--color-outline)" }}>No image</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded text-white uppercase" style={{ backgroundColor: diffColor }}>
                {pkg.difficulty}
              </span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {pkg.isBestSeller && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "#F0A500", color: "white" }}>
                    BEST SELLER
                  </span>
                )}
                {pkg.isFeatured && !pkg.isBestSeller && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-info)", color: "white" }}>
                    POPULAR
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base" style={{ color: "var(--color-on-surface)" }}>{pkg.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={pkg.rating} />
                <span className="text-xs" style={{ color: "var(--color-outline)" }}>{pkg.duration} days</span>
                {destination && (
                  <span className="text-xs" style={{ color: "var(--color-outline)" }}>• {destination.name}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
                NPR {pkg.price.toLocaleString()}
              </p>
              <span className="btn-primary text-sm" style={{ height: 36, padding: "0 16px" }}>
                View Details
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="card overflow-hidden hover:shadow-md transition-all group" style={{ padding: 0, borderRadius: 16 }}>
      {/* Image */}
      <div className="relative" style={{ height: 200 }}>
        {pkg.coverImage ? (
          <Image src={pkg.coverImage} alt={pkg.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--color-surface-high)" }}>
            <span className="text-sm" style={{ color: "var(--color-outline)" }}>No image</span>
          </div>
        )}

        {/* Top badge */}
        {(pkg.isBestSeller || pkg.isFeatured) && (
          <div className="absolute top-3 left-3">
            {pkg.isBestSeller ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white uppercase tracking-wide" style={{ backgroundColor: "#F0A500" }}>
                Best Seller
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white uppercase tracking-wide" style={{ backgroundColor: "var(--color-info)" }}>
                Popular
              </span>
            )}
          </div>
        )}

        {/* Difficulty badge */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded text-white uppercase" style={{ backgroundColor: diffColor }}>
            {pkg.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-base leading-tight" style={{ color: "var(--color-on-surface)" }}>
            {pkg.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={pkg.rating} />
            <span className="text-xs" style={{ color: "var(--color-outline)" }}>{pkg.duration} days</span>
          </div>
        </div>

        <p className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
          NPR {pkg.price.toLocaleString()}
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={`/packages/${pkg.slug}`}
            className="btn-primary flex-1 text-center text-sm"
            style={{ height: 40, fontSize: 13 }}
          >
            View Details
          </Link>
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all hover:bg-surface-low"
            style={{ borderColor: "var(--color-outline-variant)" }}
            title="Save"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--color-outline)" }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all hover:bg-surface-low"
            style={{ borderColor: "var(--color-outline-variant)" }}
            title="Compare"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--color-outline)" }}>
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}