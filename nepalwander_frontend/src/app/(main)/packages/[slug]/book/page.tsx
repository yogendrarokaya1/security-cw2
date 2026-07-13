/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { packagesApi } from "@/lib/api/packages";
import { bookingsApi } from "@/lib/api/bookings";
import { Package } from "@/types";

// ── Types ─────────────────────────────────────────────
interface Traveler {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
}

const PAYMENT_METHODS = [
  { key: "esewa", label: "eSewa", icon: "💚", color: "#60B246" },
  { key: "khalti", label: "Khalti", icon: "💜", color: "#5C2D91" },
  { key: "bank", label: "Bank Transfer", icon: "🏦", color: "#185FA5" },
  { key: "card", label: "Credit Card", icon: "💳", color: "#565e74" },
];

const STEPS = ["Date & Group", "Traveler Details", "Payment"];

const emptyTraveler = (): Traveler => ({
  firstName: "", lastName: "", email: "",
  phone: "", nationality: "", passportNumber: "",
});

// ── Star Rating ───────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#F0A500" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingResult, setBookingResult] = useState<{
    bookingNumber: string;
    totalPrice: number;
  } | null>(null);

  // Step 1 state
  const [startDate, setStartDate] = useState("");
  const [groupSize, setGroupSize] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  // Step 2 state
  const [travelers, setTravelers] = useState<Traveler[]>([emptyTraveler()]);

  // Step 3 state
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    packagesApi.getBySlug(slug).then(setPkg).finally(() => setPkgLoading(false));
  }, [slug]);

  // Sync travelers array with group size
  useEffect(() => {
    setTravelers((prev) => {
      if (groupSize > prev.length) {
        return [...prev, ...Array.from({ length: groupSize - prev.length }, emptyTraveler)];
      }
      return prev.slice(0, groupSize);
    });
  }, [groupSize]);

  if (authLoading || pkgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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

  const totalPrice = pkg.price * groupSize;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const setTravelerField = (i: number, key: keyof Traveler, val: string) => {
    setTravelers((prev) => prev.map((t, idx) => idx === i ? { ...t, [key]: val } : t));
  };

  // ── Step 1 validation ─────────────────────────────────
  const handleStep1 = () => {
    if (!startDate) { setError("Please select a start date."); return; }
    setError("");
    setStep(1);
  };

  // ── Step 2 validation ─────────────────────────────────
  const handleStep2 = () => {
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i];
      if (!t.firstName || !t.lastName || !t.email || !t.phone || !t.nationality) {
        setError(`Please fill in all required fields for Traveler ${i + 1}.`);
        return;
      }
    }
    setError("");
    setStep(2);
  };

  // ── Step 3: Submit booking ────────────────────────────
  const handleBooking = async () => {
    if (!transactionId.trim()) {
      setError("Please enter your transaction ID.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // 1. Create booking
      const res = await bookingsApi.create({
        packageId: pkg._id,
        startDate,
        paymentMethod,
        specialRequests: specialRequests || undefined,
        travelers,
      });

      // 2. Confirm payment
      if (res?.booking?._id) {
        await bookingsApi.confirmPayment(res.booking._id, {
          transactionId,
          paymentMethod,
        });
      }

      setBookingResult({
        bookingNumber: res?.summary?.bookingNumber ?? res?.booking?.bookingNumber ?? "NW-000000",
        totalPrice,
      });
      setStep(3);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setError(msg ?? "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "input-field";
  const labelClass = "block text-xs font-semibold mb-1.5";

  // ── SUCCESS SCREEN ────────────────────────────────────
  if (step === 3 && bookingResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--color-surface-low)" }}>
        <div className="card text-center" style={{ padding: 48, maxWidth: 480, width: "100%" }}>
          {/* Checkmark */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(0,108,73,0.1)", border: "3px solid var(--color-primary)" }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "var(--color-primary)" }}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h1 className="font-bold text-2xl mb-2" style={{ color: "var(--color-on-surface)" }}>Booking Confirmed!</h1>
          <p className="font-medium mb-1" style={{ color: "var(--color-on-surface-variant)" }}>
            {pkg.title} — {new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--color-outline)" }}>
            Booking ID: #{bookingResult.bookingNumber}
          </p>

          {/* Checklist */}
          <div className="flex flex-col gap-3 mb-8 text-left">
            {[
              `Confirmation email sent to ${user?.email}`,
              "Itinerary PDF attached to email",
              "Permit checklist included in email",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(0,108,73,0.1)", border: "1.5px solid var(--color-primary)" }}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: "var(--color-primary)" }}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{item}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="btn-primary flex-1 text-center" style={{ height: 48 }}>
              View My Booking
            </Link>
            <Link href="/" className="btn-secondary flex-1 text-center" style={{ height: 48 }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-surface-low)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
        <div className="container-main">
          <h1 className="font-bold text-lg" style={{ color: "var(--color-on-surface)" }}>
            BOOKING — {pkg.title}
          </h1>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
        <div className="container-main">
          <div className="flex">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className="flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all"
                style={{
                  borderBottomColor: i === step ? "var(--color-primary)" : i < step ? "var(--color-success)" : "transparent",
                  color: i === step ? "var(--color-primary)" : i < step ? "var(--color-success)" : "var(--color-outline)",
                  backgroundColor: i === step ? "rgba(0,108,73,0.04)" : "transparent",
                }}
              >
                {i + 1} {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-main py-6">
        <div className="flex gap-6 items-start">

          {/* ── LEFT CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* STEP 0 — Date & Group */}
            {step === 0 && (
              <div className="card" style={{ padding: 28 }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-5" style={{ color: "var(--color-outline)" }}>
                  STEP 1: DATE & GROUP SIZE
                </p>

                <div className="flex flex-col gap-5">
                  {/* Date */}
                  <div>
                    <label className={labelClass}>Select departure date</label>
                    <input
                      className={inputClass}
                      type="date"
                      min={minDate}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  {/* Group size */}
                  <div>
                    <label className={labelClass}>Group size</label>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: Math.min(pkg.groupSize?.max ?? 12, 8) }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setGroupSize(n)}
                          className="w-12 h-12 rounded-xl border text-sm font-semibold transition-all"
                          style={{
                            backgroundColor: groupSize === n ? "var(--color-primary)" : "white",
                            color: groupSize === n ? "white" : "var(--color-on-surface)",
                            borderColor: groupSize === n ? "var(--color-primary)" : "var(--color-outline-variant)",
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "var(--color-outline)" }}>
                      Min {pkg.groupSize?.min ?? 1} · Max {pkg.groupSize?.max ?? 12} travelers
                    </p>
                  </div>

                  {/* Special requests */}
                  <div>
                    <label className={labelClass}>Special requests <span style={{ color: "var(--color-outline)", fontWeight: 400 }}>(optional)</span></label>
                    <textarea
                      className={inputClass}
                      style={{ height: 90, paddingTop: 12, resize: "vertical" }}
                      placeholder="Vegetarian meals, early start time, wheelchair access..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(186,26,26,0.1)", color: "var(--color-error)" }}>
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link href={`/packages/${slug}`} className="btn-secondary" style={{ height: 48 }}>
                      ← Back
                    </Link>
                    <button onClick={handleStep1} className="btn-primary flex-1" style={{ height: 48 }}>
                      Next Step →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 — Traveler Details */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                {travelers.map((traveler, i) => (
                  <div key={i} className="card" style={{ padding: 24 }}>
                    <p className="font-bold text-sm mb-4" style={{ color: "var(--color-on-surface)" }}>
                      Traveler {i + 1} {i === 0 && <span className="font-normal text-xs" style={{ color: "var(--color-outline)" }}>(Lead traveler)</span>}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>First Name *</label>
                        <input className={inputClass} value={traveler.firstName}
                          onChange={(e) => setTravelerField(i, "firstName", e.target.value)}
                          placeholder="John" />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name *</label>
                        <input className={inputClass} value={traveler.lastName}
                          onChange={(e) => setTravelerField(i, "lastName", e.target.value)}
                          placeholder="Doe" />
                      </div>
                      <div>
                        <label className={labelClass}>Email *</label>
                        <input className={inputClass} type="email" value={traveler.email}
                          onChange={(e) => setTravelerField(i, "email", e.target.value)}
                          placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className={labelClass}>Phone *</label>
                        <input className={inputClass} value={traveler.phone}
                          onChange={(e) => setTravelerField(i, "phone", e.target.value)}
                          placeholder="+977 98XXXXXXXX" />
                      </div>
                      <div>
                        <label className={labelClass}>Nationality *</label>
                        <input className={inputClass} value={traveler.nationality}
                          onChange={(e) => setTravelerField(i, "nationality", e.target.value)}
                          placeholder="Nepali" />
                      </div>
                      <div>
                        <label className={labelClass}>Passport Number <span style={{ color: "var(--color-outline)", fontWeight: 400 }}>(optional)</span></label>
                        <input className={inputClass} value={traveler.passportNumber}
                          onChange={(e) => setTravelerField(i, "passportNumber", e.target.value)}
                          placeholder="A1234567" />
                      </div>
                    </div>
                  </div>
                ))}

                {error && (
                  <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(186,26,26,0.1)", color: "var(--color-error)" }}>
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-secondary" style={{ height: 48 }}>
                    ← Back
                  </button>
                  <button onClick={handleStep2} className="btn-primary flex-1" style={{ height: 48 }}>
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Payment */}
            {step === 2 && (
              <div className="card" style={{ padding: 28 }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-5" style={{ color: "var(--color-outline)" }}>
                  STEP 3: PAYMENT
                </p>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm"
                    style={{ backgroundColor: "rgba(216,90,48,0.1)", color: "var(--color-danger)", border: "1px solid rgba(216,90,48,0.2)" }}>
                    <span>⚠️</span>
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-5">
                  {/* Payment methods */}
                  <div>
                    <label className={labelClass}>Select Payment Method</label>
                    <div className="grid grid-cols-4 gap-3">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.key}
                          type="button"
                          onClick={() => setPaymentMethod(method.key)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                          style={{
                            borderColor: paymentMethod === method.key ? method.color : "var(--color-outline-variant)",
                            backgroundColor: paymentMethod === method.key ? `${method.color}10` : "white",
                          }}
                        >
                          <span className="text-2xl">{method.icon}</span>
                          <span className="text-xs font-semibold" style={{ color: paymentMethod === method.key ? method.color : "var(--color-on-surface)" }}>
                            {method.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment instructions */}
                  <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--color-surface-low)", border: "1px solid var(--color-outline-variant)" }}>
                    {paymentMethod === "esewa" && (
                      <div>
                        <p className="font-semibold text-sm mb-2" style={{ color: "var(--color-on-surface)" }}>eSewa Payment</p>
                        <p className="text-xs mb-1" style={{ color: "var(--color-outline)" }}>Send payment to eSewa ID: <strong>9800000000</strong></p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>Amount: <strong>NPR {totalPrice.toLocaleString()}</strong></p>
                      </div>
                    )}
                    {paymentMethod === "khalti" && (
                      <div>
                        <p className="font-semibold text-sm mb-2" style={{ color: "var(--color-on-surface)" }}>Khalti Payment</p>
                        <p className="text-xs mb-1" style={{ color: "var(--color-outline)" }}>Send payment to Khalti ID: <strong>9800000001</strong></p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>Amount: <strong>NPR {totalPrice.toLocaleString()}</strong></p>
                      </div>
                    )}
                    {paymentMethod === "bank" && (
                      <div>
                        <p className="font-semibold text-sm mb-2" style={{ color: "var(--color-on-surface)" }}>Bank Transfer</p>
                        <p className="text-xs mb-1" style={{ color: "var(--color-outline)" }}>Bank: <strong>Nepal Investment Bank</strong></p>
                        <p className="text-xs mb-1" style={{ color: "var(--color-outline)" }}>Account: <strong>0010000123456789</strong></p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>Amount: <strong>NPR {totalPrice.toLocaleString()}</strong></p>
                      </div>
                    )}
                    {paymentMethod === "card" && (
                      <div>
                        <p className="font-semibold text-sm mb-2" style={{ color: "var(--color-on-surface)" }}>Credit/Debit Card</p>
                        <p className="text-xs" style={{ color: "var(--color-outline)" }}>Enter your card details and transaction ID after payment.</p>
                      </div>
                    )}
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className={labelClass}>Transaction ID *</label>
                    <input
                      className={inputClass}
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID after payment"
                    />
                    <p className="text-xs mt-1.5" style={{ color: "var(--color-outline)" }}>
                      Your booking is held for 15 minutes after submission.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-secondary" style={{ height: 48 }}>
                      ← Back
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={submitting}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                      style={{ height: 48 }}
                    >
                      {submitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                      ) : (
                        `Confirm Booking — NPR ${totalPrice.toLocaleString()}`
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-center" style={{ color: "var(--color-outline)" }}>
                    Need help? Contact support | 0800-NEPAL-HELP
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="shrink-0 sticky top-6" style={{ width: 280 }}>
            <div className="card" style={{ padding: 20 }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: "var(--color-outline)" }}>
                ORDER SUMMARY
              </p>

              {/* Package image */}
              <div className="relative rounded-xl overflow-hidden mb-3" style={{ height: 120 }}>
                {pkg.coverImage ? (
                  <Image src={pkg.coverImage} alt={pkg.title} fill sizes="280px" className="object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: "var(--color-surface-high)" }} />
                )}
              </div>

              <h3 className="font-bold text-sm mb-1" style={{ color: "var(--color-on-surface)" }}>{pkg.title}</h3>
              <Stars rating={pkg.rating} />
              <div className="flex gap-3 mt-2 mb-4">
                <span className="text-xs" style={{ color: "var(--color-outline)" }}>{pkg.duration} days</span>
                <span className="text-xs capitalize" style={{ color: "var(--color-outline)" }}>• {pkg.difficulty}</span>
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2 mb-4 pt-3" style={{ borderTop: "1px solid var(--color-surface-high)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-on-surface-variant)" }}>
                    NPR {pkg.price.toLocaleString()} × {groupSize}
                  </span>
                  <span style={{ color: "var(--color-on-surface)" }}>NPR {totalPrice.toLocaleString()}</span>
                </div>
                {startDate && (
                  <div className="flex justify-between text-xs" style={{ color: "var(--color-outline)" }}>
                    <span>Date</span>
                    <span>{new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs" style={{ color: "var(--color-outline)" }}>
                  <span>Group</span>
                  <span>× {groupSize} persons</span>
                </div>
              </div>

              <div className="flex justify-between font-bold pt-3" style={{ borderTop: "2px solid var(--color-primary)" }}>
                <span style={{ color: "var(--color-on-surface)" }}>TOTAL</span>
                <span style={{ color: "var(--color-primary)" }}>NPR {totalPrice.toLocaleString()}</span>
              </div>

              {/* Free cancellation badge */}
              <div className="mt-4 p-3 rounded-xl text-center" style={{ backgroundColor: "rgba(0,108,73,0.06)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>✓ Free cancellation</p>
                <p className="text-xs" style={{ color: "var(--color-outline)" }}>within 48 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}