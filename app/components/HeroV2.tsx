import styles from './HeroV2.module.css';

export default function HeroV2() {
    return (
        <section className={styles.heroSection}>
            <div className={styles.hexBackground}></div>
            <div className={styles.videoOverlay}></div>
            
            <div className={styles.content}>
                <div className={styles.textContent}>
                    <h1 className={styles.title}>
                        <span className={styles.titleOutline}>360°</span> VEHICLE
                        <br />
                        PREMIUM PRODUCTS
                    </h1>
                    <button className={styles.discoverBtn}>
                        DISCOVER 
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
