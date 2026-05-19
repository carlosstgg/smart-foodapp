"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/inventario", label: "Inventario", icon: BoxIcon },
  { href: "/recetas", label: "Recetas", icon: SparkIcon },
  { href: "/estadisticas", label: "Ahorro", icon: ChartIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="pointer-events-none fixed bottom-0 inset-x-0 z-40 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2"
    >
      <ul className="pointer-events-auto glass-strong glass-shine flex items-center gap-1 rounded-full px-1.5 py-1.5">
        {tabs.map((t) => {
          const active =
            t.href === "/"
              ? pathname === "/"
              : pathname.startsWith(t.href);
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`tap relative flex items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                  active
                    ? "text-white"
                    : "text-zinc-700 hover:text-zinc-900"
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-[#1cd07b] to-[#0e8f4a] shadow-[0_6px_18px_rgba(28,191,106,0.45)]"
                  />
                )}
                <Icon
                  className={`relative size-[18px] ${
                    active ? "text-white" : "text-zinc-700"
                  }`}
                />
                <span className="relative">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---- Inline icons (stroke, Apple-like 1.7px) ---- */
type IconProps = { className?: string };
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M3.5 11.5 12 4l8.5 7.5" />
      <path d="M5.5 10.5V20a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-9.5" />
      <path d="M9.5 20.5v-5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v5" />
    </svg>
  );
}
function BoxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Z" />
      <path d="M4 7.5 12 11l8-3.5" />
      <path d="M12 11v9" />
    </svg>
  );
}
function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m6 6 2.5 2.5" />
      <path d="m15.5 15.5 2.5 2.5" />
      <path d="m6 18 2.5-2.5" />
      <path d="m15.5 8.5 2.5-2.5" />
    </svg>
  );
}
function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M4 20h16" />
      <path d="M7 20v-7" />
      <path d="M12 20V8" />
      <path d="M17 20v-4" />
    </svg>
  );
}
