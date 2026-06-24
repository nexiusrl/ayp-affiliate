import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { BackToTop } from "@/components/product/BackToTop";

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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "AYP Affiliate",
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
        <ToastProvider>
          {children}
          <BackToTop />
        </ToastProvider>
      </body>
    </html>
  );
}
