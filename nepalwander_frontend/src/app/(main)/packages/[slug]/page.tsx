"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { packagesApi } from "@/lib/api/packages";
import { Package, Destination } from "@/types";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#1D9E75",
  moderate: "#F0A500",
  hard: "#D85A30",
  extreme: "#ba1a1a",
};

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= Math.round(rating) ? "#F0A500" : "#e2e8f0"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-sm" style={{ color: "var(--color-outline)" }}>({count} reviews)</span>}
    </div>
  );
}

const TABS = ["Itinerary", "Cost Breakdown", "Safety", "Map"] as const;
type Tab = typeof TABS[number];

export default function PackageDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Itinerary");
  const [groupSize, setGroupSize] = useState(2);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    packagesApi.getBySlug(slug).then(setPkg).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: "var(--color-outline)" }}>Loading package...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-bold text-xl" style={{ color: "var(--color-on-surface)" }}>Package not found</p>
        <Link href="/packages" className="btn-primary" style={{ height: 44 }}>Browse Packages</Link>
      </div>
    );
  }

  const destination = typeof pkg.destination === "object" ? pkg.destination as Destination : null;
  const allImages = [pkg.coverImage, ...(pkg.images ?? [])].filter(Boolean);
  const diffColor = DIFFICULTY_COLORS[pkg.difficulty] ?? "#565e74";

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={() => setLightbox(null)}
        >
          <div className="relative" style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
            <Image src={lightbox} alt="Photo" width={1200} height={800} className="object-contain rounded-xl" style={{ maxHeight: "85vh", width: "auto" }} />
            <button onClick={() => setLightbox(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>✕</button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-sm" style={{ color: "var(--color-outline)" }}>
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>›</span>
          <Link href="/packages" className="hover:text-primary transition-colors">Packages</Link>
          <span>›</span>
          <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{pkg.title}</span>
        </nav>
      </div>

      {/* Image Gallery */}
      <div className="container-main mb-6">
        {allImages.length > 0 ? (
          <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "260px 200px", height: 470 }}>
            {/* Main large image */}
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer row-span-2"
              onClick={() => setLightbox(allImages[0])}
            >
              <Image src={allImages[0]} alt={pkg.title} fill sizes="50vw" className="object-cover hover:scale-105 transition-transform duration-300" />
              {destination && (
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                  {destination.name}
                </div>
              )}
            </div>

            {/* Right grid */}
            <div className="grid grid-cols-2 gap-2">
              {allImages.slice(1, 3).map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden cursor-pointer" onClick={() => setLightbox(img)}>
                  <Image src={img} alt={`Photo ${i + 2}`} fill sizes="25vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allImages.slice(3, 5).map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden cursor-pointer" onClick={() => setLightbox(img)}>
                  <Image src={img} alt={`Photo ${i + 4}`} fill sizes="25vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                  {i === 1 && allImages.length > 5 && (
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                      +{allImages.length - 5} Photos
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl flex items-center justify-center" style={{ height: 340, backgroundColor: "var(--color-surface-high)" }}>
            <p className="text-sm" style={{ color: "var(--color-outline)" }}>No images available</p>
          </div>
        )}
      </div>

      {/* Main content + sidebar */}
      <div className="container-main pb-16">
        <div className="flex gap-8 items-start">
          {/* LEFT CONTENT */}
          <div className="flex-1 min-w-0">
            {/* Title block */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-bold mb-2" style={{ fontSize: 28, color: "var(--color-on-surface)", lineHeight: 1.2 }}>
                  {pkg.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <StarRating rating={pkg.rating} count={pkg.reviewCount} />
                  <span className="flex items-center gap-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    {pkg.duration} days
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded text-white" style={{ backgroundColor: diffColor }}>
                    {pkg.difficulty.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                    Max {pkg.groupSize?.max ?? 12}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
              {pkg.description}
            </p>

            {/* Tabs */}
            <div className="flex gap-0 border-b mb-6" style={{ borderColor: "var(--color-outline-variant)" }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-3 text-sm font-semibold border-b-2 transition-all"
                  style={{
                    borderBottomColor: activeTab === tab ? "var(--color-primary)" : "transparent",
                    color: activeTab === tab ? "var(--color-primary)" : "var(--color-outline)",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "Itinerary" && (
              <div className="flex flex-col gap-4">
                <h2 className="font-bold text-base" style={{ color: "var(--color-on-surface)" }}>Day-wise Itinerary</h2>
                {pkg.itinerary?.length ? pkg.itinerary.map((day) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: "var(--color-primary)" }}>
                        {String(day.day).padStart(2, "0")}
                      </div>
                      <div className="flex-1 w-px mt-2" style={{ backgroundColor: "var(--color-outline-variant)" }} />
                    </div>
                    <div className="pb-6 flex-1">
                      <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--color-on-surface)" }}>{day.title}</h3>
                      <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--color-on-surface-variant)" }}>{day.description}</p>
                      <div className="flex flex-wrap gap-3">
                        {day.accommodation && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-outline)" }}>
                            🏠 {day.accommodation}
                          </span>
                        )}
                        {day.meals && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-outline)" }}>
                            🍽️ {day.meals}
                          </span>
                        )}
                        {day.distance && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-outline)" }}>
                            📍 {day.distance} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm" style={{ color: "var(--color-outline)" }}>No itinerary available.</p>
                )}

                {/* Includes / Excludes */}
                {(pkg.includes?.length > 0 || pkg.excludes?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {pkg.includes?.length > 0 && (
                      <div className="card" style={{ padding: 16 }}>
                        <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-success)" }}>✓ Includes</h3>
                        <ul className="flex flex-col gap-2">
                          {pkg.includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                              <span className="mt-0.5 shrink-0" style={{ color: "var(--color-success)" }}>✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pkg.excludes?.length > 0 && (
                      <div className="card" style={{ padding: 16 }}>
                        <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-danger)" }}>✗ Excludes</h3>
                        <ul className="flex flex-col gap-2">
                          {pkg.excludes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                              <span className="mt-0.5 shrink-0" style={{ color: "var(--color-danger)" }}>✗</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Cost Breakdown" && (
              <div>
                <h2 className="font-bold text-base mb-4" style={{ color: "var(--color-on-surface)" }}>Transparent Cost Breakdown</h2>
                <div className="card overflow-hidden" style={{ padding: 0 }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "var(--color-surface-low)", borderBottom: "1px solid var(--color-outline-variant)" }}>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-outline)" }}>Item Details</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-outline)" }}>Amount (NPR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pkg.costBreakdown && Object.entries(pkg.costBreakdown).map(([key, val]) => {
                        if (key === "_id" || !val) return null;
                        return (
                          <tr key={key} style={{ borderBottom: "1px solid var(--color-surface-high)" }}>
                            <td className="px-5 py-3 text-sm capitalize" style={{ color: "var(--color-on-surface-variant)" }}>{key}</td>
                            <td className="px-5 py-3 text-sm text-right font-medium" style={{ color: "var(--color-on-surface)" }}>{Number(val).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: "rgba(0,108,73,0.06)", borderTop: "2px solid var(--color-primary)" }}>
                        <td className="px-5 py-4 font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>TOTAL PER PERSON</td>
                        <td className="px-5 py-4 font-bold text-sm text-right" style={{ color: "var(--color-primary)" }}>NPR {pkg.price.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Eco score */}
                {pkg.ecoScore > 0 && (
                  <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.2)" }}>
                    <span className="text-xl">🌿</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--color-success)" }}>Alpine Eco Score: {pkg.ecoScore}/5.0</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>Waste-free trek & ethical porter wages certified.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Safety" && (
              <div className="flex flex-col gap-4">
                <h2 className="font-bold text-base" style={{ color: "var(--color-on-surface)" }}>Safety Information</h2>
                {destination?.safetyInfo ? (
                  <div className="card" style={{ padding: 20, border: "1px solid var(--color-warning)", backgroundColor: "rgba(240,165,0,0.05)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span>⚠️</span>
                      <p className="font-bold text-sm" style={{ color: "var(--color-warning)" }}>
                        Risk Level: {destination.safetyInfo.riskLevel?.toUpperCase()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                      <p>🏥 {destination.safetyInfo.nearestHospital}</p>
                      <p>📞 Emergency: {destination.safetyInfo.emergencyContact}</p>
                      <p>🚁 {destination.safetyInfo.rescueService}</p>
                      {destination.safetyInfo.timsRequired && <p>📋 TIMS Required</p>}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "var(--color-outline)" }}>Safety info available on destination page.</p>
                )}
              </div>
            )}

            {activeTab === "Map" && (
              <div>
                <h2 className="font-bold text-base mb-4" style={{ color: "var(--color-on-surface)" }}>Location</h2>
                {destination?.location ? (
                  <div className="rounded-xl overflow-hidden" style={{ height: 320 }}>
                    <iframe
                      width="100%"
                      height="100%"
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${destination.location.longitude - 0.1},${destination.location.latitude - 0.1},${destination.location.longitude + 0.1},${destination.location.latitude + 0.1}&layer=mapnik&marker=${destination.location.latitude},${destination.location.longitude}`}
                      style={{ border: "none" }}
                    />
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "var(--color-outline)" }}>Map not available.</p>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="shrink-0 sticky top-6" style={{ width: 320 }}>
            <div className="card" style={{ padding: 24 }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--color-outline)" }}>Starting From</p>
              <p className="font-bold mb-1" style={{ fontSize: 32, color: "var(--color-primary)", lineHeight: 1 }}>
                NPR {pkg.price.toLocaleString()}
              </p>
              <p className="text-xs mb-5" style={{ color: "var(--color-outline)" }}>/ person</p>

              {/* Group size */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--color-outline)" }}>Group Size</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGroupSize(g => Math.max(1, g - 1))}
                    className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-lg transition-all hover:bg-surface-low"
                    style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                  >
                    −
                  </button>
                  <span className="font-bold text-lg w-8 text-center" style={{ color: "var(--color-on-surface)" }}>
                    {String(groupSize).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => setGroupSize(g => Math.min(pkg.groupSize?.max ?? 12, g + 1))}
                    className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-lg transition-all hover:bg-surface-low"
                    style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                  >
                    +
                  </button>
                  <span className="text-xs ml-1" style={{ color: "var(--color-outline)" }}>
                    (max {pkg.groupSize?.max ?? 12})
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-5 p-3 rounded-xl" style={{ backgroundColor: "var(--color-surface-low)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Total for {groupSize} {groupSize === 1 ? "person" : "people"}</span>
                  <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                    NPR {(pkg.price * groupSize).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Book now */}
              <Link
                href={`/packages/${pkg.slug}/book`}
                className="btn-primary w-full text-center mb-3"
                style={{ height: 48, fontSize: 15 }}
              >
                BOOK NOW
              </Link>
              <button
                className="w-full h-12 rounded-lg border font-semibold text-sm transition-all hover:bg-surface-low"
                style={{ borderColor: "var(--color-on-surface)", color: "var(--color-on-surface)" }}
              >
                Request Custom Itinerary
              </button>

              <p className="text-xs text-center mt-3" style={{ color: "var(--color-outline)" }}>
                No payment required today. 24h free cancellation.
              </p>

              {/* Trust badges */}
              <div className="mt-4 flex flex-col gap-2 pt-4" style={{ borderTop: "1px solid var(--color-surface-high)" }}>
                {[
                  { icon: "🔒", text: "100% Secure Transaction & Refund Guarantee" },
                  { icon: "🎧", text: "24/7 On-trek Emergency Support" },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2">
                    <span>{badge.icon}</span>
                    <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{badge.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination link */}
            {destination && (
              <div className="card mt-3" style={{ padding: 16 }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-outline)" }}>DESTINATION</p>
                <Link href={`/destinations/${destination.slug ?? ""}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    {destination.coverImage ? (
                      <Image src={destination.coverImage} alt={destination.name} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: "var(--color-surface-high)" }} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors" style={{ color: "var(--color-on-surface)" }}>
                      {destination.name}
                    </p>
                    <p className="text-xs capitalize" style={{ color: "var(--color-outline)" }}>{destination.region}</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}