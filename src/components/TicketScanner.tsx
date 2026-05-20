"use client";

import { useState, useRef } from "react";
import { todayISO, addDaysISO } from "@/lib/dates";
import { createProducts } from "@/app/inventario/actions";

type ScannedItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  expiry_date: string;
};

type ScanResponse = {
  products?: Array<{ name: string; price: number; quantity: number; unit: string }>;
  error?: string;
};

const UNITS = ["unidad", "kg", "g", "L", "ml", "paquete"];

const inputCls =
  "w-full bg-white/70 border border-white/70 rounded-2xl px-4 py-3 outline-none transition focus:border-[var(--brand)] focus:bg-white shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_4px_12px_rgba(15,30,22,0.05)]";

export default function TicketScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"idle" | "scanning" | "review">("idle");
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateItem = (id: string, field: keyof ScannedItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    setStep("scanning");

    try {
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/scan-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: file.type }),
      });

      const data = (await res.json()) as ScanResponse;

      if (!res.ok || data.error) throw new Error(data.error ?? "Error al analizar el ticket");
      if (!data.products?.length) throw new Error("No se detectaron productos en el ticket");

      setItems(
        data.products.map((p, i) => ({
          id: `${i}-${Date.now()}`,
          name: p.name,
          price: p.price,
          quantity: p.quantity,
          unit: p.unit,
          expiry_date: "",
        })),
      );
      setStep("review");
    } catch (e) {
      setScanError(e instanceof Error ? e.message : "No se pudo leer el ticket");
      setStep("idle");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    if (items.some((item) => !item.expiry_date)) {
      setSaveError("Todos los productos deben tener fecha de caducidad.");
      return;
    }
    setSaving(true);
    try {
      await createProducts(
        items.map((item) => ({
          name: item.name,
          category_id: null,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          purchase_date: todayISO(),
          expiry_date: item.expiry_date,
        })),
      );
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Error al guardar");
      setSaving(false);
    }
  };

  if (step === "idle" || step === "scanning") {
    return (
      <div className="px-5 py-8 flex flex-col items-center gap-4">
        <div className="glass-strong rounded-3xl p-8 w-full text-center space-y-4">
          <p className="text-5xl">🧾</p>
          <div>
            <p className="font-semibold text-lg tracking-tight">Fotografía tu ticket</p>
            <p className="text-sm text-zinc-600 mt-1">
              Detectaremos todos los productos automáticamente. Solo deberás ingresar las fechas de caducidad.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleScanFile}
          />
          <button
            type="button"
            disabled={step === "scanning"}
            onClick={() => fileInputRef.current?.click()}
            className="tap w-full py-4 rounded-2xl bg-gradient-to-b from-[#1cd07b] to-[#0e8f4a] text-white font-semibold shadow-[0_10px_30px_rgba(28,191,106,0.45)] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {step === "scanning" ? (
              <>
                <span className="inline-block size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Analizando ticket...
              </>
            ) : (
              <>
                <span className="text-lg">📷</span>
                Tomar foto del ticket
              </>
            )}
          </button>
        </div>

        {scanError && (
          <div className="glass w-full rounded-2xl border border-red-300/50 bg-red-500/10 px-3 py-2 text-sm text-red-700">
            {scanError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-4 pb-8">
      <div className="glass rounded-2xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-800 flex items-center gap-2">
        <span>✓</span>
        <span>
          {items.length} producto{items.length !== 1 ? "s" : ""} detectado
          {items.length !== 1 ? "s" : ""} — revisa y añade las fechas de caducidad
        </span>
      </div>

      {items.map((item, idx) => (
        <div key={item.id} className="glass-strong rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Producto {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="tap size-7 rounded-full glass flex items-center justify-center text-zinc-500 text-sm"
              aria-label="Eliminar producto"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Nombre
            </label>
            <input
              value={item.name}
              onChange={(e) => updateItem(item.id, "name", e.target.value)}
              className={`mt-1 ${inputCls}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                Cantidad
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                className={`mt-1 ${inputCls}`}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                Unidad
              </label>
              <select
                value={item.unit}
                onChange={(e) => updateItem(item.id, "unit", e.target.value)}
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
              type="number"
              step="0.01"
              min="0"
              value={item.price}
              onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
              className={`mt-1 ${inputCls}`}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Caducidad <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex gap-2 mb-2">
              {[
                { label: "1 semana", days: 7 },
                { label: "1 mes", days: 30 },
              ].map(({ label, days }) => {
                const value = addDaysISO(days);
                const active = item.expiry_date === value;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => updateItem(item.id, "expiry_date", value)}
                    className={`tap px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${
                      active
                        ? "bg-gradient-to-b from-[#1cd07b] to-[#0e8f4a] text-white border-emerald-500/40 shadow-[0_4px_12px_rgba(28,191,106,0.35)]"
                        : "glass text-zinc-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <input
              type="date"
              value={item.expiry_date}
              onChange={(e) => updateItem(item.id, "expiry_date", e.target.value)}
              className={`${inputCls} ${!item.expiry_date ? "border-orange-300/80" : ""}`}
            />
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="glass rounded-3xl p-6 text-center text-sm text-zinc-600">
          Todos los productos fueron eliminados.
        </div>
      )}

      {saveError && (
        <div className="glass rounded-2xl border border-red-300/50 bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setItems([]);
            setScanError(null);
          }}
          className="tap flex-1 py-3.5 rounded-2xl glass font-semibold text-zinc-800"
        >
          Volver
        </button>
        <button
          type="button"
          disabled={saving || items.length === 0}
          onClick={handleSave}
          className="tap flex-[2] py-3.5 rounded-2xl bg-gradient-to-b from-[#1cd07b] to-[#0e8f4a] text-white font-semibold shadow-[0_10px_30px_rgba(28,191,106,0.45)] disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : `Agregar ${items.length} producto${items.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
