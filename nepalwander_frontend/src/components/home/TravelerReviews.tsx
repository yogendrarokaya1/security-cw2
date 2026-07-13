import { Star } from "lucide-react";

const reviews = [
  {
    quote: "Best Nepal travel platform! The EBC trek planning was seamless. Highly recommended.",
    author: "Nimesh G., Kathmandu",
    stars: 5,
  },
  {
    quote: "Found amazing hidden spots in Pokhara I wouldn't have found elsewhere.",
    author: "Sarah L., London",
    stars: 5,
  },
];

export default function TravelerReviews() {
  return (
    <section className="px-6 py-8 bg-surface-low">
      <div className="max-w-240 mx-auto">
        <p className="text-[10px] font-bold tracking-widest text-secondary mb-4">TRAVELER REVIEWS</p>
        <div className="flex flex-col gap-3">
          {reviews.map((r, i) => (
            <div key={i} className="card shadow-card">
              <p className="text-sm text-on-surface leading-relaxed italic mb-3">&quot;{r.quote}&quot;</p>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-primary">— {r.author}</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} size={13} fill="#006c49" color="#006c49" />
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
