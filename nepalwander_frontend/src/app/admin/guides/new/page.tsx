/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import { adminApi } from "@/lib/api/admin";
import { User } from "@/types";

const SPECIALTIES = ["trekking", "cultural", "wildlife", "adventure", "spiritual", "photography", "culinary"];
const LANGUAGES = ["nepali", "english", "hindi", "chinese", "japanese", "german", "french"];
const REGIONS = ["himalaya", "terai", "pokhara", "kathmandu", "mustang", "eastern"];

export default function NewGuidePage() {
  const router = useRouter();
  const [guideUsers, setGuideUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    userId: "",
    bio: "",
    experience: 0,
    pricePerDay: 0,
    nmaCertNumber: "",
    specialties: [] as string[],
    languages: [] as string[],
    regions: [] as string[],
  });

  useEffect(() => {
    adminApi.getUsers().then((data) => {
      const allUsers = data.users ?? (Array.isArray(data) ? data : []);
      // Show all guide role users regardless of accountStatus
      const guides = allUsers.filter(
        (u: User) => u.role === "guide"
      );
      setGuideUsers(guides);
    }).catch(() => setError("Failed to load users."));
  }, []);

  const toggle = (key: "specialties" | "languages" | "regions", val: string) => {
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter((v) => v !== val) : [...p[key], val],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId) { setError("Please select a guide user."); return; }
    if (form.specialties.length === 0) { setError("Select at least one specialty."); return; }
    if (form.languages.length === 0) { setError("Select at least one language."); return; }
    if (form.regions.length === 0) { setError("Select at least one region."); return; }
    if (form.bio.length < 50) { setError("Bio must be at least 50 characters."); return; }

    setSaving(true);
    setError("");

    try {
      // Use admin endpoint instead of guide profile endpoint
      await api.post("/admin/guides/profile", {
        userId: form.userId,
        bio: form.bio,
        experience: Number(form.experience),
        pricePerDay: Number(form.pricePerDay),
        nmaCertNumber: form.nmaCertNumber || undefined,
        specialties: form.specialties,
        languages: form.languages,
        regions: form.regions,
        certifications: [],
      });
      router.push("/admin/guides");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to create guide profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "input-field";
  const labelClass = "block text-xs font-semibold mb-1.5";
  const sectionClass = "card flex flex-col gap-4";

  const ChipGroup = ({ label, options, selected, onToggle }: {
    label: string; options: string[];
    selected: string[]; onToggle: (val: string) => void;
  }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => onToggle(opt)}
            className="px-3 h-8 rounded-lg text-xs font-semibold border transition-all capitalize"
            style={{
              backgroundColor: selected.includes(opt) ? "var(--color-primary)" : "white",
              color: selected.includes(opt) ? "white" : "var(--color-on-surface)",
              borderColor: selected.includes(opt) ? "var(--color-primary)" : "var(--color-outline-variant)",
            }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-5">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: "rgba(186,26,26,0.1)", color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      {/* Select guide user */}
      <div className={sectionClass}>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Select Guide User</h2>
        {guideUsers.length === 0 ? (
          <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "rgba(240,165,0,0.1)", color: "var(--color-warning)" }}>
            ⚠️ No guide users found. A user must register as a guide first.
          </div>
        ) : (
          <div>
            <label className={labelClass}>Guide User *</label>
            <select className={inputClass} value={form.userId}
              onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))} required>
              <option value="">Select a guide user...</option>
              {guideUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.firstName} {u.lastName} — {u.email} ({u.accountStatus})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Basic info */}
      <div className={sectionClass}>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Guide Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Experience (years) *</label>
            <input className={inputClass} type="number" min={0} value={form.experience}
              onChange={(e) => setForm((p) => ({ ...p, experience: Number(e.target.value) }))} required />
          </div>
          <div>
            <label className={labelClass}>Price Per Day (NPR) *</label>
            <input className={inputClass} type="number" min={0} value={form.pricePerDay}
              onChange={(e) => setForm((p) => ({ ...p, pricePerDay: Number(e.target.value) }))} required />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>NMA Certificate Number</label>
            <input className={inputClass} value={form.nmaCertNumber}
              onChange={(e) => setForm((p) => ({ ...p, nmaCertNumber: e.target.value }))}
              placeholder="e.g. NMA-2019-0234" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>
              Bio * <span className="font-normal" style={{ color: "var(--color-outline)" }}>(min 50 characters)</span>
            </label>
            <textarea className={inputClass} style={{ height: 100, paddingTop: 12, resize: "vertical" }}
              value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              required minLength={50}
              placeholder="Describe the guide's experience, certifications, and expertise..." />
            <p className="text-xs mt-1" style={{ color: form.bio.length >= 50 ? "var(--color-success)" : "var(--color-outline)" }}>
              {form.bio.length}/50 characters minimum
            </p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className={sectionClass}>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Skills & Coverage</h2>
        <ChipGroup label="Specialties *" options={SPECIALTIES} selected={form.specialties}
          onToggle={(val) => toggle("specialties", val)} />
        <ChipGroup label="Languages *" options={LANGUAGES} selected={form.languages}
          onToggle={(val) => toggle("languages", val)} />
        <ChipGroup label="Regions *" options={REGIONS} selected={form.regions}
          onToggle={(val) => toggle("regions", val)} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
        <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ height: 44 }}>Cancel</button>
        <button type="submit" className="btn-primary" style={{ height: 44 }} disabled={saving || guideUsers.length === 0}>
          {saving ? "Creating..." : "Create Guide Profile"}
        </button>
      </div>
    </form>
  );
}