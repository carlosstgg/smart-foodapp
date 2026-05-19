import AppHeader from "@/components/AppHeader";
import RecipesClient from "./RecipesClient";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { expiryStatus } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function RecetasPage() {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from("products")
    .select("name, expiry_date, categories(icon)")
    .eq("status", "active")
    .order("expiry_date", { ascending: true });

  const items = (data ?? []).map((p) => {
    const cat = p.categories as { icon?: string } | null;
    return {
      name: p.name,
      days: expiryStatus(p.expiry_date).days,
      icon: cat?.icon ?? "🛒",
    };
  });

  return (
    <div>
      <AppHeader
        title="Recetas con IA"
        subtitle="Aprovecha lo que ya tienes"
      />
      <RecipesClient pantry={items} />
    </div>
  );
}
