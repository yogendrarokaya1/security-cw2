"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { packagesApi } from "@/lib/api/packages";
import { Package } from "@/types";
import PackageForm from "@/components/admin/PackageForm";

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesApi.getById(id).then(setPkg).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pkg) {
    return <p className="text-center py-20 text-sm" style={{ color: "var(--color-outline)" }}>Package not found.</p>;
  }

  return <PackageForm initial={pkg} id={id} />;
}