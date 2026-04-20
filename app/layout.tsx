import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Otobi | Premium Car Care Products — Ceramic Coating & Auto Detailing",
  description:
    "Otobi adalah brand produk perawatan kendaraan premium di Indonesia. Temukan ceramic coating, nano coating, car care products, dan aksesori otomotif terbaik.",
  keywords: [
    "produk car care",
    "ceramic coating indonesia",
    "nano ceramic coating",
    "produk perawatan mobil",
    "auto detailing products",
    "aksesori otomotif",
    "otobi",
  ],
  authors: [{ name: "Otobi" }],
  creator: "Otobi",
  publisher: "Otobi",
  robots: "index, follow",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://otomobi.co.id",
  },
  openGraph: {
    title: "Otobi | Premium Car Care Products",
    description: "Brand produk perawatan kendaraan premium — ceramic coating, car care, dan aksesori otomotif terbaik di Indonesia.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://otomobi.co.id",
    siteName: "OTOBI Car Care",
    images: [
      {
        url: "/images/OTOBI-LOGO.jpeg",
        width: 1200,
        height: 630,
        alt: "Otobi Premium Car Care Products",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Otobi | Premium Car Care Products",
    description: "Brand produk perawatan kendaraan premium — ceramic coating, car care, dan aksesori otomotif terbaik.",
    images: ["/images/OTOBI-LOGO.jpeg"],
  },
};

import { ShopProvider } from "./context/ShopContext";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ShopProvider>
          {children}
          <CartDrawer />
          <WishlistDrawer />
        </ShopProvider>
      </body>
    </html>
  );
}
