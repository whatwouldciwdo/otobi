import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Hubungi Kami",
    description: "Hubungi tim Otobi untuk pertanyaan produk, partnership, atau layanan teknis. Kami siap membantu kebutuhan perawatan kendaraan Anda.",
    alternates: { canonical: "/contact" },
    openGraph: {
        title: "Hubungi Kami | OTOBI Car Care",
        description: "Hubungi tim Otobi untuk pertanyaan produk, partnership, atau layanan teknis.",
        url: "/contact",
        type: "website",
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
