"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { destinationsApi } from "@/lib/api/destinations";
import { Destination } from "@/types";
import DestinationForm from "@/components/admin/DestinationForm";

export default function EditDestinationPage() {
  const { id } = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    destinationsApi.getById(id).then(setDestination).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!destination) {
    return <p className="text-center py-20 text-sm" style={{ color: "var(--color-outline)" }}>Destination not found.</p>;
  }

  return <DestinationForm initial={destination} id={id} />;
}