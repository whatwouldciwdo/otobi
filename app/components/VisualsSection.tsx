"use client";

import Image from "next/image";
import styles from "./VisualsSection.module.css";
import { FiArrowUpRight } from "react-icons/fi";

const visualImages = [
    { 
        src: "/images/nano-ceramic-coating-otobi.png", 
        alt: "Detailing interior mobil untuk kebersihan optimal",
        label: "Precision Detailing",
    },
    { 
        src: "/images/OTOBI-HERO-IMAGE.png", 
        alt: "Hasil kilap maksimal setelah aplikasi nano ceramic coating",
        label: "Flawless Finish",
    },
    { 
        src: "/images/auto-detailing-otobi.png", 
        alt: "Proses poles cat mobil dengan mesin double action",
        label: "Paint Correction",
    },
    { 
        src: "/product/images/ph-balanced-shampoo-otobi.png", 
        alt: "Otobi PH Balanced Shampoo aman untuk cat kendaraan",
        label: "Premium Wash",
        isProduct: true
    },
    { 
        src: "/images/otobi-special-product.png", 
        alt: "Produk chemical perawatan mobil eksklusif",
        label: "Specialized Care",
    },
    { 
        src: "/product/images/all-purpose-cleaner-otobi.png", 
        alt: "Otobi All Purpose Cleaner",
        label: "Interior Cleaning",
        isProduct: true
    },
];

export default function VisualsSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <p className={styles.subtitle}>BEHIND THE SCENES</p>
                    <h3 className={styles.title}>Visuals</h3>
                </div>

                <div className={styles.bentoGrid}>
                    {visualImages.map((image, index) => (
                        <div key={index} className={`${styles.bentoItem} ${image.isProduct ? styles.productItem : ''}`}>
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className={`${styles.image} ${image.isProduct ? styles.imageContain : ''}`}
                            />
                            <div className={styles.overlay}>
                                <div className={styles.overlayContent}>
                                    <span className={styles.label}>{image.label}</span>
                                    <span className={styles.iconWrapper}><FiArrowUpRight className={styles.icon} /></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
