"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock, Mountain, Heart } from "lucide-react";

interface PackageResultCardProps {
  pkg: {
    _id: string;
    title: string;
    slug: string;
    price: number;
    duration: number;
    difficulty: string;
    rating?: number;
    reviewCount?: number;
    coverImage?: string;
    isBestSeller?: boolean;
  };
}

export default function PackageResultCard({ pkg }: PackageResultCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  const diffColor =
    pkg.difficulty === "easy" || pkg.difficulty === "Easy"
      ? "text-success"
      : pkg.difficulty === "moderate" || pkg.difficulty === "Moderate"
      ? "text-warning"
      : "text-danger";

  return (
    <div className="bg-white rounded-xl border border-surface-container shadow-card flex overflow-hidden hover:shadow-float transition-shadow">

      {/* Image */}
      <div className="relative w-[160px] flex-shrink-0">
        {pkg.coverImage ? (
          <Image
            src={pkg.coverImage}
            alt={pkg.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy to-primary min-h-[140px] flex items-center justify-center">
            <Mountain size={24} className="text-white/20" />
          </div>
        )}
        {pkg.isBestSeller && (
          <span className="absolute top-2 left-2 bg-warning text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            Best
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-on-surface mb-1">{pkg.title}</h3>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={11}
                fill={s <= Math.round(pkg.rating ?? 4) ? "#F0A500" : "none"}
                className="text-warning"
              />
            ))}
            <span className="text-[11px] text-outline ml-1">
              {pkg.duration}d | <span className={diffColor}>{pkg.difficulty}</span>
            </span>
          </div>

          <p className="text-[15px] font-extrabold text-primary">
            NPR {pkg.price.toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Link href={`/packages/${pkg.slug}`}>
            <button className="bg-primary text-white text-[12px] font-bold px-4 py-1.5 rounded-lg hover:bg-[#005236] transition-colors">
              View
            </button>
          </Link>
          <button
            onClick={() => setWishlisted(!wishlisted)}
            className="flex items-center gap-1 text-[12px] text-outline hover:text-danger transition-colors"
          >
            <Heart
              size={13}
              fill={wishlisted ? "#D85A30" : "none"}
              className={wishlisted ? "text-danger" : ""}
            />
            Save
          </button>
          <button className="text-[12px] text-outline border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface transition-colors">
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}