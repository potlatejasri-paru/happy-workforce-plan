import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  goodWhen?: "up" | "down";
  icon: LucideIcon;
};

export function KpiCard({ label, value, hint, delta, goodWhen = "up", icon: Icon }: Props) {
  const positive = delta === undefined ? true : goodWhen === "up" ? delta >= 0 : delta <= 0;
  const Arrow = (delta ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="label-eyebrow">{label}</span>
        <Icon className="size-4 text-primary" aria-hidden />
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="stat-value text-2xl text-foreground sm:text-3xl">{value}</span>
        {delta !== undefined && (
          <span
            className={`mb-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
              positive
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            <Arrow className="size-3" aria-hidden />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
