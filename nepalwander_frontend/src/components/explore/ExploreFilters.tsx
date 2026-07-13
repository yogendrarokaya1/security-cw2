"use client";

import { useState } from "react";
import { Search } from "lucide-react";

const activities = ["Trekking", "Cultural", "Wildlife", "Rafting", "Spiritual"];
const durations = ["1-3 days", "4-7 days", "7+ days"];
const difficulties = ["Easy", "Moderate", "Hard"];
const seasons = ["Spring", "Autumn", "Winter"];

interface FiltersState {
  search: string;
  activities: string[];
  duration: string;
  budgetMax: number;
  difficulties: string[];
  seasons: string[];
}

interface ExploreFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function ExploreFilters({
  filters,
  onChange,
  onApply,
  onReset,
}: ExploreFiltersProps) {
  const toggle = (key: "activities" | "difficulties" | "seasons", val: string) => {
    const arr = filters[key];
    onChange({
      ...filters,
      [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
    });
  };

  return (
    <aside className="w-[160px] flex-shrink-0 bg-white border-r border-surface-container flex flex-col gap-4 p-4 sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto">

      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" />
        <input
          type="text"
          placeholder="Search destinations or packages..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full h-8 pl-7 pr-2 text-[11px] bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary"
        />
      </div>

      <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Filters</p>

      {/* Activity */}
      <div>
        <p className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-2">Activity</p>
        <div className="flex flex-col gap-1.5">
          {activities.map((a) => (
            <label key={a} className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => toggle("activities", a)}
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center cursor-pointer transition-all flex-shrink-0
                  ${filters.activities.includes(a)
                    ? "border-primary bg-primary"
                    : "border-outline-variant bg-white"
                  }`}
              >
                {filters.activities.includes(a) && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[11px] text-on-surface">{a}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-2">Duration</p>
        <div className="flex flex-col gap-1.5">
          {durations.map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => onChange({ ...filters, duration: filters.duration === d ? "" : d })}
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0
                  ${filters.duration === d
                    ? "border-primary"
                    : "border-outline-variant"
                  }`}
              >
                {filters.duration === d && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[11px] text-on-surface">{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <p className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-2">Budget</p>
        <input
          type="range"
          min={0}
          max={200000}
          step={5000}
          value={filters.budgetMax}
          onChange={(e) => onChange({ ...filters, budgetMax: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-outline mt-1">
          <span>NPR 0</span>
          <span>{filters.budgetMax.toLocaleString()}</span>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-2">Difficulty</p>
        <div className="flex flex-col gap-1.5">
          {difficulties.map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => toggle("difficulties", d)}
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center cursor-pointer transition-all flex-shrink-0
                  ${filters.difficulties.includes(d)
                    ? "border-primary bg-primary"
                    : "border-outline-variant bg-white"
                  }`}
              >
                {filters.difficulties.includes(d) && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[11px] text-on-surface">{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Season */}
      <div>
        <p className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-2">Season</p>
        <div className="flex flex-col gap-1.5">
          {seasons.map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => toggle("seasons", s)}
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center cursor-pointer transition-all flex-shrink-0
                  ${filters.seasons.includes(s)
                    ? "border-primary bg-primary"
                    : "border-outline-variant bg-white"
                  }`}
              >
                {filters.seasons.includes(s) && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[11px] text-on-surface">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 mt-auto pt-2">
        <button
          onClick={onApply}
          className="w-full bg-primary text-white text-[12px] font-bold py-2 rounded-lg hover:bg-[#005236] transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={onReset}
          className="w-full bg-surface border border-outline-variant text-on-surface text-[12px] font-semibold py-2 rounded-lg hover:bg-surface-container transition-colors"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}