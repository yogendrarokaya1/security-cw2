/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { plannerApi } from "@/lib/api/planner";

const INTERESTS = [
  { key: "trekking", label: "Trekking", icon: "🥾" },
  { key: "cultural", label: "Cultural", icon: "🏛️" },
  { key: "wildlife", label: "Wildlife", icon: "🐘" },
  { key: "adventure", label: "Adventure", icon: "⛰️" },
  { key: "spiritual", label: "Spiritual", icon: "🕌" },
  { key: "photography", label: "Photography", icon: "📷" },
  { key: "culinary", label: "Food Tour", icon: "🍜" },
  { key: "boating", label: "Boating", icon: "🚤" },
  { key: "paragliding", label: "Paragliding", icon: "🪂" },
];

const DURATIONS = [1, 2, 3, 5, 7, 10, 14];
const FITNESS_LEVELS = [
  { key: "easy", label: "Beginner" },
  { key: "moderate", label: "Intermediate" },
  { key: "hard", label: "Advanced" },
];
const TRIP_MODES = [
  { key: "budget", label: "Budget", budgetRange: { min: 0, max: 30000 } },
  { key: "comfort", label: "Comfort", budgetRange: { min: 30000, max: 80000 } },
  { key: "luxury", label: "Luxury", budgetRange: { min: 80000, max: 500000 } },
];

const STEPS = ["Preferences", "Itinerary", "Confirm"];

interface PlanResult {
  recommendedPackage: {
    id: string;
    title: string;
    slug?: string;
    duration: number;
    difficulty: string;
    price: number;
    rating: number;
    isBestSeller: boolean;
  };
  destination: {
    name: string;
    region: string;
    altitude: number;
  } | null;
  tripSummary: {
    startDate: string;
    endDate: string;
    duration: number;
    groupSize: number;
    fitnessLevel: string;
  };
  seasonInfo: {
    status: string;
    message: string;
  };
  costBreakdown: {
    transport: number;
    accommodation: number;
    meals: number;
    guide: number;
    permits: number;
    other: number;
    total: number;
    perPerson: number;
  };
  itinerary: {
    day: number;
    date: string;
    title: string;
    description: string;
    accommodation?: string;
    meals?: string;
    distance?: number;
  }[];
  includes: string[];
  excludes: string[];
  alternatives: {
    id: string;
    title: string;
    duration: number;
    difficulty: string;
    price: number;
    rating: number;
  }[];
}

