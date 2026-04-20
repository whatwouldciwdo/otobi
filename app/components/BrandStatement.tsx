import styles from './BrandStatement.module.css';

export default function BrandStatement() {
    return (
        <section className={styles.section}>
            <div className={styles.bgGraphic}></div>
            <div className={styles.container}>
                <div className={styles.eyebrow}>CRAFTED FOR PERFORMANCE</div>
                <h2 className={styles.statement}>
                    BUILT FOR THOSE WHO <span className={styles.outline}>REFUSE TO SETTLE</span> — SUPERIOR PROTECTION, <span className={styles.small}>UNMATCHED</span> BRILLIANCE <span className={styles.outline}>FOR EVERY VEHICLE.</span>
                </h2>
                <button className={styles.discoverBtn}>
                    DISCOVER MORE
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </button>
            </div>
        </section>
    );
}
