import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: {
    default: "AYP Affiliate — Temukan Produk Terbaik",
    template: "%s | AYP Affiliate",
  },
  description:
    "Temukan produk-produk pilihan terbaik dari Shopee dan Tokopedia. Harga terjangkau, kualitas terpercaya.",
  keywords: ["affiliate", "shopee", "tokopedia", "produk", "belanja online"],
  openGraph: {
    title: "AYP Affiliate",
    description: "Temukan produk-produk pilihan terbaik dari Shopee dan Tokopedia.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