export default function PlanPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanResult | null>(null);

  // Form state
  const [budget, setBudget] = useState("");
  const [tripMode, setTripMode] = useState("budget");
  const [duration, setDuration] = useState(3);
  const [interests, setInterests] = useState<string[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState("easy");
  const [groupSize, setGroupSize] = useState(2);
  const [startDate, setStartDate] = useState("");

  const toggleInterest = (key: string) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  const getBudgetRange = () => {
    if (budget) {
      const val = Number(budget);
      return { min: Math.max(0, val * 0.5), max: val };
    }
    const mode = TRIP_MODES.find((m) => m.key === tripMode);
    return mode?.budgetRange ?? { min: 0, max: 500000 };
  };

  const handleGenerate = async () => {
    if (interests.length === 0) { setError("Please select at least one interest."); return; }
    if (!startDate) { setError("Please select a start date."); return; }
    setError("");
    setGenerating(true);
    try {
      const result = await plannerApi.generate({
        budget: getBudgetRange(),
        duration,
        groupSize,
        interests,
        fitnessLevel,
        startDate,
      });
      setPlan(result);
      setStep(1);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setError(msg ?? "No matching packages found. Try adjusting your preferences.");
    } finally {
      setGenerating(false);
    }
  };

  // Get the booking URL — use slug if available, fallback to id
  const getBookingUrl = () => {
    if (!plan) return "/packages";
    const identifier = plan.recommendedPackage.slug ?? plan.recommendedPackage.id;
    return `/packages/${identifier}/book`;
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div className="text-center py-12 px-4">
        <h1 className="font-bold mb-3" style={{ fontSize: 38, color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
          SMART TRIP PLANNER ✨
        </h1>
        <p style={{ color: "var(--color-outline)", fontSize: 16 }}>
          Tell us your preferences — we'll plan the perfect Nepal trip.
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mt-8" style={{ maxWidth: 480, margin: "32px auto 0" }}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    backgroundColor: i <= step ? "var(--color-primary)" : "var(--color-surface-high)",
                    color: i <= step ? "white" : "var(--color-outline)",
                  }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <p className="text-xs font-semibold mt-1.5"
                  style={{ color: i === step ? "var(--color-primary)" : "var(--color-outline)" }}>
                  {s}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mb-5"
                  style={{ backgroundColor: i < step ? "var(--color-primary)" : "var(--color-outline-variant)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="container-main pb-16">
        <div className="flex gap-6 items-start">

          {/* ── LEFT: Form / Result ── */}
          <div className="flex-1 min-w-0">

            {/* STEP 0 — Preferences */}
            {step === 0 && (
              <div className="card" style={{ padding: 28 }}>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs font-bold px-2.5 py-1 rounded text-white" style={{ backgroundColor: "var(--color-primary)" }}>STEP 1</span>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>Your Preferences</p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>Total Budget (NPR)</label>
                    <input className="input-field" type="number" placeholder="e.g. 150,000" value={budget} onChange={(e) => setBudget(e.target.value)} min={0} />
                    <p className="text-xs mt-1.5" style={{ color: "var(--color-outline)" }}>Based on your budget we'll suggest matching packages</p>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>Number of Days</label>
                    <div className="flex flex-wrap gap-2">
                      {DURATIONS.map((d) => (
                        <button key={d} type="button" onClick={() => setDuration(d)}
                          className="w-12 h-12 rounded-xl text-sm font-semibold border transition-all"
                          style={{
                            backgroundColor: duration === d ? "var(--color-primary)" : "white",
                            color: duration === d ? "white" : "var(--color-on-surface)",
                            borderColor: duration === d ? "var(--color-primary)" : "var(--color-outline-variant)",
                          }}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>
                      Interests <span className="font-normal" style={{ color: "var(--color-outline)" }}>(select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((interest) => {
                        const selected = interests.includes(interest.key);
                        return (
                          <button key={interest.key} type="button" onClick={() => toggleInterest(interest.key)}
                            className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-medium border transition-all"
                            style={{
                              backgroundColor: selected ? "var(--color-primary)" : "white",
                              color: selected ? "white" : "var(--color-on-surface)",
                              borderColor: selected ? "var(--color-primary)" : "var(--color-outline-variant)",
                            }}>
                            <span>{interest.icon}</span>{interest.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trip Mode + Fitness Level */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>Trip Mode</label>
                      <div className="flex gap-2">
                        {TRIP_MODES.map((mode) => (
                          <button key={mode.key} type="button" onClick={() => setTripMode(mode.key)}
                            className="flex-1 h-10 rounded-xl text-sm font-semibold border transition-all"
                            style={{
                              backgroundColor: tripMode === mode.key ? "var(--color-primary)" : "white",
                              color: tripMode === mode.key ? "white" : "var(--color-on-surface)",
                              borderColor: tripMode === mode.key ? "var(--color-primary)" : "var(--color-outline-variant)",
                            }}>
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>Fitness Level</label>
                      <div className="flex gap-2">
                        {FITNESS_LEVELS.map((level) => (
                          <button key={level.key} type="button" onClick={() => setFitnessLevel(level.key)}
                            className="flex-1 h-10 rounded-xl text-sm font-semibold border transition-all"
                            style={{
                              backgroundColor: fitnessLevel === level.key ? "var(--color-primary)" : "white",
                              color: fitnessLevel === level.key ? "white" : "var(--color-on-surface)",
                              borderColor: fitnessLevel === level.key ? "var(--color-primary)" : "var(--color-outline-variant)",
                            }}>
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Group Size + Start Date */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>Group Size</label>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setGroupSize((g) => Math.max(1, g - 1))}
                          className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-lg"
                          style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}>−</button>
                        <span className="w-10 text-center font-bold text-lg" style={{ color: "var(--color-on-surface)" }}>{groupSize}</span>
                        <button type="button" onClick={() => setGroupSize((g) => Math.min(50, g + 1))}
                          className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-lg"
                          style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}>+</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>Start Date</label>
                      <input className="input-field" type="date" min={minDate} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                  </div>

                  {error && (
                    <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: "rgba(186,26,26,0.1)", color: "var(--color-error)" }}>
                      {error}
                    </div>
                  )}

                  <button onClick={handleGenerate} disabled={generating}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    style={{ height: 52, fontSize: 15, letterSpacing: "0.04em" }}>
                    {generating ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating your plan...</>
                    ) : <>GENERATE MY ITINERARY ✨</>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1 — Itinerary */}
            {step === 1 && plan && (
              <div className="flex flex-col gap-4">
                <div className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: plan.seasonInfo.status === "best" ? "rgba(29,158,117,0.1)" :
                      plan.seasonInfo.status === "avoid" ? "rgba(216,90,48,0.1)" : "rgba(240,165,0,0.1)",
                    color: plan.seasonInfo.status === "best" ? "var(--color-success)" :
                      plan.seasonInfo.status === "avoid" ? "var(--color-danger)" : "var(--color-warning)",
                  }}>
                  {plan.seasonInfo.message}
                </div>

                <div className="card" style={{ padding: 24 }}>
                  <h2 className="font-bold text-base mb-5" style={{ color: "var(--color-on-surface)" }}>Day-wise Itinerary</h2>
                  <div className="flex flex-col gap-0">
                    {plan.itinerary.map((day, i) => (
                      <div key={day.day} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: "var(--color-primary)" }}>
                            {String(day.day).padStart(2, "0")}
                          </div>
                          {i < plan.itinerary.length - 1 && (
                            <div className="w-px flex-1 my-1" style={{ backgroundColor: "var(--color-outline-variant)", minHeight: 24 }} />
                          )}
                        </div>
                        <div className="pb-5 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>{day.title}</p>
                            <span className="text-xs" style={{ color: "var(--color-outline)" }}>
                              {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>{day.description}</p>
                          <div className="flex flex-wrap gap-3 mt-1.5">
                            {day.accommodation && <span className="text-xs" style={{ color: "var(--color-outline)" }}>🏠 {day.accommodation}</span>}
                            {day.meals && <span className="text-xs" style={{ color: "var(--color-outline)" }}>🍽️ {day.meals}</span>}
                            {day.distance && <span className="text-xs" style={{ color: "var(--color-outline)" }}>📍 {day.distance} km</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {plan.alternatives?.length > 0 && (
                  <div className="card" style={{ padding: 20 }}>
                    <p className="font-bold text-sm mb-3" style={{ color: "var(--color-on-surface)" }}>Alternative Packages</p>
                    <div className="flex flex-col gap-3">
                      {plan.alternatives.map((alt) => (
                        <div key={alt.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--color-surface-low)" }}>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>{alt.title}</p>
                            <p className="text-xs" style={{ color: "var(--color-outline)" }}>{alt.duration} days • {alt.difficulty}</p>
                          </div>
                          <p className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>NPR {alt.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => { setStep(0); setPlan(null); }} className="btn-secondary flex-1" style={{ height: 48 }}>← Start Over</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1" style={{ height: 48 }}>Confirm This Plan →</button>
                </div>
              </div>
            )}

            {/* STEP 2 — Confirm */}
            {step === 2 && plan && (
              <div className="card flex flex-col items-center text-center" style={{ padding: 40 }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
                  style={{ backgroundColor: "rgba(0,108,73,0.1)" }}>🎉</div>
                <h2 className="font-bold text-xl mb-2" style={{ color: "var(--color-on-surface)" }}>Your Trip is Planned!</h2>
                <p className="text-sm mb-1" style={{ color: "var(--color-on-surface-variant)" }}>{plan.recommendedPackage.title}</p>
                <p className="text-sm mb-6" style={{ color: "var(--color-outline)" }}>
                  {plan.tripSummary.startDate} → {plan.tripSummary.endDate} • {plan.tripSummary.groupSize} {plan.tripSummary.groupSize === 1 ? "person" : "people"}
                </p>

                {/* Login check before booking */}
                {!user ? (
                  <div className="w-full max-w-sm">
                    <div className="px-4 py-3 rounded-xl mb-4 text-sm"
                      style={{ backgroundColor: "rgba(240,165,0,0.1)", color: "var(--color-warning)", border: "1px solid rgba(240,165,0,0.2)" }}>
                      🔒 You need to be logged in to book this trip.
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="btn-secondary flex-1" style={{ height: 48 }}>← Back</button>
                      <Link href={`/login?redirect=/packages/${plan.recommendedPackage.slug ?? plan.recommendedPackage.id}/book`}
                        className="btn-primary flex-1 text-center" style={{ height: 48, lineHeight: "48px" }}>
                        Login to Book
                      </Link>
                    </div>
                    <p className="text-xs mt-3" style={{ color: "var(--color-outline)" }}>
                      Don't have an account? <Link href="/register" className="font-semibold" style={{ color: "var(--color-primary)" }}>Register free</Link>
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3 w-full" style={{ maxWidth: 360 }}>
                    <button onClick={() => setStep(1)} className="btn-secondary flex-1" style={{ height: 48 }}>← Back</button>
                    <Link href={getBookingUrl()} className="btn-primary flex-1 text-center" style={{ height: 48, lineHeight: "48px" }}>
                      Book Now
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Plan Preview ── */}
          <div className="shrink-0 sticky top-6" style={{ width: 340 }}>
            {!plan ? (
              <div className="card flex flex-col items-center justify-center text-center" style={{ padding: 40, minHeight: 300 }}>
                <span className="text-4xl mb-4">🗺️</span>
                <p className="font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>Your personalized itinerary will appear here</p>
                <p className="text-sm" style={{ color: "var(--color-outline)" }}>Fill in your preferences and click Generate</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--color-navy)" }}>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-primary)" }}>
                      PERSONALIZED ITINERARY ✨
                    </p>
                    <div className="flex flex-wrap gap-3 mb-5">
                      {plan.destination && <span className="text-xs text-white">📍 {plan.destination.name}</span>}
                      <span className="text-xs text-white">🎒 {plan.tripSummary.fitnessLevel.charAt(0).toUpperCase() + plan.tripSummary.fitnessLevel.slice(1)} Mode</span>
                      <span className="text-xs text-white">👥 {plan.tripSummary.groupSize} {plan.tripSummary.groupSize === 1 ? "Person" : "People"}</span>
                    </div>

                    <div className="flex flex-col gap-3 mb-5">
                      {plan.itinerary.slice(0, 3).map((day) => (
                        <div key={day.day} className="flex gap-3">
                          <span className="text-xs font-bold shrink-0 mt-0.5" style={{ color: "var(--color-primary)", width: 20 }}>
                            {String(day.day).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{day.title}</p>
                            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                              {day.description.slice(0, 80)}{day.description.length > 80 ? "..." : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                      {plan.itinerary.length > 3 && (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>+{plan.itinerary.length - 3} more days...</p>
                      )}
                    </div>

                    <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-primary)" }}>COST BREAKDOWN</p>
                      <div className="flex flex-col gap-2">
                        {[
                          { label: "Transport", value: plan.costBreakdown.transport },
                          { label: "Accommodation", value: plan.costBreakdown.accommodation },
                          { label: "Meals", value: plan.costBreakdown.meals },
                          { label: "Guide", value: plan.costBreakdown.guide },
                          { label: "Permits", value: plan.costBreakdown.permits },
                        ].filter(item => item.value > 0).map((item) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                            <span className="text-xs font-medium text-white">NPR {item.value.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                          <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>TOTAL</span>
                          <span className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>NPR {plan.costBreakdown.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative" style={{ height: 140 }}>
                    <div className="absolute inset-0" style={{ background: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600') center/cover" }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,27,42,0.9) 0%, rgba(13,27,42,0.3) 100%)" }} />
                    <div className="absolute bottom-4 left-4">
                      <p className="font-bold text-white text-sm">{plan.destination ? `Adventure Awaits in ${plan.destination.name}` : "Adventure Awaits"}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Your personalized experience is ready.</p>
                    </div>
                  </div>
                </div>

                {/* Book CTA — shows login prompt if not logged in */}
                {!user ? (
                  <Link href={`/login?redirect=${getBookingUrl()}`}
                    className="btn-primary w-full text-center"
                    style={{ height: 52, fontSize: 15, letterSpacing: "0.04em" }}>
                    🔒 LOGIN TO BOOK THIS TRIP
                  </Link>
                ) : (
                  <Link href={getBookingUrl()}
                    className="btn-primary w-full text-center"
                    style={{ height: 52, fontSize: 15, letterSpacing: "0.04em" }}>
                    BOOK THIS TRIP NOW
                  </Link>
                )}

                <p className="text-xs text-center" style={{ color: "var(--color-outline)" }}>
                  NPR {plan.costBreakdown.perPerson.toLocaleString()} per person · {plan.tripSummary.duration} days
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}