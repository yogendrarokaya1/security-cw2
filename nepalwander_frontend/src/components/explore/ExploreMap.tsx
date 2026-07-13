"use client";

import { useState } from "react";
import { Plus, Minus, Crosshair } from "lucide-react";

interface MapPin {
  name: string;
  top: string;
  left: string;
  price: string;
  duration: string;
  difficulty: string;
  rating: number;
}

const pins: MapPin[] = [
  { name: "Pokhara",           top: "55%", left: "22%", price: "12,000", duration: "3d",  difficulty: "Easy",     rating: 4.2 },
  { name: "Mustang",           top: "22%", left: "35%", price: "65,000", duration: "10d", difficulty: "Moderate", rating: 4.7 },
  { name: "Chitwan",           top: "68%", left: "38%", price: "20,000", duration: "4d",  difficulty: "Easy",     rating: 4.1 },
  { name: "Everest Base Camp", top: "30%", left: "68%", price: "85,000", duration: "14d", difficulty: "Hard",     rating: 4.9 },
];

export default function ExploreMap() {
  const [activePin, setActivePin] = useState("Everest Base Camp");

  return (
    <div className="relative h-[340px] bg-[#c8dfc8] overflow-hidden flex-shrink-0">

      {/* Terrain background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #c8dfc8 0%, #b8d4b8 25%, #d4e8c4 55%, #c0d8b8 80%, #b0c8a8 100%)",
        }}
      />

      {/* Map label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-[13px] font-bold text-[#6a8a6a]/50 uppercase tracking-[0.2em]">
          Interactive Nepal Map
        </p>
      </div>

      {/* Pins */}
      {pins.map((pin) => (
        <div
          key={pin.name}
          className="absolute z-10 cursor-pointer"
          style={{ top: pin.top, left: pin.left, transform: "translate(-50%, -50%)" }}
          onClick={() => setActivePin(activePin === pin.name ? "" : pin.name)}
        >
          {activePin === pin.name ? (
            <div className="relative">
              {/* Popup */}
              <div className="bg-white rounded-xl shadow-float p-3 w-[180px] border-2 border-primary -translate-x-1/4">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <h4 className="text-[12px] font-bold text-on-surface leading-tight">{pin.name}</h4>
                </div>
                <p className="text-[10px] text-warning font-semibold mb-1">
                  ★ {pin.rating} | {pin.difficulty} | {pin.duration}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-outline">NPR</p>
                    <p className="text-[13px] font-extrabold text-primary">{pin.price}/person</p>
                  </div>
                  <button className="bg-primary text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
                    View →
                  </button>
                </div>
              </div>
              {/* Tail */}
              <div className="w-2.5 h-2.5 bg-primary rotate-45 ml-4 -mt-1 rounded-sm" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-card mb-0.5" />
              <div className="bg-white/90 border border-primary/30 rounded-full px-2 py-0.5 shadow-card">
                <span className="text-[10px] font-semibold text-on-surface whitespace-nowrap">{pin.name}</span>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Zoom controls */}
      <div className="absolute right-3 bottom-3 flex flex-col gap-1 z-10">
        <button className="w-7 h-7 bg-white rounded-lg shadow-card flex items-center justify-center border border-outline-variant hover:bg-surface">
          <Plus size={12} />
        </button>
        <button className="w-7 h-7 bg-white rounded-lg shadow-card flex items-center justify-center border border-outline-variant hover:bg-surface">
          <Minus size={12} />
        </button>
        <button className="w-7 h-7 bg-white rounded-lg shadow-card flex items-center justify-center border border-outline-variant hover:bg-surface mt-1">
          <Crosshair size={12} />
        </button>
      </div>
    </div>
  );
}