"use client";

import { useRouter } from "next/navigation";

export default function PlanMyTripCTA() {
  const router = useRouter();

  return (
    <section className="flex justify-center px-6 py-10 bg-white">
      <button onClick={() => router.push("/plan")} className="btn-primary px-16">
        Plan My Trip
      </button>
    </section>
  );
}
