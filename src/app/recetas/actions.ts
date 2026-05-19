"use server";

import OpenAI from "openai";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { expiryStatus } from "@/lib/dates";

export type Recipe = {
  title: string;
  emoji: string;
  time_minutes: number;
  difficulty: "fácil" | "media" | "difícil";
  uses: string[];
  missing: string[];
  steps: string[];
};

export async function suggestRecipes(extraIngredients?: string): Promise<{
  recipes: Recipe[];
  pantry: string[];
  error?: string;
}> {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from("products")
    .select("name, quantity, unit, expiry_date")
    .eq("status", "active")
    .order("expiry_date", { ascending: true });

  const products = data ?? [];

  if (products.length === 0) {
    return {
      recipes: [],
      pantry: [],
      error:
        "Tu inventario está vacío. Agrega productos para recibir sugerencias.",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      recipes: [],
      pantry: products.map((p) => p.name),
      error:
        "Falta configurar OPENAI_API_KEY en .env.local para activar las recetas con IA.",
    };
  }

  // Prioritize what's expiring soon
  const prioritized = products.map((p) => {
    const days = expiryStatus(p.expiry_date).days;
    return { ...p, days };
  });

  const urgent = prioritized.filter((p) => p.days <= 7);
  const ingredientsList = (urgent.length > 0 ? urgent : prioritized)
    .map(
      (p) =>
        `- ${p.name} (${p.quantity} ${p.unit}, caduca en ${p.days} día(s))`,
    )
    .join("\n");

  const openai = new OpenAI({ apiKey });

  const prompt = `Eres un chef que ayuda a evitar el desperdicio de alimentos.
Genera 3 recetas SENCILLAS aprovechando estos ingredientes del inventario (prioriza los que caducan antes):

${ingredientsList}
${extraIngredients ? `\nIngredientes extras que el usuario tiene en casa: ${extraIngredients}` : ""}

Devuelve ÚNICAMENTE JSON con este formato exacto:
{
  "recipes": [
    {
      "title": "Nombre corto",
      "emoji": "un emoji",
      "time_minutes": 20,
      "difficulty": "fácil",
      "uses": ["ingrediente del inventario", "..."],
      "missing": ["ingredientes adicionales que se necesitan", "..."],
      "steps": ["paso 1 corto", "paso 2", "..."]
    }
  ]
}
Reglas:
- Mínimo 3 recetas.
- "difficulty" SOLO puede ser "fácil", "media" o "difícil".
- 4 a 6 pasos cortos y claros por receta.
- Responde en español de México.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente culinario que devuelve únicamente JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { recipes?: Recipe[] };
    return {
      recipes: parsed.recipes ?? [],
      pantry: products.map((p) => p.name),
    };
  } catch (e) {
    return {
      recipes: [],
      pantry: products.map((p) => p.name),
      error:
        e instanceof Error
          ? `No se pudieron generar recetas: ${e.message}`
          : "Error desconocido al consultar IA.",
    };
  }
}
