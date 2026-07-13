"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { destinationsApi } from "@/lib/api/destinations";
import { Destination } from "@/types";

const FALLBACK_DESTINATIONS: Partial<Destination>[] = [
  {
    _id: "1",
    name: "Pokhara",
    slug: "pokhara",
    description:
      "Lakeside serenity meets mountain adventure in Nepal's tourist capital.",
    coverImage:
      "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&q=80",
    isFeatured: true,
  },
  {
    _id: "2",
    name: "EBC Trek",
    slug: "ebc-trek",
    description:
      "The ultimate trek to the roof of the world. A journey of a lifetime.",
    coverImage:
      "https://images.unsplash.com/photo-1570654639102-bdd95efeca7a?w=600&q=80",
    isFeatured: true,
  },
  {
    _id: "3",
    name: "Chitwan",
    slug: "chitwan",
    description:
      "Rhino tracking and jungle safaris in the lush southern plains.",
    coverImage:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80",
    isFeatured: true,
  },
];

const RATINGS: Record<string, number> = {
  Pokhara: 4.8,
  "EBC Trek": 5.0,
  Chitwan: 4.6,
};

const BADGES: Record<string, { label: string; bg: string }> = {
  Pokhara: { label: "Top Rated", bg: "#F0A500" },
  "EBC Trek": { label: "Best Seller", bg: "#006c49" },
  Chitwan: { label: "", bg: "" },
};

function StarRating({ value }: { value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <Star
        size={13}
        fill="#F0A500"
        stroke="none"
        style={{ color: "#F0A500" }}
      />
      <span style={{ fontSize: "12px", fontWeight: "700", color: "#191c1e" }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export default function FeaturedDestinations() {
  const [destinations, setDestinations] = useState<Partial<Destination>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    destinationsApi
      .getFeatured()
      .then((data) => {
        setDestinations(data.length > 0 ? data.slice(0, 3) : FALLBACK_DESTINATIONS);
      })
      .catch(() => {
        setDestinations(FALLBACK_DESTINATIONS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding: "40px 0 48px", background: "#f7f9fb" }}>
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
              Featured Destinations
            </p>
          </div>
          <Link
            href="/destinations"
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
                    height: "340px",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))
            : destinations.map((dest) => {
                const badge = BADGES[dest.name ?? ""] ?? { label: "", bg: "" };
                const rating = RATINGS[dest.name ?? ""] ?? 4.5;

                return (
                  <div
                    key={dest._id}
                    style={{
                      background: "#fff",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
                      transition: "all 0.25s",
                      cursor: "pointer",
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
                    <div style={{ position: "relative", height: "200px" }}>
                      <img
                        src={dest.coverImage}
                        alt={dest.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {/* Badge */}
                      {badge.label && (
                        <span
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            background: badge.bg,
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: "800",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "3px 9px",
                            borderRadius: "4px",
                          }}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: "18px 18px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "800",
                            color: "#191c1e",
                          }}
                        >
                          {dest.name}
                        </h3>
                        <StarRating value={rating} />
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#6c7a71",
                          lineHeight: 1.5,
                          marginBottom: "16px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {dest.description}
                      </p>
                      <Link
                        href={`/destinations/${dest.slug}`}
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
                          Explore <ArrowRight size={14} />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          .dest-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
