"use client";

import { useState, useTransition } from "react";
import { suggestRecipes, type Recipe } from "./actions";

type PantryItem = { name: string; days: number; icon: string };

export default function RecipesClient({ pantry }: { pantry: PantryItem[] }) {
  const [pending, startTransition] = useTransition();
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extras, setExtras] = useState("");
  const [open, setOpen] = useState<number | null>(0);

  const generate = () => {
    setError(null);
    setRecipes(null);
    startTransition(async () => {
      const res = await suggestRecipes(extras.trim() || undefined);
      if (res.error) setError(res.error);
      setRecipes(res.recipes);
      setOpen(0);
    });
  };

  return (
    <div className="px-5 pt-4 space-y-4">
      {/* Pantry chips */}
      <section className="glass-strong glass-shine rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">🧺 Tu despensa</h2>
          <p className="text-[11px] text-zinc-500 font-semibold">
            {pantry.length} ingr.
          </p>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {pantry.slice(0, 14).map((p, i) => (
            <span
              key={i}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border backdrop-blur ${
                p.days <= 3
                  ? "bg-amber-500/15 border-amber-400/40 text-amber-800"
                  : "bg-white/60 border-white/70 text-zinc-700"
              }`}
            >
              <span>{p.icon}</span>
              {p.name}
              {p.days <= 3 && (
                <span className="text-[10px] opacity-75 font-medium">
                  ({p.days <= 0 ? "hoy" : `${p.days}d`})
                </span>
              )}
            </span>
          ))}
          {pantry.length === 0 && (
            <span className="text-sm text-zinc-500">Sin ingredientes</span>
          )}
        </div>
      </section>

      <section className="glass-strong glass-shine rounded-3xl p-4">
        <label className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">
          ¿Tienes otros básicos? (opcional)
        </label>
        <input
          value={extras}
          onChange={(e) => setExtras(e.target.value)}
          placeholder="arroz, aceite, sal, cebolla..."
          className="mt-1.5 w-full bg-white/70 border border-white/70 rounded-2xl px-4 py-3 outline-none focus:border-[var(--brand)] transition"
        />
        <button
          onClick={generate}
          disabled={pending || pantry.length === 0}
          className="tap mt-3 w-full py-3.5 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 text-white font-semibold shadow-[0_14px_32px_rgba(245,158,11,0.45)] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {pending ? (
            <>
              <span className="inline-block size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Cocinando ideas...
            </>
          ) : (
            <>✨ Generar recetas con IA</>
          )}
        </button>
      </section>

      {error && (
        <div className="glass rounded-3xl border-red-300/50 bg-red-500/10 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {recipes && recipes.length > 0 && (
        <section className="space-y-3 pb-4">
          {recipes.map((r, i) => {
            const isOpen = open === i;
            return (
              <article
                key={i}
                className="glass-strong glass-shine rounded-3xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="tap w-full text-left p-4 flex items-center gap-3"
                >
                  <div className="size-12 rounded-2xl bg-amber-300/40 backdrop-blur grid place-items-center text-2xl shrink-0">
                    {r.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold tracking-tight truncate">
                      {r.title}
                    </h3>
                    <p className="text-[12px] text-zinc-600">
                      ⏱ {r.time_minutes} min · {r.difficulty}
                    </p>
                  </div>
                  <span
                    className={`text-zinc-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/40 pt-3">
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                        Aprovecha
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {r.uses.map((u, k) => (
                          <span
                            key={k}
                            className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 text-[11px] border border-emerald-400/40 backdrop-blur font-medium"
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>

                    {r.missing.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                          Te faltaría
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {r.missing.map((u, k) => (
                            <span
                              key={k}
                              className="px-2.5 py-0.5 rounded-full bg-white/60 text-zinc-700 text-[11px] border border-white/70 backdrop-blur font-medium"
                            >
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
                        Pasos
                      </p>
                      <ol className="space-y-2 text-[13.5px]">
                        {r.steps.map((s, k) => (
                          <li key={k} className="flex gap-2.5">
                            <span className="shrink-0 size-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-white text-[11px] grid place-items-center font-bold mt-0.5">
                              {k + 1}
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {!recipes && !pending && pantry.length > 0 && (
        <div className="glass rounded-3xl p-6 text-center">
          <p className="text-3xl">👨‍🍳</p>
          <p className="mt-2 font-semibold">Listo para inspirarte</p>
          <p className="text-sm text-zinc-600">
            Toca <strong>Generar recetas con IA</strong> para recibir 3 ideas
            usando lo que tienes.
          </p>
        </div>
      )}
    </div>
  );
}
