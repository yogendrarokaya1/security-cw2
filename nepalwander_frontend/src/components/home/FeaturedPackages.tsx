"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ArrowRight, Clock, Users, Mountain } from "lucide-react";
import { packagesApi } from "@/lib/api/packages";
import { Package } from "@/types";

const FALLBACK_PACKAGES: Partial<Package>[] = [
  {
    _id: "p1",
    title: "Everest Base Camp Trek",
    slug: "everest-base-camp-trek",
    description:
      "A legendary 14-day journey through Sherpa villages to the foot of the world's highest peak.",
    coverImage:
      "https://images.unsplash.com/photo-1570654639102-bdd95efeca7a?w=600&q=80",
    duration: 14,
    difficulty: "Challenging",
    price: 1299,
    rating: 5.0,
    reviewCount: 342,
    isBestSeller: true,
    groupSize: { min: 2, max: 12 },
  },
  {
    _id: "p2",
    title: "Annapurna Circuit",
    slug: "annapurna-circuit",
    description:
      "Cross the legendary Thorong La Pass on this classic 12-day circuit through diverse landscapes.",
    coverImage:
      "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&q=80",
    duration: 12,
    difficulty: "Moderate",
    price: 999,
    rating: 4.8,
    reviewCount: 218,
    isBestSeller: false,
    groupSize: { min: 2, max: 16 },
  },
  {
    _id: "p3",
    title: "Chitwan Jungle Safari",
    slug: "chitwan-jungle-safari",
    description:
      "4 days of thrilling wildlife encounters — rhinos, elephants and exotic birds in their natural habitat.",
    coverImage:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80",
    duration: 4,
    difficulty: "Easy",
    price: 499,
    rating: 4.6,
    reviewCount: 175,
    isBestSeller: false,
    groupSize: { min: 2, max: 10 },
  },
];

const DIFFICULTY_COLORS: Record<string, { bg: string; color: string }> = {
  Easy: { bg: "rgba(101,163,13,0.1)", color: "#4d7c0f" },
  Moderate: { bg: "rgba(245,158,11,0.1)", color: "#b45309" },
  Challenging: { bg: "rgba(220,38,38,0.1)", color: "#b91c1c" },
};

function StarRating({ value, count }: { value: number; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <Star size={13} fill="#F0A500" stroke="none" style={{ color: "#F0A500" }} />
      <span style={{ fontSize: "12px", fontWeight: "700", color: "#191c1e" }}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: "11px", color: "#9aab9f" }}>({count})</span>
      )}
    </div>
  );
}

export default function FeaturedPackages() {
  const [packages, setPackages] = useState<Partial<Package>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesApi
      .getFeatured()
      .then((data) => {
        setPackages(data.length > 0 ? data.slice(0, 3) : FALLBACK_PACKAGES);
      })
      .catch(() => {
        setPackages(FALLBACK_PACKAGES);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding: "48px 0", background: "#f7f9fb" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#6c7a71",
                marginBottom: "4px",
              }}
            >
              Popular Packages
            </p>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "800",
                color: "#191c1e",
                lineHeight: 1.2,
              }}
            >
              Handpicked Adventures
            </h2>
          </div>
          <Link
            href="/packages"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#006c49",
              fontSize: "13px",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "#eceef0",
                    borderRadius: "16px",
                    height: "380px",
                    animation: "pkgPulse 1.5s ease-in-out infinite",
                  }}
                />
              ))
            : packages.map((pkg) => {
                const diffStyle =
                  DIFFICULTY_COLORS[pkg.difficulty ?? "Easy"] ??
                  DIFFICULTY_COLORS["Easy"];

                return (
                  <div
                    key={pkg._id}
                    style={{
                      background: "#fff",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
                      transition: "all 0.25s",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform =
                        "translateY(-4px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 12px 32px rgba(15,23,42,0.14)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform =
                        "translateY(0)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 2px 8px rgba(15,23,42,0.08)";
                    }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", height: "200px", flexShrink: 0 }}>
                      <img
                        src={pkg.coverImage}
                        alt={pkg.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {/* Best Seller badge */}
                      {pkg.isBestSeller && (
                        <span
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            background: "#006c49",
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: "800",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "3px 9px",
                            borderRadius: "4px",
                          }}
                        >
                          Best Seller
                        </span>
                      )}
                      {/* Price badge */}
                      <span
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          right: "12px",
                          background: "rgba(0,0,0,0.65)",
                          backdropFilter: "blur(6px)",
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: "800",
                          padding: "4px 10px",
                          borderRadius: "8px",
                        }}
                      >
                        ${pkg.price?.toLocaleString()}
                      </span>
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        padding: "18px 18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      {/* Title + Rating */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "15px",
                            fontWeight: "800",
                            color: "#191c1e",
                            lineHeight: 1.3,
                          }}
                        >
                          {pkg.title}
                        </h3>
                        <StarRating
                          value={pkg.rating ?? 4.5}
                          count={pkg.reviewCount}
                        />
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6c7a71",
                          lineHeight: 1.5,
                          marginBottom: "12px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          flex: 1,
                        }}
                      >
                        {pkg.description}
                      </p>

                      {/* Meta chips */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginBottom: "14px",
                        }}
                      >
                        {/* Duration */}
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "rgba(0,108,73,0.08)",
                            color: "#006c49",
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "3px 9px",
                            borderRadius: "20px",
                          }}
                        >
                          <Clock size={11} />
                          {pkg.duration}D
                        </span>
                        {/* Group size */}
                        {pkg.groupSize && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "rgba(24,95,165,0.08)",
                              color: "#185FA5",
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "3px 9px",
                              borderRadius: "20px",
                            }}
                          >
                            <Users size={11} />
                            {pkg.groupSize.min}–{pkg.groupSize.max}
                          </span>
                        )}
                        {/* Difficulty */}
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: diffStyle.bg,
                            color: diffStyle.color,
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "3px 9px",
                            borderRadius: "20px",
                          }}
                        >
                          <Mountain size={11} />
                          {pkg.difficulty}
                        </span>
                      </div>

                      {/* CTA */}
                      <Link
                        href={`/packages/${pkg.slug}`}
                        style={{ textDecoration: "none" }}
                      >
                        <button
                          style={{
                            width: "100%",
                            height: "42px",
                            background: "#006c49",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#005236";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#006c49";
                          }}
                        >
                          View Package <ArrowRight size={14} />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      <style>{`
        @keyframes pkgPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 900px) {
          .pkg-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .pkg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
