"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { destinationsApi } from "@/lib/api/destinations";
import { packagesApi } from "@/lib/api/packages";
import { Destination, Package } from "@/types";

// ── Constants ─────────────────────────────────────────
const SEASON_COLORS: Record<string, string> = {
  best: "#1D9E75",
  shoulder: "#F0A500",
  avoid: "#D85A30",
};

const MONTH_SHORT = ["J","F","M","A","M","J","J","A","S","O","N","D"];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#1D9E75",
  moderate: "#F0A500",
  hard: "#D85A30",
  extreme: "#ba1a1a",
};

const RISK_COLORS: Record<string, string> = {
  low: "#1D9E75",
  medium: "#F0A500",
  high: "#D85A30",
  extreme: "#ba1a1a",
};

// ── Star Rating ───────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#F0A500" : "rgba(255,255,255,0.3)"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Related Packages ──────────────────────────────────
function RelatedPackages({ destinationId }: { destinationId: string }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesApi.getByDestination(destinationId)
      .then(setPackages)
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [destinationId]);

  if (loading) return (
    <div className="flex justify-center py-4">
      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (packages.length === 0) return (
    <p className="text-xs py-2" style={{ color: "var(--color-outline)" }}>No packages yet.</p>
  );

  return (
    <div className="flex flex-col gap-3">
      {packages.slice(0, 3).map((pkg) => (
        <Link key={pkg._id} href={`/packages/${pkg.slug}`}>
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-low transition-colors group cursor-pointer">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
              {pkg.coverImage ? (
                <Image src={pkg.coverImage} alt={pkg.title} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: "var(--color-surface-high)" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--color-on-surface)" }}>{pkg.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-outline)" }}>
                NPR {pkg.price?.toLocaleString()} | {pkg.difficulty?.charAt(0).toUpperCase() + pkg.difficulty?.slice(1)}
              </p>
              <p className="text-xs font-bold mt-0.5 group-hover:underline" style={{ color: "var(--color-primary)" }}>
                View Deal →
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    destinationsApi.getBySlug(slug)
      .then(setDestination)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: "var(--color-outline)" }}>Loading destination...</p>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-bold text-xl" style={{ color: "var(--color-on-surface)" }}>Destination not found</p>
        <Link href="/destinations" className="btn-primary" style={{ height: 44 }}>Back to Destinations</Link>
      </div>
    );
  }

  const allImages = [destination.coverImage, ...(destination.images ?? [])].filter(Boolean);
  const diffColor = DIFFICULTY_COLORS[destination.difficulty] ?? "var(--color-outline)";
  const riskColor = RISK_COLORS[destination.safetyInfo?.riskLevel ?? "low"];
  const bestMonths = destination.seasonalCalendar
    ?.filter((s) => s.status === "best")
    .map((s) => s.month.slice(0, 3))
    .join(", ");

  // Simulated real-time info (would come from weather API in production)
  const realtimeInfo = {
    weather: "Clear Sky",
    temp: "24°C",
    crowd: "Low (Off-Peak)",
    safety: "Safe to Travel",
    connectivity: "Excellent 4G/5G",
  };

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={() => setLightbox(null)}>
          <div className="relative" style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
            <Image src={lightbox} alt="Photo" width={1200} height={800}
              className="object-contain rounded-xl" style={{ maxHeight: "85vh", width: "auto" }} />
            <button onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>✕</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <div className="relative" style={{ height: 440 }}>
        {destination.coverImage ? (
          <Image src={destination.coverImage} alt={destination.name}
            fill sizes="100vw" className="object-cover" priority />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "var(--color-surface-high)" }} />
        )}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(13,27,42,0.3) 0%, rgba(13,27,42,0.75) 100%)" }} />

        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <div className="container-main">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
              <Link href="/" className="hover:text-white transition-colors">NepalWander</Link>
              <span>›</span>
              <Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link>
              <span>›</span>
              <span className="text-white font-semibold uppercase tracking-wide">{destination.name}</span>
            </nav>

            <h1 className="text-white font-extrabold uppercase mb-3"
              style={{ fontSize: 44, letterSpacing: "-0.01em", lineHeight: 1 }}>
              {destination.name}
            </h1>

            <div className="flex items-center gap-4">
              <Stars rating={4.8} />
              <span className="text-sm font-semibold text-white">4.8 (2.4k Reviews)</span>
              <span className="text-white opacity-60">·</span>
              <span className="text-sm text-white">
                ⛰️ {destination.altitude?.toLocaleString()}m Elevation
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="flex gap-8 items-start">

          {/* ── LEFT CONTENT ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* Tab nav */}
            <div className="flex items-center justify-between border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <div className="flex gap-0">
                {["Overview", "Season", "Safety", "Local Tips", "Gallery", "Packages"].map((tab) => (
                  <a key={tab} href={`#${tab.toLowerCase().replace(" ", "-")}`}
                    className="px-4 py-3 text-sm font-semibold transition-all border-b-2"
                    style={{ borderBottomColor: tab === "Overview" ? "var(--color-primary)" : "transparent",
                      color: tab === "Overview" ? "var(--color-primary)" : "var(--color-outline)" }}>
                    {tab}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2 pb-2">
                <button className="flex items-center gap-1.5 px-4 h-9 rounded-xl border text-sm font-semibold transition-all"
                  style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Save
                </button>
                <button className="flex items-center gap-1.5 px-4 h-9 rounded-xl border text-sm font-semibold transition-all"
                  style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>

            {/* ── OVERVIEW ── */}
            <div id="overview">
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                The Gateway to {destination.region === "himalaya" ? "the Himalayas" : destination.region.charAt(0).toUpperCase() + destination.region.slice(1)}
              </p>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
                {destination.description}
              </p>

              {/* Real-time info bar */}
              <div className="p-4 rounded-2xl" style={{ backgroundColor: "rgba(0,108,73,0.06)", border: "1px solid rgba(0,108,73,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-primary)" }}>
                  📡 Real-Time Info
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">☀️</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--color-on-surface)" }}>WEATHER</p>
                      <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{realtimeInfo.temp} {realtimeInfo.weather}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👥</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--color-on-surface)" }}>CROWD LEVEL</p>
                      <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{realtimeInfo.crowd}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🛡️</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--color-on-surface)" }}>SAFETY STATUS</p>
                      <p className="text-xs font-semibold" style={{ color: "var(--color-success)" }}>{realtimeInfo.safety}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📶</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--color-on-surface)" }}>CONNECTIVITY</p>
                      <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{realtimeInfo.connectivity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SEASONAL CALENDAR ── */}
            <div id="season">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Seasonal Calendar</p>
                <div className="flex items-center gap-3">
                  {[["best", "#1D9E75", "Best"], ["shoulder", "#F0A500", "Shoulder"], ["avoid", "#D85A30", "Avoid"]].map(([key, color, label]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs" style={{ color: "var(--color-outline)" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {destination.seasonalCalendar?.map((s, i) => (
                  <div key={s.month} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: SEASON_COLORS[s.status] ?? "var(--color-surface-high)" }}>
                      {MONTH_SHORT[i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── TRAVEL LIKE A LOCAL ── */}
            <div>
              <p className="font-bold text-sm mb-4" style={{ color: "var(--color-on-surface)" }}>Travel Like a Local 🧭</p>
              {destination.localTips && destination.localTips.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {destination.localTips.slice(0, 3).map((tip, i) => {
                    const tipImages = [
                      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
                      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400",
                    ];
                    const labels = ["MARKET", "NATURE", "CULTURE"];
                    return (
                      <div key={i} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
                        <div className="relative" style={{ height: 120 }}>
                          <Image src={tipImages[i]} alt={tip} fill sizes="200px" className="object-cover" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-white text-xs font-bold"
                            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                            {labels[i]}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>{tip}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--color-outline)" }}>No local tips available.</p>
              )}
            </div>

            {/* ── SAFETY ── */}
            {destination.safetyInfo && (
              <div id="safety">
                <p className="font-bold text-sm mb-4" style={{ color: "var(--color-on-surface)" }}>Safety Information</p>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: `${riskColor}10`, border: `1px solid ${riskColor}30` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span>⚠️</span>
                    <p className="font-bold text-sm" style={{ color: riskColor }}>
                      Risk Level: {destination.safetyInfo.riskLevel?.charAt(0).toUpperCase() + destination.safetyInfo.riskLevel?.slice(1)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span>🏥</span>
                      <div>
                        <p className="font-semibold text-xs" style={{ color: "var(--color-on-surface)" }}>{destination.safetyInfo.nearestHospital}</p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>Nearest hospital</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>📞</span>
                      <div>
                        <p className="font-semibold text-xs" style={{ color: "var(--color-on-surface)" }}>Emergency: {destination.safetyInfo.emergencyContact}</p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>Police and urgent assistance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>🚁</span>
                      <div>
                        <p className="font-semibold text-xs" style={{ color: "var(--color-on-surface)" }}>{destination.safetyInfo.rescueService}</p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>Heli-evacuation services</p>
                      </div>
                    </div>
                    {destination.safetyInfo.timsRequired && (
                      <div className="flex items-start gap-2">
                        <span>📋</span>
                        <div>
                          <p className="font-semibold text-xs" style={{ color: "var(--color-on-surface)" }}>
                            TIMS: {destination.safetyInfo.timsCheckpoint ?? "Required"}
                          </p>
                          <p className="text-xs" style={{ color: "var(--color-outline)" }}>Required for this trek</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── PHOTO GALLERY ── */}
            <div id="gallery">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Photo Gallery</p>
                  <p className="text-xs" style={{ color: "var(--color-outline)" }}>Moments captured by our community</p>
                </div>
                {allImages.length > 5 && (
                  <button className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: "var(--color-primary)" }}>
                    See all {allImages.length} photos
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </button>
                )}
              </div>

              {allImages.length === 0 ? (
                <div className="rounded-2xl flex items-center justify-center"
                  style={{ height: 200, backgroundColor: "var(--color-surface-high)" }}>
                  <p className="text-sm" style={{ color: "var(--color-outline)" }}>No photos yet</p>
                </div>
              ) : (
                <div className="grid gap-3" style={{ gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "200px 200px" }}>
                  {/* Large image */}
                  <div className="relative rounded-2xl overflow-hidden cursor-pointer row-span-2"
                    onClick={() => setLightbox(allImages[0])}>
                    <Image src={allImages[0]} alt="Main photo" fill sizes="50vw"
                      className="object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                  {/* Small images */}
                  {allImages.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => setLightbox(img)}>
                      <Image src={img} alt={`Photo ${i + 2}`} fill sizes="25vw"
                        className="object-cover hover:scale-105 transition-transform duration-300" />
                      {i === 3 && allImages.length > 5 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                          +{allImages.length - 5} Photos
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Fill empty slots */}
                  {allImages.length === 2 && <div className="rounded-xl" style={{ backgroundColor: "var(--color-surface-high)" }} />}
                  {allImages.length === 2 && <div className="rounded-xl" style={{ backgroundColor: "var(--color-surface-high)" }} />}
                  {allImages.length === 3 && <div className="rounded-xl" style={{ backgroundColor: "var(--color-surface-high)" }} />}
                </div>
              )}
            </div>

            {/* ── PACKAGES TAB SECTION ── */}
            <div id="packages">
              <p className="font-bold text-sm mb-4" style={{ color: "var(--color-on-surface)" }}>
                Available Packages
              </p>
              <RelatedPackages destinationId={destination._id} />
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="shrink-0 sticky top-6 flex flex-col gap-4" style={{ width: 280 }}>

            {/* Safety info sidebar */}
            <div className="card" style={{ padding: 20 }}>
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: riskColor }}>⚠️</span>
                <p className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Safety Information</p>
              </div>
              {destination.safetyInfo && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">🏥</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--color-on-surface)" }}>
                        {destination.safetyInfo.nearestHospital}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-outline)" }}>Main public hospital</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">📞</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--color-on-surface)" }}>
                        Emergency: {destination.safetyInfo.emergencyContact}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-outline)" }}>Police and urgent assistance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">🚁</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--color-on-surface)" }}>
                        {destination.safetyInfo.rescueService}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-outline)" }}>Heli-evacuation services</p>
                    </div>
                  </div>
                  {destination.safetyInfo.timsRequired && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm shrink-0">📋</span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: "var(--color-on-surface)" }}>
                          TIMS: {destination.safetyInfo.timsCheckpoint ?? "Required"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>
                          Required for {destination.name} treks
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Related packages sidebar */}
            <div className="card" style={{ padding: 20 }}>
              <p className="font-bold text-sm mb-4" style={{ color: "var(--color-on-surface)" }}>Related Packages</p>
              <RelatedPackages destinationId={destination._id} />
            </div>

            {/* Book CTA */}
            <Link
              href={`/packages?destination=${destination._id}`}
              className="btn-primary w-full text-center font-bold"
              style={{ height: 52, fontSize: 14 }}
            >
              Book Your Trip to {destination.name}
            </Link>

            {/* Difficulty + Best season */}
            <div className="card" style={{ padding: 16 }}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--color-outline)" }}>Difficulty</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded text-white capitalize"
                    style={{ backgroundColor: diffColor }}>
                    {destination.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--color-outline)" }}>Altitude</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--color-on-surface)" }}>
                    {destination.altitude?.toLocaleString()}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--color-outline)" }}>Best Season</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--color-on-surface)" }}>
                    {bestMonths || "Year round"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--color-outline)" }}>Region</span>
                  <span className="text-xs font-semibold capitalize" style={{ color: "var(--color-on-surface)" }}>
                    {destination.region}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}