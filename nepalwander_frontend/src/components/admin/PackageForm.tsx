/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { packagesApi } from "@/lib/api/packages";
import { destinationsApi } from "@/lib/api/destinations";
import { Package, Destination } from "@/types";
import ImageUpload from "@/components/admin/ImageUpload";
import MultiImageUpload from "@/components/admin/MultiUpload";

const DIFFICULTIES = ["easy", "moderate", "hard", "extreme"];
const STATUSES = ["draft", "published", "archived"];

interface DayItinerary {
  day: number;
  title: string;
  description: string;
  accommodation: string;
  meals: string;
  distance: string;
}

interface PackageFormProps {
  initial?: Partial<Package>;
  id?: string;
}

const defaultCost = { transport: 0, accommodation: 0, meals: 0, guide: 0, permits: 0, other: 0 };

export default function PackageForm({ initial, id }: PackageFormProps) {
  const router = useRouter();
  const isEdit = !!id;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "itinerary" | "cost" | "extras">("basic");

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    destination: typeof initial?.destination === "object" ? (initial.destination as Destination)._id : initial?.destination ?? "",
    duration: initial?.duration ?? 1,
    difficulty: initial?.difficulty ?? "easy",
    price: initial?.price ?? 0,
    coverImage: initial?.coverImage ?? "",
    images: initial?.images ?? [],
    status: initial?.status ?? "draft",
    isFeatured: initial?.isFeatured ?? false,
    isBestSeller: initial?.isBestSeller ?? false,
    ecoScore: initial?.ecoScore ?? 0,
    groupSizeMin: initial?.groupSize?.min ?? 1,
    groupSizeMax: initial?.groupSize?.max ?? 12,
    includes: initial?.includes?.join("\n") ?? "",
    excludes: initial?.excludes?.join("\n") ?? "",
    costBreakdown: initial?.costBreakdown ?? { ...defaultCost },
  });

  const [itinerary, setItinerary] = useState<DayItinerary[]>(
    initial?.itinerary?.map((d) => ({
      day: d.day,
      title: d.title,
      description: d.description,
      accommodation: d.accommodation ?? "",
      meals: d.meals ?? "",
      distance: d.distance?.toString() ?? "",
    })) ?? [{ day: 1, title: "", description: "", accommodation: "", meals: "", distance: "" }]
  );

  useEffect(() => {
    destinationsApi.getAll({ limit: "100" }).then((data) => setDestinations(data.destinations));
  }, []);

  useEffect(() => {
    const dur = Number(form.duration);
    setItinerary((prev) => {
      if (dur > prev.length) {
        const extra = Array.from({ length: dur - prev.length }, (_, i) => ({
          day: prev.length + i + 1,
          title: "",
          description: "",
          accommodation: "",
          meals: "",
          distance: "",
        }));
        return [...prev, ...extra];
      }
      return prev.slice(0, dur);
    });
  }, [form.duration]);

  const set = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));
  const setCost = (key: string, value: string) =>
    setForm((p) => ({ ...p, costBreakdown: { ...p.costBreakdown, [key]: Number(value) } }));

  const setItineraryField = (index: number, key: keyof DayItinerary, value: string) =>
    setItinerary((prev) => prev.map((d, i) => i === index ? { ...d, [key]: value } : d));

  const costTotal = Object.values(form.costBreakdown).reduce((a, b) => a + Number(b), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description,
      destination: form.destination,
      duration: Number(form.duration),
      difficulty: form.difficulty,
      price: Number(form.price),
      coverImage: form.coverImage,
      images: form.images,
      status: form.status,
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      ecoScore: Number(form.ecoScore),
      groupSize: { min: Number(form.groupSizeMin), max: Number(form.groupSizeMax) },
      includes: form.includes.split("\n").map((s) => s.trim()).filter(Boolean),
      excludes: form.excludes.split("\n").map((s) => s.trim()).filter(Boolean),
      costBreakdown: form.costBreakdown,
      itinerary: itinerary.map((d) => ({
        day: d.day,
        title: d.title,
        description: d.description,
        accommodation: d.accommodation || undefined,
        meals: d.meals || undefined,
        distance: d.distance ? Number(d.distance) : undefined,
      })),
    };

    try {
      if (isEdit) {
        await packagesApi.update(id, payload);
      } else {
        await packagesApi.create(payload);
      }
      router.push("/admin/packages");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "input-field";
  const labelClass = "block text-xs font-semibold mb-1.5";
  const sectionClass = "card flex flex-col gap-4";

  const TABS = [
    { key: "basic", label: "Basic Info" },
    { key: "itinerary", label: `Itinerary (${Number(form.duration)} days)` },
    { key: "cost", label: "Cost Breakdown" },
    { key: "extras", label: "Includes / Excludes" },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-5">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: "rgba(186,26,26,0.1)", color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--color-surface-high)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
            style={{
              backgroundColor: activeTab === tab.key ? "white" : "transparent",
              color: activeTab === tab.key ? "var(--color-primary)" : "var(--color-outline)",
              boxShadow: activeTab === tab.key ? "var(--shadow-card)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BASIC INFO ── */}
      {activeTab === "basic" && (
        <div className={sectionClass}>
          <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Package Title *</label>
              <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="e.g. Annapurna Circuit Trek — 14 Days" />
            </div>

            <div>
              <label className={labelClass}>Destination *</label>
              <select className={inputClass} value={form.destination} onChange={(e) => set("destination", e.target.value)} required>
                <option value="">Select destination</option>
                {destinations.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Difficulty *</label>
              <select className={inputClass} value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Duration (days) *</label>
              <input className={inputClass} type="number" min={1} max={60} value={form.duration}
                onChange={(e) => set("duration", e.target.value)} required />
            </div>

            <div>
              <label className={labelClass}>Price (USD) *</label>
              <input className={inputClass} type="number" min={0} value={form.price}
                onChange={(e) => set("price", e.target.value)} required placeholder="0" />
            </div>

            <div>
              <label className={labelClass}>Group Size Min</label>
              <input className={inputClass} type="number" min={1} value={form.groupSizeMin}
                onChange={(e) => set("groupSizeMin", e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Group Size Max</label>
              <input className={inputClass} type="number" min={1} value={form.groupSizeMax}
                onChange={(e) => set("groupSizeMax", e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Eco Score (0–5)</label>
              <input className={inputClass} type="number" min={0} max={5} step={0.1} value={form.ecoScore}
                onChange={(e) => set("ecoScore", e.target.value)} />
            </div>

            <div className="col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="w-4 h-4 accent-primary" />
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input type="checkbox" checked={form.isBestSeller} onChange={(e) => set("isBestSeller", e.target.checked)} className="w-4 h-4 accent-primary" />
                Best Seller
              </label>
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Description *</label>
              <textarea className={inputClass} style={{ height: 100, paddingTop: 12, resize: "vertical" }}
                value={form.description} onChange={(e) => set("description", e.target.value)}
                required placeholder="Describe this package (min 20 chars)" />
            </div>

            <div className="col-span-2">
              <ImageUpload
                label="Cover Image"
                value={form.coverImage}
                onChange={(url) => set("coverImage", url)}
                folder="nepalwander/packages"
              />
            </div>

            <div className="col-span-2">
              <MultiImageUpload
                label="Additional Images"
                values={form.images}
                onChange={(urls: string[]) => set("images", urls)}
                folder="nepalwander/packages"
                max={8}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── ITINERARY ── */}
      {activeTab === "itinerary" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs" style={{ color: "var(--color-outline)" }}>
            {Number(form.duration)} day{Number(form.duration) !== 1 ? "s" : ""} — change duration in Basic Info to add/remove days.
          </p>
          {itinerary.map((day, i) => (
            <div key={day.day} className={sectionClass} style={{ gap: 12 }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: "var(--color-primary)" }}>
                  {day.day}
                </div>
                <input
                  className={inputClass}
                  value={day.title}
                  onChange={(e) => setItineraryField(i, "title", e.target.value)}
                  placeholder={`Day ${day.day} title`}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  className={inputClass}
                  style={{ height: 80, paddingTop: 10, resize: "vertical" }}
                  value={day.description}
                  onChange={(e) => setItineraryField(i, "description", e.target.value)}
                  placeholder="What happens on this day..."
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Accommodation</label>
                  <input className={inputClass} value={day.accommodation}
                    onChange={(e) => setItineraryField(i, "accommodation", e.target.value)}
                    placeholder="e.g. Teahouse" />
                </div>
                <div>
                  <label className={labelClass}>Meals</label>
                  <input className={inputClass} value={day.meals}
                    onChange={(e) => setItineraryField(i, "meals", e.target.value)}
                    placeholder="e.g. B/L/D" />
                </div>
                <div>
                  <label className={labelClass}>Distance (km)</label>
                  <input className={inputClass} type="number" min={0} value={day.distance}
                    onChange={(e) => setItineraryField(i, "distance", e.target.value)}
                    placeholder="0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── COST BREAKDOWN ── */}
      {activeTab === "cost" && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Cost Breakdown</h2>
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--color-outline)" }}>Total from breakdown</p>
              <p className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>${costTotal.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs" style={{ color: "var(--color-outline)" }}>
            These fields break down the package price for transparency. The actual price is set in Basic Info.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {(["transport", "accommodation", "meals", "guide", "permits", "other"] as const).map((key) => (
              <div key={key}>
                <label className={labelClass}>{key.charAt(0).toUpperCase() + key.slice(1)} (USD)</label>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={form.costBreakdown[key]}
                  onChange={(e) => setCost(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INCLUDES / EXCLUDES ── */}
      {activeTab === "extras" && (
        <div className={sectionClass}>
          <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Includes & Excludes</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <span className="text-success">✓</span> Includes (one per line)
              </label>
              <textarea
                className={inputClass}
                style={{ height: 200, paddingTop: 12, resize: "vertical" }}
                value={form.includes}
                onChange={(e) => set("includes", e.target.value)}
                placeholder={"Airport pickup&#10;All meals&#10;Experienced guide&#10;Permits & fees"}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="text-danger">✗</span> Excludes (one per line)
              </label>
              <textarea
                className={inputClass}
                style={{ height: 200, paddingTop: 12, resize: "vertical" }}
                value={form.excludes}
                onChange={(e) => set("excludes", e.target.value)}
                placeholder={"International flights&#10;Travel insurance&#10;Personal expenses&#10;Tips"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
        <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ height: 44 }}>
          Cancel
        </button>
        <div className="flex items-center gap-3">
          {activeTab !== "basic" && (
            <button type="button" onClick={() => {
              const order = ["basic", "itinerary", "cost", "extras"] as const;
              setActiveTab(order[order.indexOf(activeTab) - 1]);
            }} className="btn-secondary" style={{ height: 44 }}>
              ← Back
            </button>
          )}
          {activeTab !== "extras" ? (
            <button type="button" onClick={() => {
              const order = ["basic", "itinerary", "cost", "extras"] as const;
              setActiveTab(order[order.indexOf(activeTab) + 1]);
            }} className="btn-primary" style={{ height: 44 }}>
              Next →
            </button>
          ) : (
            <button type="submit" className="btn-primary" style={{ height: 44 }} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Package"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}