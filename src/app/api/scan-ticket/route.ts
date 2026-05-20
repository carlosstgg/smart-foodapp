import OpenAI from "openai";
import { NextResponse } from "next/server";

type ScannedProduct = {
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category_id: number | null;
};

type CategoryOption = { id: number; name: string };

const VALID_UNITS = ["unidad", "kg", "g", "L", "ml", "paquete"];

const buildSystemPrompt = (categories: CategoryOption[]) => {
  const categoriesList = categories.length
    ? categories.map((c) => `  - ${c.id}: ${c.name}`).join("\n")
    : "  (sin categorías disponibles)";

  return `Eres un asistente que extrae información de tickets de compra de supermercado.
Analiza la imagen y lista TODOS los productos que aparecen en el ticket.
Devuelve ÚNICAMENTE JSON con este formato exacto:
{
  "products": [
    {
      "name": "nombre del producto tal como aparece en el ticket",
      "price": 0.00,
      "quantity": 1,
      "unit": "unidad",
      "category_id": 1
    }
  ]
}
Reglas:
- Incluye todos los productos visibles en el ticket, no solo el primero
- "unit" SOLO puede ser uno de: "unidad", "kg", "g", "L", "ml", "paquete"
- "price" es el precio unitario en números sin símbolo de moneda
- "quantity" es la cantidad comprada del producto
- Si un producto aparece con cantidad (ej. "2x Leche"), refleja eso en quantity
- "category_id" debe ser el id numérico de la categoría más adecuada según el nombre del producto. Usa null SOLO si ninguna categoría aplica.
- Categorías disponibles (id: nombre):
${categoriesList}
- Si no puedes leer algún campo con claridad, usa un valor razonable por defecto
- Responde en español de México`;
};

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta configurar OPENAI_API_KEY en .env.local" },
      { status: 500 },
    );
  }

  let imageBase64: string;
  let mimeType: string;
  let categories: CategoryOption[] = [];
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mimeType = body.mimeType ?? "image/jpeg";
    if (Array.isArray(body.categories)) {
      categories = body.categories
        .map((c: unknown) => {
          if (typeof c !== "object" || c === null) return null;
          const obj = c as { id?: unknown; name?: unknown };
          const id = Number(obj.id);
          const name = String(obj.name ?? "").trim();
          if (!Number.isFinite(id) || !name) return null;
          return { id, name };
        })
        .filter((c: CategoryOption | null): c is CategoryOption => c !== null);
    }
    if (!imageBase64) throw new Error("missing imageBase64");
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const validCategoryIds = new Set(categories.map((c) => c.id));
  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(categories) },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: "text", text: "Lista todos los productos de este ticket." },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { products?: Partial<ScannedProduct>[] };

    const products: ScannedProduct[] = (parsed.products ?? []).map((p) => {
      const rawCategoryId = Number(p.category_id);
      const category_id =
        Number.isFinite(rawCategoryId) && validCategoryIds.has(rawCategoryId)
          ? rawCategoryId
          : null;
      return {
        name: String(p.name ?? "").trim(),
        price: Math.max(0, Number(p.price) || 0),
        quantity: Math.max(0.01, Number(p.quantity) || 1),
        unit: VALID_UNITS.includes(p.unit ?? "") ? (p.unit as string) : "unidad",
        category_id,
      };
    }).filter((p) => p.name.length > 0);

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No se detectaron productos en el ticket" },
        { status: 422 },
      );
    }

    return NextResponse.json({ products });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json(
      { error: `No se pudo analizar el ticket: ${message}` },
      { status: 500 },
    );
  }
}
