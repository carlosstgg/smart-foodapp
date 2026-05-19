import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AppHeader from "@/components/AppHeader";
import ProductForm from "@/components/ProductForm";
import ProductActions from "./ProductActions";
import type { Category, Product } from "@/lib/types";
import { expiryStatus, formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (Number.isNaN(productId)) notFound();

  const supabase = createClient(await cookies());

  const [{ data: product }, { data: cats }] = await Promise.all([
    supabase.from("products").select("*").eq("id", productId).single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!product) notFound();
  const categories = (cats ?? []) as Category[];
  const p = product as Product;
  const status = expiryStatus(p.expiry_date);

  return (
    <div>
      <AppHeader title="Detalle" back="/inventario" />

      <div className="px-5 pt-4">
        <div className="glass-strong glass-shine rounded-3xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
            Estado
          </p>
          <p className="font-semibold mt-0.5">
            {p.status === "active"
              ? status.label
              : p.status === "consumed"
                ? "Consumido ✅"
                : "Desperdiciado ❌"}
          </p>
          <p className="text-[12px] text-zinc-600 mt-2">
            Compra: {formatDate(p.purchase_date)} · Caducidad:{" "}
            {formatDate(p.expiry_date)}
          </p>
        </div>

        {p.status === "active" && <ProductActions id={p.id} />}
      </div>

      <ProductForm categories={categories} product={p} />
    </div>
  );
}
