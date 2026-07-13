interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

export default function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <div className="card flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--color-on-surface)" }}>
          {value}
        </p>
        <p className="text-sm font-medium" style={{ color: "var(--color-outline)" }}>
          {label}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: "var(--color-outline)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}