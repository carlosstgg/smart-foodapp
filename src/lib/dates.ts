export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diff = target.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function expiryStatus(dateStr: string): {
  label: string;
  tone: "expired" | "urgent" | "soon" | "ok";
  days: number;
} {
  const days = daysUntil(dateStr);
  if (days < 0)
    return { label: `Caducado hace ${Math.abs(days)} día(s)`, tone: "expired", days };
  if (days === 0) return { label: "Caduca hoy", tone: "urgent", days };
  if (days === 1) return { label: "Caduca mañana", tone: "urgent", days };
  if (days <= 3) return { label: `Caduca en ${days} días`, tone: "urgent", days };
  if (days <= 7) return { label: `Caduca en ${days} días`, tone: "soon", days };
  return { label: `Caduca en ${days} días`, tone: "ok", days };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

export function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
