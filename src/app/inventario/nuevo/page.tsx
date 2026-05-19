import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AppHeader from "@/components/AppHeader";
import ProductForm from "@/components/ProductForm";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  const categories = (data ?? []) as Category[];

  return (
    <div>
      <AppHeader title="Nuevo producto" back="/inventario" />
      <ProductForm categories={categories} />
    </div>
  );
}
