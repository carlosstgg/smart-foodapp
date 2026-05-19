import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AppHeader from "@/components/AppHeader";
import { formatMoney } from "@/lib/dates";

export const dynamic = "force-dynamic";

const WATER_LITERS_PER_PESO = 2.5;
const CO2_GRAMS_PER_PESO = 80;

export default async function EstadisticasPage() {
  const supabase = createClient(await cookies());

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartISO = monthStart.toISOString().slice(0, 10);

  const [{ data: allRows }, { data: monthRows }] = await Promise.all([
    supabase.from("products").select("status, price, categories(name,icon)"),
    supabase
      .from("products")
      .select("status, price")
      .gte("purchase_date", monthStartISO),
  ]);

  const all = allRows ?? [];
  const month = monthRows ?? [];

  const sumBy = (
    rows: { status: string; price: number }[],
    s: string,
  ) =>
    rows
      .filter((r) => r.status === s)
      .reduce((sum, r) => sum + Number(r.price), 0);

  const savedMonth = sumBy(month, "consumed");
  const wastedMonth = sumBy(month, "wasted");
  const savedAll = sumBy(all, "consumed");
  const wastedAll = sumBy(all, "wasted");

  const totalDecided = savedAll + wastedAll;
  const rate = totalDecided > 0 ? Math.round((savedAll / totalDecided) * 100) : 0;

  const wastedByCat = new Map<string, { icon: string; amount: number }>();
  for (const r of all) {
    if (r.status !== "wasted") continue;
    const cat = r.categories as { name?: string; icon?: string } | null;
    const key = cat?.name ?? "Otros";
    const icon = cat?.icon ?? "🛒";
    const cur = wastedByCat.get(key) ?? { icon, amount: 0 };
    cur.amount += Number(r.price);
    wastedByCat.set(key, cur);
  }
  const wastedRanking = [...wastedByCat.entries()].sort(
    (a, b) => b[1].amount - a[1].amount,
  );

  const waterSaved = Math.round(savedAll * WATER_LITERS_PER_PESO);
  const co2Saved = Math.round((savedAll * CO2_GRAMS_PER_PESO) / 1000);

  const maxMonth = Math.max(savedMonth, wastedMonth, 1);
  const savedW = (savedMonth / maxMonth) * 100;
  const wastedW = (wastedMonth / maxMonth) * 100;

  // Donut math
  const circ = 2 * Math.PI * 46;
  const dash = (rate / 100) * circ;

  return (
    <div>
      <AppHeader title="Mi ahorro" subtitle="Tu impacto contra el desperdicio" />

      <div className="px-5 pt-4 space-y-4">
        {/* Donut hero */}
        <section className="glass-strong glass-shine rounded-[28px] p-5">
          <div className="flex items-center gap-5">
            <div className="relative size-28 shrink-0">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1cd07b" />
                    <stop offset="100%" stopColor="#0e8f4a" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="rgba(15,30,22,0.08)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#g1)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circ}`}
                  style={{ filter: "drop-shadow(0 4px 10px rgba(28,191,106,0.35))" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-[28px] font-semibold tracking-tight tabular-nums leading-none">
                    {rate}%
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mt-0.5">
                    aprovechado
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] uppercase tracking-wider text-zinc-500 font-semibold">
                Tasa total
              </p>
              <p className="text-[15px] mt-1 text-zinc-800">
                De lo que has comprado,{" "}
                <strong className="text-[var(--brand-strong)]">
                  {rate}%
                </strong>{" "}
                lo consumes antes de que se eche a perder.
              </p>
            </div>
          </div>
        </section>

        {/* Month bars */}
        <section className="glass-strong glass-shine rounded-3xl p-4">
          <h2 className="font-semibold tracking-tight">Este mes</h2>
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700 font-semibold">
                  Ahorrado
                </span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(savedMonth)}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 bg-black/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_2px_8px_rgba(16,185,129,0.4)] transition-[width] duration-700"
                  style={{ width: `${savedW}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-rose-600 font-semibold">
                  Desperdiciado
                </span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(wastedMonth)}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 bg-black/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 shadow-[0_2px_8px_rgba(244,63,94,0.4)] transition-[width] duration-700"
                  style={{ width: `${wastedW}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Impact tiles */}
        <section className="grid grid-cols-2 gap-3">
          <div className="glass glass-shine rounded-3xl p-4">
            <div className="size-9 rounded-full bg-sky-300/35 grid place-items-center text-xl">
              💧
            </div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mt-2">
              Agua ahorrada
            </p>
            <p className="text-[22px] font-semibold text-sky-700 tabular-nums">
              {waterSaved.toLocaleString("es-MX")} L
            </p>
          </div>
          <div className="glass glass-shine rounded-3xl p-4">
            <div className="size-9 rounded-full bg-emerald-300/40 grid place-items-center text-xl">
              🌱
            </div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mt-2">
              CO₂ evitado
            </p>
            <p className="text-[22px] font-semibold text-emerald-700 tabular-nums">
              {co2Saved.toLocaleString("es-MX")} kg
            </p>
          </div>
        </section>

        {/* Accumulated */}
        <section className="glass-strong glass-shine rounded-3xl p-4">
          <h2 className="font-semibold tracking-tight">Acumulado total</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/40 backdrop-blur p-3">
              <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
                Ahorrado
              </p>
              <p className="text-[22px] font-semibold text-emerald-700 tabular-nums">
                {formatMoney(savedAll)}
              </p>
            </div>
            <div className="rounded-2xl bg-rose-500/15 border border-rose-400/40 backdrop-blur p-3">
              <p className="text-[11px] uppercase tracking-wider text-rose-700 font-semibold">
                Desperdiciado
              </p>
              <p className="text-[22px] font-semibold text-rose-700 tabular-nums">
                {formatMoney(wastedAll)}
              </p>
            </div>
          </div>
        </section>

        {/* Ranking */}
        <section className="glass-strong glass-shine rounded-3xl p-4">
          <h2 className="font-semibold tracking-tight">
            Más desperdiciadas
          </h2>
          {wastedRanking.length === 0 ? (
            <p className="text-sm text-zinc-600 mt-2">
              Aún no has marcado nada como desperdiciado. 🎉
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {wastedRanking.slice(0, 5).map(([name, v]) => {
                const pct = Math.round((v.amount / wastedAll) * 100);
                return (
                  <li key={name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span>{v.icon}</span>
                        {name}
                      </span>
                      <span className="text-zinc-700 font-semibold tabular-nums">
                        {formatMoney(v.amount)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-300 to-rose-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="text-[10px] text-zinc-500 text-center pt-2 pb-6">
          Estimaciones de agua y CO₂ basadas en promedios generales.
        </p>
      </div>
    </div>
  );
}
