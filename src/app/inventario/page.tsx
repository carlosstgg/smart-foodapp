import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import type { ProductWithCategory } from "@/lib/types";
import { expiryStatus } from "@/lib/dates";

export const dynamic = "force-dynamic";

type Search = { filter?: string; q?: string };

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { filter = "all", q = "" } = await searchParams;
  const supabase = createClient(await cookies());

  let query = supabase
    .from("products")
    .select("*, categories(id,name,icon)")
    .eq("status", "active")
    .order("expiry_date", { ascending: true });

  if (q) query = query.ilike("name", `%${q}%`);

  const { data, error } = await query;
  let products = (data ?? []) as ProductWithCategory[];

  if (filter === "urgent") {
    products = products.filter((p) => expiryStatus(p.expiry_date).days <= 3);
  } else if (filter === "expired") {
    products = products.filter((p) => expiryStatus(p.expiry_date).days < 0);
  }

  const filters = [
    { key: "all", label: "Todos" },
    { key: "urgent", label: "Por caducar" },
    { key: "expired", label: "Caducados" },
  ];

  return (
    <div>
      <AppHeader
        title="Inventario"
        subtitle={`${products.length} producto${products.length === 1 ? "" : "s"}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/inventario/escanear"
              className="tap size-10 rounded-full glass border border-white/70 text-zinc-700 grid place-items-center shadow-[0_4px_12px_rgba(15,30,22,0.08)]"
              aria-label="Escanear ticket"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <rect x="7" y="7" width="10" height="10" rx="1" />
              </svg>
            </Link>
            <Link
              href="/inventario/nuevo"
              className="tap size-10 rounded-full bg-gradient-to-b from-[#1cd07b] to-[#0e8f4a] text-white grid place-items-center text-xl shadow-[0_10px_24px_rgba(28,191,106,0.45)]"
              aria-label="Agregar producto"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
          </div>
        }
      />

      <div className="px-5 pt-4">
        <form className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <svg
              viewBox="0 0 24 24"
              className="size-[16px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar producto..."
            className="w-full glass rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--brand)] transition"
          />
          <input type="hidden" name="filter" value={filter} />
        </form>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {filters.map((f) => {
            const active = f.key === filter;
            return (
              <Link
                key={f.key}
                href={`/inventario?filter=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition ${
                  active
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-[0_8px_24px_rgba(15,30,22,0.25)]"
                    : "glass text-zinc-800"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-4 space-y-2">
        {error && (
          <div className="glass rounded-3xl border-red-300/50 bg-red-500/10 p-3 text-sm text-red-700">
            Error: {error.message}
          </div>
        )}

        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}

        {products.length === 0 && !error && (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-4xl">🍽️</p>
            <p className="mt-2 font-semibold">Sin productos por aquí</p>
            <p className="text-sm text-zinc-600">
              Agrega productos para empezar a controlar tu inventario.
            </p>
            <Link
              href="/inventario/nuevo"
              className="mt-4 inline-block bg-gradient-to-b from-[#1cd07b] to-[#0e8f4a] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-[0_10px_24px_rgba(28,191,106,0.45)]"
            >
              Agregar producto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
