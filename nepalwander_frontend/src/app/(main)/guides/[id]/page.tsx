"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { guidesApi } from "@/lib/api/guides";
import { Guide, User } from "@/types";
import Image from "next/image";
import Link from "next/link";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#F0A500" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guidesApi.getById(id).then(setGuide).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-bold text-xl" style={{ color: "var(--color-on-surface)" }}>Guide not found</p>
        <Link href="/guides" className="btn-primary" style={{ height: 44 }}>Back to Guides</Link>
      </div>
    );
  }

  const user = typeof guide.user === "object" ? guide.user as User : null;
  const name = user ? `${user.firstName} ${user.lastName}` : "Unknown Guide";
  const photo = guide.profileImage ?? user?.profileImage;

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--color-outline)" }}>
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>›</span>
          <Link href="/guides" className="hover:text-primary transition-colors">Guides</Link>
          <span>›</span>
          <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{name}</span>
        </nav>

        <div className="flex gap-8 items-start">
          {/* Left */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Profile header */}
            <div className="card" style={{ padding: 24 }}>
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  {photo ? (
                    <Image src={photo} alt={name} width={96} height={96} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                      style={{ backgroundColor: "var(--color-primary)" }}>
                      {name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-bold text-2xl" style={{ color: "var(--color-on-surface)" }}>{name}</h1>
                    {guide.isNmaVerified && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                        NMA CERTIFIED
                      </span>
                    )}
                  </div>
                  <StarRating rating={guide.rating} />
                  <p className="text-sm mt-1" style={{ color: "var(--color-outline)" }}>
                    {guide.reviewCount} reviews · {guide.totalTrips} trips · {guide.experience} years experience
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {guide.specialties?.map((s) => (
                      <span key={s} className="chip chip-inactive capitalize" style={{ height: 28, padding: "0 12px", fontSize: 12 }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="font-bold text-sm mb-3" style={{ color: "var(--color-on-surface)" }}>About</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>{guide.bio}</p>
            </div>

            {/* Details */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="font-bold text-sm mb-4" style={{ color: "var(--color-on-surface)" }}>Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Languages", value: guide.languages?.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(", ") },
                  { label: "Regions", value: guide.regions?.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(", ") },
                  { label: "Experience", value: `${guide.experience} years` },
                  { label: "Total Trips", value: guide.totalTrips },
                  { label: "NMA Cert", value: guide.nmaCertNumber ?? "—" },
                  { label: "Availability", value: guide.isAvailable ? "✓ Available" : "✗ Busy" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-outline)" }}>{item.label}</p>
                    <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {guide.certifications?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h2 className="font-bold text-sm mb-4" style={{ color: "var(--color-on-surface)" }}>Certifications</h2>
                <div className="flex flex-col gap-3">
                  {guide.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--color-surface-low)" }}>
                      <span className="text-lg">🏅</span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>{cert.name}</p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>
                          {cert.issuedBy} · {cert.issuedYear}
                          {cert.certificateNumber && ` · #${cert.certificateNumber}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {guide.reviews?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h2 className="font-bold text-sm mb-4" style={{ color: "var(--color-on-surface)" }}>Reviews</h2>
                <div className="flex flex-col gap-4">
                  {guide.reviews.map((review, i) => (
                    <div key={i} className="pb-4" style={{ borderBottom: i < guide.reviews.length - 1 ? "1px solid var(--color-surface-high)" : "none" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={review.rating} />
                        <span className="text-xs" style={{ color: "var(--color-outline)" }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="shrink-0 sticky top-6" style={{ width: 280 }}>
            <div className="card" style={{ padding: 24 }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--color-outline)" }}>Price</p>
              <p className="font-bold mb-4" style={{ fontSize: 28, color: "var(--color-primary)" }}>
                NPR {guide.pricePerDay?.toLocaleString()}
                <span className="text-sm font-normal" style={{ color: "var(--color-outline)" }}>/day</span>
              </p>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: guide.isAvailable ? "var(--color-success)" : "var(--color-danger)" }} />
                <span className="text-sm font-medium" style={{ color: guide.isAvailable ? "var(--color-success)" : "var(--color-danger)" }}>
                  {guide.isAvailable ? "Available for booking" : "Currently busy"}
                </span>
              </div>

              <button className="btn-primary w-full mb-3" style={{ height: 48 }}>
                Hire This Guide
              </button>
              <button className="btn-secondary w-full" style={{ height: 44 }}>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}