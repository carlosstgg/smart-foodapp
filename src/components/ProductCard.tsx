import Link from "next/link";
import { expiryStatus, formatMoney } from "@/lib/dates";
import type { ProductWithCategory } from "@/lib/types";

const toneText: Record<string, string> = {
  expired: "text-red-700",
  urgent: "text-amber-800",
  soon: "text-yellow-800",
  ok: "text-emerald-700",
};

const toneDot: Record<string, string> = {
  expired: "bg-red-500",
  urgent: "bg-amber-500",
  soon: "bg-yellow-500",
  ok: "bg-emerald-500",
};

const tonePill: Record<string, string> = {
  expired: "bg-red-500/15 border-red-400/40",
  urgent: "bg-amber-500/15 border-amber-400/40",
  soon: "bg-yellow-400/20 border-yellow-400/40",
  ok: "bg-emerald-500/15 border-emerald-400/40",
};

export default function ProductCard({
  product,
}: {
  product: ProductWithCategory;
}) {
  const { tone, label } = expiryStatus(product.expiry_date);
  const icon = product.categories?.icon ?? "🛒";

  return (
    <Link
      href={`/inventario/${product.id}`}
      className="tap glass glass-shine block rounded-3xl p-3"
    >
      <div className="flex items-center gap-3">
        <div className="relative size-12 rounded-2xl glass-tint grid place-items-center text-2xl shrink-0">
          <span aria-hidden>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold tracking-tight truncate text-[15px]">
              {product.name}
            </h3>
            {product.price > 0 && (
              <span className="text-[11px] font-medium text-zinc-600 shrink-0 tabular-nums">
                {formatMoney(product.price)}
              </span>
            )}
          </div>
          <p className="text-[12px] text-zinc-600 truncate">
            {product.quantity} {product.unit}
            {product.categories?.name ? ` · ${product.categories.name}` : ""}
          </p>
          <span
            className={`mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur ${tonePill[tone]} ${toneText[tone]}`}
          >
            <span className={`size-1.5 rounded-full ${toneDot[tone]}`} />
            {label}
          </span>
        </div>
      </div>
    </Link>
  );
}
