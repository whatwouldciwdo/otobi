import Image from "next/image";
import styles from "./QualitySection.module.css";

const leftFeatures = [
    { title: "Perfect Clean", subtitle: "Protection" },
    { title: "Expert Customer", subtitle: "Support" },
];

const rightFeatures = [
    { title: "Super Glossy", subtitle: "Look" },
    { title: "Long Lasting", subtitle: "Shine" },
];

export default function QualitySection() {
    return (
        <section className={styles.quality}>
            <div className={styles.qualityInner}>
                
                <h2 className={styles.heading}>Luxury in Every Layer</h2>

                
                <div className={styles.layoutRow}>
                    
                    <div className={styles.featureCol}>
                        {leftFeatures.map((f, i) => (
                            <div key={i} className={`${styles.featureItem} ${styles.featureLeft}`}>
                                <h3 className={styles.featureTitle}>{f.title}</h3>
                                <p className={styles.featureSubtitle}>{f.subtitle}</p>
                            </div>
                        ))}
                    </div>

                    
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/images/otobi-product-homepage.png"
                            alt="Beragam produk cairan perawatan mobil premium Otobi untuk interior dan eksterior"
                            width={420}
                            height={320}
                            className={styles.productImage}
                            priority
                        />
                    </div>

                    
                    <div className={styles.featureCol}>
                        {rightFeatures.map((f, i) => (
                            <div key={i} className={`${styles.featureItem} ${styles.featureRight}`}>
                                <h3 className={styles.featureTitle}>{f.title}</h3>
                                <p className={styles.featureSubtitle}>{f.subtitle}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
