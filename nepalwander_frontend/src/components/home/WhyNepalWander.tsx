const features = [
  {
    label: "Transparent",
    desc: "Fixed pricing, no hidden costs.",
    highlight: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M9 14l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Safety",
    desc: "Verified guides and emergency support.",
    highlight: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4l8 3v6c0 5-3.5 9-8 11C9.5 22 6 18 6 13V7l8-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
        <path d="M10 14l2.5 2.5L18 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "AI Trip",
    desc: "Personalized itineraries in seconds.",
    highlight: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <path d="M9 13h10M9 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 8V5M10 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Local",
    desc: "Supporting community-led tourism.",
    highlight: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="4" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
];

export default function WhyNepalWander() {
  return (
    <section className="px-6 py-8 bg-white">
      <div className="max-w-240 mx-auto">
        <p className="text-[10px] font-bold tracking-widest text-secondary mb-4">WHY NEPALWANDER?</p>
        <div className="grid grid-cols-4 gap-3.5">
          {features.map((f) => (
            <div
              key={f.label}
              className="border border-outline-variant rounded-xl p-5 flex flex-col items-center text-center gap-2"
            >
              <span className={f.highlight ? "text-primary" : "text-on-surface-variant"}>
                {f.icon}
              </span>
              <p className={`text-sm font-bold ${f.highlight ? "text-primary" : "text-on-surface"}`}>
                {f.label}
              </p>
              <p className="text-[12px] text-on-surface-variant leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
