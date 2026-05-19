"use client";

import { useTransition, useState } from "react";
import {
  markProductStatus,
  deleteProduct,
} from "@/app/inventario/actions";

export default function ProductActions({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handle = (fn: () => Promise<unknown>) => {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={pending}
          onClick={() => handle(() => markProductStatus(id, "consumed"))}
          className="tap py-3 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-white font-semibold shadow-[0_10px_24px_rgba(16,185,129,0.4)] disabled:opacity-60"
        >
          ✅ Consumido
        </button>
        <button
          disabled={pending}
          onClick={() => handle(() => markProductStatus(id, "wasted"))}
          className="tap py-3 rounded-2xl bg-gradient-to-b from-rose-400 to-rose-600 text-white font-semibold shadow-[0_10px_24px_rgba(244,63,94,0.4)] disabled:opacity-60"
        >
          🗑️ Desperdiciado
        </button>
      </div>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("¿Eliminar este producto del inventario?")) {
            handle(() => deleteProduct(id));
          }
        }}
        className="tap w-full py-2.5 rounded-2xl glass text-zinc-700 text-sm font-semibold disabled:opacity-60"
      >
        Eliminar registro
      </button>
      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
