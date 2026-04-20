import styles from './GlobalNetwork.module.css';

export default function GlobalNetwork() {
    return (
        <section className={styles.section}>
            
            <div className={styles.mapBackground}></div>

            <div className={styles.container}>
                <div className={styles.glassCard}>
                    <div className={styles.iconWrapper}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cda34f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 17 12 22 22 17"></polyline>
                            <polyline points="2 12 12 17 22 12"></polyline>
                        </svg>
                    </div>
                    
                    <p className={styles.description}>
                        We are an authentic brand. We formulate, test and manufacture our products in our own modern facility, guaranteeing the highest possible standards and maximum performance.
                    </p>
                    
                    <h3 className={styles.headline}>
                        OUR GLOBAL NETWORK OF DISTRIBUTORS IN OVER <span className={styles.highlight}>100 COUNTRIES</span>
                    </h3>
                    
                    <button className={styles.discoverBtn}>
                        VIEW OUR PARTNERS
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
