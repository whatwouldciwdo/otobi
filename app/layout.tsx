import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://otobi.id"),
  title: {
    default: "OTOBI | Premium Car Care Products Indonesia",
    template: "%s | OTOBI Car Care",
  },
  description:
    "Otobi adalah brand produk perawatan kendaraan premium di Indonesia. Temukan ceramic coating, nano coating, car care products, dan aksesori otomotif terbaik.",
  keywords: [
    "otobi",
    "otobi car care",
    "produk car care indonesia",
    "ceramic coating indonesia",
    "nano ceramic coating",
    "produk perawatan mobil",
    "auto detailing products",
    "aksesori otomotif",
    "perawatan kendaraan",
  ],
  authors: [{ name: "Otobi", url: process.env.NEXT_PUBLIC_BASE_URL || "https://otobi.id" }],
  creator: "Otobi",
  publisher: "Otobi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OTOBI | Premium Car Care Products Indonesia",
    description: "Brand produk perawatan kendaraan premium — ceramic coating, car care, dan aksesori otomotif terbaik di Indonesia.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://otobi.id",
    siteName: "OTOBI Car Care",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "OTOBI Premium Car Care Products",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OTOBI | Premium Car Care Products Indonesia",
    description: "Brand produk perawatan kendaraan premium — ceramic coating, car care, dan aksesori otomotif terbaik.",
    images: ["/images/og-image.png"],
    site: "@otobi_id",
    creator: "@otobi_id",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

import { ShopProvider } from "./context/ShopContext";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import CookieConsent from "./components/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DHQF13SZX5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DHQF13SZX5');
          `}
        </Script>
      </head>
      <body>
        <ShopProvider>
          {children}
          <CartDrawer />
          <WishlistDrawer />
          <CookieConsent />
        </ShopProvider>
      </body>
    </html>
  );
}
