"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/pick", label: "번호뽑기", icon: "🦈" },
  { href: "/stats", label: "통계", icon: "📊" },
  { href: "/history", label: "역대", icon: "📜" },
  { href: "/check", label: "내번호", icon: "🎟️" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-sea-200 bg-foam/95 backdrop-blur" aria-label="주요 메뉴">
      <ul className="mx-auto flex max-w-md justify-around px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-sm font-bold ${
                  active ? "bg-sea-100 text-sea-900" : "text-muted"
                }`}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {it.icon}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
