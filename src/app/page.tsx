import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { expiryStatus, formatMoney } from "@/lib/dates";
import type { ProductWithCategory } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient(await cookies());

  const { data: activeProducts, error } = await supabase
    .from("products")
    .select("*, categories(id,name,icon)")
    .eq("status", "active")
    .order("expiry_date", { ascending: true });

  const products = (activeProducts ?? []) as ProductWithCategory[];

  const expiringSoon = products.filter(
    (p) => expiryStatus(p.expiry_date).days <= 3,
  );

  const valueAtRisk = expiringSoon.reduce((s, p) => s + Number(p.price), 0);
  const totalItems = products.length;

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartISO = monthStart.toISOString().slice(0, 10);

  const { data: monthly } = await supabase
    .from("products")
    .select("status, price")
    .gte("purchase_date", monthStartISO);

  const saved = (monthly ?? [])
    .filter((p) => p.status === "consumed")
    .reduce((s, p) => s + Number(p.price), 0);
  const wasted = (monthly ?? [])
    .filter((p) => p.status === "wasted")
    .reduce((s, p) => s + Number(p.price), 0);

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      {/* Hero */}
      <section className="px-5 pt-10 pb-6">
        <p className="text-[12px] uppercase tracking-[0.18em] text-zinc-600 font-semibold">
          {today}
        </p>
        <h1 className="mt-1 text-[34px] leading-[1.05] font-semibold tracking-tight">
          Cuida lo que <br />
          ya tienes <span className="text-[var(--brand-strong)]">en casa</span>
        </h1>
        <p className="mt-2 text-[14px] text-zinc-600 max-w-[18rem]">
          SmartFood te ayuda a no desperdiciar comida y ahorrar dinero, día tras día.
        </p>

        {/* Stat tiles */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="glass glass-shine rounded-3xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">
              Productos activos
            </p>
            <p className="mt-1 text-[32px] font-semibold tracking-tight tabular-nums">
              {totalItems}
            </p>
            <p className="text-[11px] text-zinc-500">en tu inventario</p>
          </div>
          <div className="glass glass-shine rounded-3xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">
              Riesgo · 3 días
            </p>
            <p className="mt-1 text-[32px] font-semibold tracking-tight tabular-nums text-amber-700">
              {formatMoney(valueAtRisk)}
            </p>
            <p className="text-[11px] text-zinc-500">por usar pronto</p>
          </div>
        </div>
      </section>

      {/* Savings strip */}
      <section className="px-5">
        <Link
          href="/estadisticas"
          className="tap glass-strong glass-shine rounded-3xl p-4 flex items-center gap-4 block"
        >
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                Ahorrado · mes
              </p>
              <p className="text-[20px] font-semibold text-[var(--brand-strong)] tabular-nums">
                {formatMoney(saved)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                Desperdiciado
              </p>
              <p className="text-[20px] font-semibold text-red-500 tabular-nums">
                {formatMoney(wasted)}
              </p>
            </div>
          </div>
          <span className="size-10 rounded-full glass grid place-items-center text-zinc-800">
            <svg
              viewBox="0 0 24 24"
              className="size-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m10 6 6 6-6 6" />
            </svg>
          </span>
        </Link>
      </section>

      {/* Quick actions */}
      <section className="px-5 mt-5 grid grid-cols-2 gap-3">
        <Link
          href="/inventario/nuevo"
          className="tap relative overflow-hidden rounded-3xl p-4 text-white shadow-[0_18px_40px_rgba(28,191,106,0.45)] bg-gradient-to-br from-[#1cd07b] via-[#16b063] to-[#0e8f4a]"
        >
          <span
            className="absolute inset-x-0 top-0 h-1/2 opacity-70"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div className="relative">
            <span className="size-9 rounded-full bg-white/25 backdrop-blur grid place-items-center text-xl">
              ＋
            </span>
            <p className="mt-3 font-semibold leading-tight">
              Agregar
              <br />
              producto
            </p>
          </div>
        </Link>
        <Link
          href="/recetas"
          className="tap relative overflow-hidden rounded-3xl p-4 text-zinc-900 glass-strong glass-shine"
        >
          <div className="relative">
            <span className="size-9 rounded-full bg-amber-400/40 grid place-items-center text-xl">
              ✨
            </span>
            <p className="mt-3 font-semibold leading-tight">
              Receta con
              <br />
              lo que tienes
            </p>
          </div>
        </Link>
      </section>

      {/* Expiring soon */}
      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold tracking-tight">⚠️ Por caducar</h2>
          <Link
            href="/inventario"
            className="text-[12px] font-semibold text-zinc-600"
          >
            Ver todo →
          </Link>
        </div>

        {error && (
          <div className="glass rounded-3xl border-red-300/50 bg-red-500/10 p-4 text-sm text-red-700">
            <p className="font-semibold">No se pudo conectar a Supabase.</p>
            <p className="opacity-90 mt-1">
              Asegúrate de haber corrido el script SQL en{" "}
              <code className="bg-red-100 rounded px-1">
                supabase/schema.sql
              </code>
              .
            </p>
          </div>
        )}

        {!error && expiringSoon.length === 0 && (
          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-3xl">🎉</p>
            <p className="mt-2 font-semibold">¡Todo en orden!</p>
            <p className="text-sm text-zinc-600">
              Nada caduca en los próximos 3 días.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {expiringSoon.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Recents */}
      <section className="px-5 mt-7">
        <h2 className="font-semibold tracking-tight mb-2">📦 Recientes</h2>
        <div className="space-y-2">
          {products
            .filter((p) => !expiringSoon.includes(p))
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          {products.length === 0 && !error && (
            <div className="glass rounded-3xl p-7 text-center">
              <p className="text-3xl">🛒</p>
              <p className="mt-2 font-semibold">Tu inventario está vacío</p>
              <Link
                href="/inventario/nuevo"
                className="mt-4 inline-block bg-gradient-to-b from-[#1cd07b] to-[#0e8f4a] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-[0_10px_24px_rgba(28,191,106,0.45)]"
              >
                Agregar el primero
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
