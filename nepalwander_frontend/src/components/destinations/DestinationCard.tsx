"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Mountain, Calendar } from "lucide-react";

interface DestinationCardProps {
  destination: {
    _id: string;
    name: string;
    slug: string;
    altitude: number;
    difficulty: string;
    coverImage?: string;
    bestFor?: string[];
    seasonalCalendar?: { month: string; status: string }[];
    rating?: number;
  };
}

function getBestMonths(calendar: { month: string; status: string }[] = []) {
  const best = calendar
    .filter((c) => c.status === "best")
    .map((c) => c.month.slice(0, 3));
  if (best.length === 0) return "Oct–May";
  return best.slice(0, 2).join("–");
}

function getCategoryLabel(bestFor: string[] = [], difficulty: string) {
  if (bestFor.includes("Wildlife lovers")) return "Wildlife Safari";
  if (bestFor.includes("Culture seekers")) return "Cultural";
  if (difficulty === "hard" || difficulty === "extreme") return "Trekking";
  if (bestFor.includes("Families")) return "Adventure + Culture";
  return "Adventure + Culture";
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  const category = getCategoryLabel(
    destination.bestFor,
    destination.difficulty
  );
  const bestMonths = getBestMonths(destination.seasonalCalendar);

  return (
    <Link href={`/destinations/${destination.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-surface-container shadow-card hover:shadow-float transition-all duration-300 group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-[220px] overflow-hidden">
          {destination.coverImage ? (
            <Image
              src={destination.coverImage}
              alt={destination.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy via-primary to-primary-container" />
          )}
          {/* Dark overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Category badge */}
          <span className="absolute top-3 left-3 bg-navy/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
            {category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[17px] font-extrabold text-on-surface">
              {destination.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={13} fill="#F0A500" className="text-warning" />
              <span className="text-[13px] font-bold text-on-surface">
                {destination.rating?.toFixed(1) ?? "4.8"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[12px] text-outline mb-4">
            <span className="flex items-center gap-1">
              <Mountain size={12} />
              {destination.altitude}m
            </span>
            <span className="flex items-center gap-1 text-primary font-semibold">
              <Calendar size={12} />
              Best: {bestMonths}
            </span>
          </div>

          <button className="w-full bg-primary text-white text-[13px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#005236] transition-colors">
            Explore →
          </button>
        </div>
      </div>
    </Link>
  );
}