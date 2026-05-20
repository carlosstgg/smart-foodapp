"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function refresh() {
  revalidatePath("/");
  revalidatePath("/inventario");
  revalidatePath("/estadisticas");
  revalidatePath("/recetas");
}

export async function createProduct(formData: FormData) {
  const supabase = createClient(await cookies());

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    category_id: formData.get("category_id")
      ? Number(formData.get("category_id"))
      : null,
    quantity: Number(formData.get("quantity") || 1),
    unit: String(formData.get("unit") ?? "unidad"),
    price: Number(formData.get("price") || 0),
    purchase_date: String(
      formData.get("purchase_date") ?? new Date().toISOString().slice(0, 10),
    ),
    expiry_date: String(formData.get("expiry_date") ?? ""),
    note: (formData.get("note") as string) || null,
    status: "active" as const,
  };

  if (!payload.name || !payload.expiry_date) {
    throw new Error("Nombre y fecha de caducidad son obligatorios.");
  }

  const { error } = await supabase.from("products").insert(payload);
  if (error) throw new Error(error.message);

  refresh();
  redirect("/inventario");
}

export async function updateProduct(id: number, formData: FormData) {
  const supabase = createClient(await cookies());

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    category_id: formData.get("category_id")
      ? Number(formData.get("category_id"))
      : null,
    quantity: Number(formData.get("quantity") || 1),
    unit: String(formData.get("unit") ?? "unidad"),
    price: Number(formData.get("price") || 0),
    purchase_date: String(formData.get("purchase_date") ?? ""),
    expiry_date: String(formData.get("expiry_date") ?? ""),
    note: (formData.get("note") as string) || null,
  };

  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  refresh();
  redirect("/inventario");
}

export async function markProductStatus(
  id: number,
  status: "consumed" | "wasted",
) {
  const supabase = createClient(await cookies());
  const { error } = await supabase
    .from("products")
    .update({ status, consumed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

type CreateProductPayload = {
  name: string;
  category_id: number | null;
  quantity: number;
  unit: string;
  price: number;
  purchase_date: string;
  expiry_date: string;
};

export async function createProducts(items: CreateProductPayload[]) {
  const supabase = createClient(await cookies());

  const payload = items.map((item) => ({
    name: item.name.trim(),
    category_id: item.category_id,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    purchase_date: item.purchase_date,
    expiry_date: item.expiry_date,
    note: null,
    status: "active" as const,
  }));

  const { error } = await supabase.from("products").insert(payload);
  if (error) throw new Error(error.message);

  refresh();
  redirect("/inventario");
}

export async function deleteProduct(id: number) {
  const supabase = createClient(await cookies());
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
  redirect("/inventario");
}
