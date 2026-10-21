import type { ReactNode, Ref } from "react";

export function Card({ children, className = "", ref }: { children: ReactNode; className?: string; ref?: Ref<HTMLElement> }) {
  return (
    <section ref={ref} className={`card p-5 ${className}`}>
      {children}
    </section>
  );
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
    <div className="relative h-8 w-full overflow-hidden rounded-lg bg-sea-50" role="img" aria-label={label ?? `${value}`}>
      <div
        className="absolute inset-y-0 left-0 rounded-lg"
        style={{ width: `${Math.max(pct, 2)}%`, background: `color-mix(in srgb, ${color} 50%, white)` }}
      />
      <span className="relative flex h-full items-center px-2 text-sm font-black text-sea-900 whitespace-nowrap">{label ?? value}</span>
    </div>
  );
}
