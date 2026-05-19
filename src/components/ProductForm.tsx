"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addDaysISO, todayISO } from "@/lib/dates";
import type { Category, Product } from "@/lib/types";
import { createProduct, updateProduct } from "@/app/inventario/actions";

type Props = {
  categories: Category[];
  product?: Product;
};

const UNITS = ["unidad", "kg", "g", "L", "ml", "paquete"];

const inputCls =
  "w-full bg-white/70 border border-white/70 rounded-2xl px-4 py-3 outline-none transition focus:border-[var(--brand)] focus:bg-white shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_4px_12px_rgba(15,30,22,0.05)]";

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>(
    product?.category_id ? String(product.category_id) : "",
  );

  const onCategoryChange = (id: string) => {
    setCategoryId(id);
    const cat = categories.find((c) => String(c.id) === id);
    if (cat && !product) {
      const dateInput = document.getElementById(
        "expiry_date",
      ) as HTMLInputElement | null;
      if (dateInput && !dateInput.value) {
        dateInput.value = addDaysISO(cat.shelf_days);
      }
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, formData);
        } else {
          await createProduct(formData);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  return (
    <form action={handleSubmit} className="px-5 py-4 space-y-4">
      <div className="glass-strong rounded-3xl p-4 space-y-4">
        <div>
          <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
            Nombre
          </label>
          <input
            name="name"
            required
            defaultValue={product?.name ?? ""}
            placeholder="Ej. Leche, Manzanas..."
            className={`mt-1 ${inputCls}`}
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
            Categoría
          </label>
          <div className="mt-1 -mx-1 flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
            {categories.map((c) => {
              const active = String(c.id) === categoryId;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => onCategoryChange(String(c.id))}
                  className={`tap shrink-0 px-3.5 py-2 rounded-full border text-sm flex items-center gap-1.5 transition ${
                    active
                      ? "bg-gradient-to-b from-[#1cd07b] to-[#0e8f4a] text-white border-emerald-500/40 shadow-[0_6px_18px_rgba(28,191,106,0.35)]"
                      : "glass text-zinc-800"
                  }`}
                >
                  <span>{c.icon}</span>
                  {c.name}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="category_id" value={categoryId} />
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Cantidad
            </label>
            <input
              name="quantity"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.quantity ?? 1}
              className={`mt-1 ${inputCls}`}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Unidad
            </label>
            <select
              name="unit"
              defaultValue={product?.unit ?? "unidad"}
              className={`mt-1 ${inputCls}`}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
            Precio (MXN)
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price ?? 0}
            placeholder="0"
            className={`mt-1 ${inputCls}`}
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Lo usamos para calcular tu ahorro
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Compra
            </label>
            <input
              id="purchase_date"
              name="purchase_date"
              type="date"
              defaultValue={product?.purchase_date ?? todayISO()}
              className={`mt-1 ${inputCls}`}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Caducidad
            </label>
            <input
              id="expiry_date"
              name="expiry_date"
              type="date"
              required
              defaultValue={product?.expiry_date ?? ""}
              className={`mt-1 ${inputCls}`}
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
            Nota
          </label>
          <textarea
            name="note"
            rows={2}
            defaultValue={product?.note ?? ""}
            placeholder="Opcional"
            className={`mt-1 resize-none ${inputCls}`}
          />
        </div>
      </div>

      {error && (
        <div className="glass rounded-2xl border border-red-300/50 bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="tap flex-1 py-3.5 rounded-2xl glass font-semibold text-zinc-800"
        >
          Cancelar
        </button>
        <button
          disabled={pending}
          className="tap flex-[2] py-3.5 rounded-2xl bg-gradient-to-b from-[#1cd07b] to-[#0e8f4a] text-white font-semibold shadow-[0_10px_30px_rgba(28,191,106,0.45)] disabled:opacity-60"
        >
          {pending
            ? "Guardando..."
            : product
              ? "Guardar cambios"
              : "Agregar al inventario"}
        </button>
      </div>
    </form>
  );
}
