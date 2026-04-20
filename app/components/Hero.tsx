import Image from "next/image";
import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.heroCard}>
                    
                    <div className={styles.heroBgWrapper}>
                        <Image
                            src="/images/OTOBI-HERO-IMAGE.png"
                            alt="Mobil sport mewah Porsche yang baru saja selesai proses detailing dan coating di Otobi Jakarta"
                            fill
                            className={styles.heroBgImage}
                            priority
                        />
                        
                        <div className={styles.heroOverlay}>
                            <h1 className="sr-only">Otobi - Layanan Premium Auto Detailing, Nano Ceramic Coating, dan Produk Perawatan Mobil Terbaik</h1>
                            <div className={styles.heroText}>
                                <h2 className={styles.heroLine}>
                                    <span className={styles.heroBig}>DETAIL</span>
                                    <span className={styles.heroSmall}>STORE</span>
                                </h2>
                                <h2 className={styles.heroLine}>
                                    <span className={styles.heroBig}>SELL</span>
                                    <span className={styles.heroSmall}>PRODUCTS</span>
                                </h2>
                                <h2 className={styles.heroLine}>
                                    <span className={styles.heroBig}>EARN</span>
                                    <span className={styles.heroSmall}>LOYALTY</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
