import AppHeader from "@/components/AppHeader";
import TicketScanner from "@/components/TicketScanner";

export default function EscanearPage() {
  return (
    <div>
      <AppHeader title="Escanear ticket" back="/inventario" />
      <TicketScanner />
    </div>
  );
}
