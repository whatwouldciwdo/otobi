import Link from "next/link";
import styles from "./ContactHero.module.css";

export default function ContactHero() {
    return (
        <section className={styles.heroSection}>
            <div className={styles.bgGraphic}></div>
            
            
            <div className={styles.artContainer}>
                <svg className={styles.wireframe} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 10L180 60L160 150L80 180L10 110L40 30L100 10Z" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
                    <path d="M100 10L80 180" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
                    <path d="M180 60L10 110" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
                    <path d="M160 150L40 30" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
                </svg>
                <div className={styles.crystal}></div>
                <div className={styles.smallDot}></div>
                <div className={styles.darkDot}></div>
            </div>

            <div className={styles.content}>
                <span className={styles.eyebrow}>CONTACT OTOBI</span>
                <h1 className={styles.title}>
                    CHECK <span className={styles.light}>THE FREQUENTLY<br/>ASKED</span> QUESTIONS<br/>
                    <span className={styles.light}>OR</span> WRITE TO US
                </h1>
                
                <p className={styles.subtitle}>
                    Complete answers to the most standard questions can be found in our FAQ section.<br/>
                    Are you looking for help? Check our FAQ before getting in touch.
                </p>

                <div className={styles.actions}>
                    <Link href="/faq" className={styles.faqBtn}>FAQ</Link>
                </div>
            </div>
        </section>
    );
}
