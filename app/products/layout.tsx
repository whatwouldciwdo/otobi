import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Semua Produk",
    description: "Temukan koleksi lengkap produk perawatan kendaraan premium Otobi — ceramic coating, nano coating, microfiber, aksesori detailing, dan lebih banyak lagi.",
    alternates: { canonical: "/products" },
    openGraph: {
        title: "Semua Produk | OTOBI Car Care",
        description: "Koleksi lengkap produk car care premium Otobi. Ceramic coating, perawatan body, interior, kaca, ban & velg, dan aksesori detailing profesional.",
        url: "/products",
        type: "website",
    },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
