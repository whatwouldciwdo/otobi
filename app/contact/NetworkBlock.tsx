import styles from "./NetworkBlock.module.css";
import Image from "next/image";
import Link from "next/link";

export default function NetworkBlock() {
    return (
        <section className={styles.section}>
            
            <div className={styles.ghostText}>
                THE <span className={styles.solid}>OTOBI</span><br/>NETWORK
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.textContent}>
                    <h2 className={styles.title}>
                        A NETWORK IN OVER 100 COUNTRIES ON 6 CONTINENTS
                    </h2>
                    <p className={styles.description}>
                        A global network of Distributors, Resellers, and Certified Detailers ensuring uncompromised products and standards. Professionalism, dedication and high work ethics are the principles we believe in.
                    </p>
                    <div className={styles.links}>
                        <Link href="/dealers" className={styles.actionLink}>
                            MORE ABOUT OTOBI WORLDWIDE
                        </Link>
                        <Link href="/certified-detailers" className={styles.actionLink}>
                            BECOME A CERTIFIED DETAILER
                        </Link>
                    </div>
                </div>

                <div className={styles.imageContent}>
                    <div className={styles.imagePlaceholder}>
                        <div className={styles.mockupImage}>
                            
                            <svg className={styles.placeholderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="3" y="10" width="18" height="8" rx="2" />
                                <circle cx="7" cy="18" r="2" />
                                <circle cx="17" cy="18" r="2" />
                                <path d="M4 10L6.5 6H15L19 10" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
