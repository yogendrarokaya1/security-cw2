"use client";

import { useRouter } from "next/navigation";

const categories = [
  {
    label: "Trek",
    filter: "trek",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 26L12 10l4 8 4-5 8 13H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
        <path d="M20 8a2 2 0 100-4 2 2 0 000 4z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Culture",
    filter: "culture",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="16" width="20" height="10" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <path d="M4 16h24M10 16V10M22 16V10M16 16V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 10h16l-2-4H10L8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  {
    label: "Rafting",
    filter: "rafting",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 20c3-4 5-2 8-4s5-5 8-4 5 4 8 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <path d="M10 20l2-8 4 2 4-4 2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="16" cy="10" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Wildlife",
    filter: "wildlife",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 6c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S21.5 6 16 6z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
        <circle cx="20" cy="14" r="1.5" fill="currentColor"/>
        <path d="M12 19c1 1.5 7 1.5 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 7L8 4M22 7l2-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function QuickCategories() {
  const router = useRouter();

  return (
    <section className="px-6 pt-14 pb-6 max-w-240 mx-auto">
      <p className="text-[10px] font-bold tracking-widest text-secondary mb-3">QUICK CATEGORIES</p>
      <div className="grid grid-cols-4 gap-3.5">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => router.push(`/explore?category=${cat.filter}`)}
            className="flex flex-col items-center justify-center gap-2.5 py-6 px-4 border border-outline-variant rounded-xl bg-white text-on-surface-variant hover:border-primary hover:text-primary hover:shadow-float hover:-translate-y-0.5 transition-all"
          >
            {cat.icon}
            <span className="text-sm font-semibold">{cat.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
