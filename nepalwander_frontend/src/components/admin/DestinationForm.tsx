"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { destinationsApi } from "@/lib/api/destinations";
import { Destination } from "@/types";
import ImageUpload from "@/components/admin/ImageUpload";
import MultiImageUpload from "@/components/admin/MultiUpload";

const REGIONS = ["himalaya", "terai", "pokhara", "kathmandu", "mustang", "eastern"];
const DIFFICULTIES = ["easy", "moderate", "hard", "extreme"];
const RISK_LEVELS = ["low", "medium", "high", "extreme"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const defaultSeasonalCalendar = MONTHS.map((month) => ({
  month,
  status: "shoulder" as "best" | "shoulder" | "avoid",
}));

interface DestinationFormProps {
  initial?: Partial<Destination>;
  id?: string;
}

export default function DestinationForm({ initial, id }: DestinationFormProps) {
  const router = useRouter();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    region: initial?.region ?? "himalaya",
    altitude: initial?.altitude ?? 0,
    difficulty: initial?.difficulty ?? "easy",
    coverImage: initial?.coverImage ?? "",
    images: initial?.images ?? [],
    locationLat: initial?.location?.latitude ?? 27.7172,
    locationLng: initial?.location?.longitude ?? 85.3240,
    localTips: initial?.localTips?.join("\n") ?? "",
    bestFor: initial?.bestFor?.join(", ") ?? "",
    isFeatured: initial?.isFeatured ?? false,
    isActive: initial?.isActive ?? true,
    safetyInfo: {
      riskLevel: initial?.safetyInfo?.riskLevel ?? "low",
      nearestHospital: initial?.safetyInfo?.nearestHospital ?? "",
      emergencyContact: initial?.safetyInfo?.emergencyContact ?? "",
      rescueService: initial?.safetyInfo?.rescueService ?? "",
      timsRequired: initial?.safetyInfo?.timsRequired ?? false,
      timsCheckpoint: initial?.safetyInfo?.timsCheckpoint ?? "",
    },
    seasonalCalendar: initial?.seasonalCalendar ?? defaultSeasonalCalendar,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setSafety = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, safetyInfo: { ...prev.safetyInfo, [key]: value } }));

  const setSeasonStatus = (month: string, status: "best" | "shoulder" | "avoid") =>
    setForm((prev) => ({
      ...prev,
      seasonalCalendar: prev.seasonalCalendar.map((s) =>
        s.month === month ? { ...s, status } : s
      ),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      description: form.description,
      region: form.region,
      altitude: Number(form.altitude),
      difficulty: form.difficulty,
      coverImage: form.coverImage,
      images: form.images,
      location: { latitude: Number(form.locationLat), longitude: Number(form.locationLng) },
      localTips: form.localTips.split("\n").map((s) => s.trim()).filter(Boolean),
      bestFor: form.bestFor.split(",").map((s) => s.trim()).filter(Boolean),
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      safetyInfo: form.safetyInfo,
      seasonalCalendar: form.seasonalCalendar,
    };

    try {
      if (isEdit) {
        await destinationsApi.update(id, payload);
      } else {
        await destinationsApi.create(payload);
      }
      router.push("/admin/destinations");
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

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-5">

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: "rgba(186,26,26,0.1)", color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className={sectionClass}>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Destination Name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. Annapurna Base Camp" />
          </div>
          <div>
            <label className={labelClass}>Region *</label>
            <select className={inputClass} value={form.region} onChange={(e) => set("region", e.target.value)}>
              {REGIONS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Difficulty *</label>
            <select className={inputClass} value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Altitude (m) *</label>
            <input className={inputClass} type="number" value={form.altitude} onChange={(e) => set("altitude", e.target.value)} required min={0} />
          </div>
          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="w-4 h-4 accent-primary" />
              Featured
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-primary" />
              Active
            </label>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              className={inputClass}
              style={{ height: 100, paddingTop: 12, resize: "vertical" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
              placeholder="Describe this destination (min 20 chars)"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className={sectionClass}>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Images</h2>
        <ImageUpload
          label="Cover Image"
          value={form.coverImage}
          onChange={(url) => set("coverImage", url)}
          folder="nepalwander/destinations"
        />
        <MultiImageUpload
          label="Additional Images"
          values={form.images}
          onChange={(urls) => set("images", urls)}
          folder="nepalwander/destinations"
          max={8}
        />
      </div>

      {/* Location */}
      <div className={sectionClass}>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Latitude *</label>
            <input className={inputClass} type="number" step="any" value={form.locationLat} onChange={(e) => set("locationLat", e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Longitude *</label>
            <input className={inputClass} type="number" step="any" value={form.locationLng} onChange={(e) => set("locationLng", e.target.value)} required />
          </div>
        </div>
      </div>

      {/* Safety Info */}
      <div className={sectionClass}>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Safety Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Risk Level *</label>
            <select className={inputClass} value={form.safetyInfo.riskLevel} onChange={(e) => setSafety("riskLevel", e.target.value)}>
              {RISK_LEVELS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Emergency Contact *</label>
            <input className={inputClass} value={form.safetyInfo.emergencyContact} onChange={(e) => setSafety("emergencyContact", e.target.value)} required placeholder="e.g. 100" />
          </div>
          <div>
            <label className={labelClass}>Nearest Hospital *</label>
            <input className={inputClass} value={form.safetyInfo.nearestHospital} onChange={(e) => setSafety("nearestHospital", e.target.value)} required placeholder="Hospital name" />
          </div>
          <div>
            <label className={labelClass}>Rescue Service *</label>
            <input className={inputClass} value={form.safetyInfo.rescueService} onChange={(e) => setSafety("rescueService", e.target.value)} required placeholder="e.g. Air Dynasty" />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input type="checkbox" checked={form.safetyInfo.timsRequired} onChange={(e) => setSafety("timsRequired", e.target.checked)} className="w-4 h-4 accent-primary" />
              TIMS Required
            </label>
          </div>
          {form.safetyInfo.timsRequired && (
            <div>
              <label className={labelClass}>TIMS Checkpoint</label>
              <input className={inputClass} value={form.safetyInfo.timsCheckpoint} onChange={(e) => setSafety("timsCheckpoint", e.target.value)} placeholder="Checkpoint name" />
            </div>
          )}
        </div>
      </div>

      {/* Seasonal Calendar */}
      <div className={sectionClass}>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Seasonal Calendar</h2>
        <div className="grid grid-cols-3 gap-2">
          {form.seasonalCalendar.map((season) => (
            <div key={season.month} className="flex items-center gap-2">
              <span className="text-xs font-medium w-20 shrink-0" style={{ color: "var(--color-on-surface-variant)" }}>
                {season.month.slice(0, 3)}
              </span>
              <select
                className="flex-1 h-9 border rounded-lg px-2 text-xs font-medium outline-none transition-all"
                style={{
                  borderColor: "var(--color-outline-variant)",
                  backgroundColor:
                    season.status === "best" ? "rgba(29,158,117,0.1)" :
                    season.status === "avoid" ? "rgba(216,90,48,0.1)" :
                    "var(--color-surface-low)",
                  color:
                    season.status === "best" ? "var(--color-success)" :
                    season.status === "avoid" ? "var(--color-danger)" :
                    "var(--color-on-surface-variant)",
                }}
                value={season.status}
                onChange={(e) => setSeasonStatus(season.month, e.target.value as "best" | "shoulder" | "avoid")}
              >
                <option value="best">Best</option>
                <option value="shoulder">Shoulder</option>
                <option value="avoid">Avoid</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Tips & Tags */}
      <div className={sectionClass}>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Tips & Tags</h2>
        <div>
          <label className={labelClass}>Local Tips (one per line)</label>
          <textarea
            className={inputClass}
            style={{ height: 90, paddingTop: 12, resize: "vertical" }}
            value={form.localTips}
            onChange={(e) => set("localTips", e.target.value)}
            placeholder="Tip 1&#10;Tip 2&#10;Tip 3"
          />
        </div>
        <div>
          <label className={labelClass}>Best For (comma-separated)</label>
          <input className={inputClass} value={form.bestFor} onChange={(e) => set("bestFor", e.target.value)} placeholder="trekking, photography, camping" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
        <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ height: 44 }}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" style={{ height: 44 }} disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Destination"}
        </button>
      </div>
    </form>
  );
}