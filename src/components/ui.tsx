import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card p-5 ${className}`}>{children}</section>;
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3">
      <h2 className="text-xl font-black text-sea-900">{children}</h2>
      {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function Bar({ value, max, label, color = "var(--sea-500)" }: { value: number; max: number; label?: string; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-7 w-full overflow-hidden rounded-lg bg-sea-100" role="img" aria-label={label ?? `${value}`}>
      <div className="flex h-full items-center rounded-lg px-2 text-sm font-bold text-white" style={{ width: `${Math.max(pct, 8)}%`, background: color }}>
        {label ?? value}
      </div>
    </div>
  );
}
