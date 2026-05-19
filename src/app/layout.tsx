import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartFood — Cero desperdicio",
  description:
    "Controla tu inventario, evita que la comida se eche a perder y recibe recetas con IA.",
};

export const viewport: Viewport = {
  themeColor: "#1cbf6a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex justify-center">
        {/* Aurora mesh sits behind everything */}
        <div className="aurora" aria-hidden />

        <div className="phone-shell flex flex-col">
          <main className="relative flex-1 pb-32 z-10">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
