import Image from "next/image";
import Link from "next/link";
import styles from "./PremiumServices.module.css";
import { FiArrowUpRight } from "react-icons/fi";

const services = [
    {
        title: "Auto Detailing",
        description: "Pembersihan menyeluruh eksterior & interior dengan teknik profesional.",
        image: "/images/auto-detailing-otobi.png",
        alt: "Layanan auto detailing interior dan eksterior mobil profesional di Otobi Jakarta",
        href: "/services#auto-detailing",
        imageClass: styles.sideImage,
        itemClass: "",
        badge: "POPULER",
    },
    {
        title: "Nano Ceramic Coating",
        description: "Proteksi cat 9H+ dengan daya tahan hingga 3 tahun, kilap permanen.",
        image: "/images/nano-ceramic-coating-otobi.png",
        alt: "Proses aplikasi nano ceramic coating untuk pelindung cat kilap maksimal",
        href: "/services#nano-ceramic",
        imageClass: styles.middleImage,
        itemClass: styles.middleItem,
        badge: "UNGGULAN",
    },
    {
        title: "Otobi Special Product",
        description: "Produk perawatan eksklusif formulasi premium khusus brand Otobi.",
        image: "/images/otobi-special-product.png",
        alt: "Produk perawatan mobil premium eksklusif dari Otobi",
        href: "/products",
        imageClass: styles.sideImage,
        itemClass: "",
        badge: "EKSKLUSIF",
    },
];

const BgMesh = () => (
    <svg
        className={styles.bgMesh}
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
    >
        <circle cx="400" cy="300" r="260" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="400" cy="300" r="200" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="400" cy="300" r="140" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="400" cy="300" r="80" stroke="currentColor" strokeWidth="0.4" />
        <line x1="0" y1="300" x2="800" y2="300" stroke="currentColor" strokeWidth="0.5" />
        <line x1="400" y1="0" x2="400" y2="600" stroke="currentColor" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="800" y2="600" stroke="currentColor" strokeWidth="0.4" />
        <line x1="800" y1="0" x2="0" y2="600" stroke="currentColor" strokeWidth="0.4" />
    </svg>
);

export default function PremiumServices() {
    return (
        <section className={styles.section}>
            
            <BgMesh />

            <div className={styles.container}>
                <div className={styles.header}>
                    <p className={styles.subtitle}>SERVICES</p>
                    <h2 className={styles.title}>OUR PREMIUM SERVICES</h2>
                    <p className={styles.tagline}>
                        Setiap layanan dirancang untuk memberikan perlindungan dan kilap terbaik bagi kendaraan Anda.
                    </p>
                </div>

                <div className={styles.grid}>
                    {services.map((service, index) => (
                        <div key={index} className={`${styles.serviceItem} ${service.itemClass}`}>
                            
                            <div className={styles.serviceHeader}>
                                <h3 className={styles.serviceName}>{service.title}</h3>
                                <span className={styles.badge}>{service.badge}</span>
                            </div>

                            
                            <Link href={service.href} className={`${styles.imageWrapper} ${service.imageClass}`}>
                                <Image
                                    src={service.image}
                                    alt={service.alt}
                                    fill
                                    className={styles.image}
                                />
                                
                                <div className={styles.imageOverlay}>
                                    <div className={styles.overlayContent}>
                                        <p className={styles.overlayDesc}>{service.description}</p>
                                        <span className={styles.overlayBtn}>
                                            Lihat Detail <FiArrowUpRight />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                
                <div className={styles.ctaRow}>
                    <p className={styles.ctaText}>Tidak menemukan yang Anda cari?</p>
                    <Link href="/services" className={styles.ctaLink}>
                        Lihat Semua Layanan <FiArrowUpRight />
                    </Link>
                </div>
            </div>
        </section>
    );
}
