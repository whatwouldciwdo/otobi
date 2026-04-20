import styles from "./StatsBentoSection.module.css";
import AnimateOnScroll from "./AnimateOnScroll";

export default function StatsBentoSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <AnimateOnScroll animation="fade-up">
                    <p className={styles.sectionLabel}>Numbers Don't Lie</p>
                    <h2 className={styles.sectionTitle}>Trusted by Thousands of<br/>Auto Enthusiasts</h2>
                </AnimateOnScroll>

                <div className={styles.bentoGrid}>
                    <AnimateOnScroll animation="fade-left" delay={0} className={`${styles.bentoCard} ${styles.large}`}>
                        <div>
                            <div className={styles.statNumber}>10K+</div>
                            <div className={styles.statLabel}>Happy customers who trust Otobi products for their premium car care needs, across Indonesia.</div>
                        </div>
                        <div className={styles.bentoDecor}></div>
                    </AnimateOnScroll>

                    <AnimateOnScroll animation="fade-up" delay={100} className={styles.bentoCard}>
                        <div className={styles.statNumber}>98%</div>
                        <div className={styles.statLabel}>Customer satisfaction rate based on verified reviews</div>
                    </AnimateOnScroll>

                    <AnimateOnScroll animation="fade-up" delay={200} className={`${styles.bentoCard} ${styles.accent}`}>
                        <div className={styles.statNumber}>50+</div>
                        <div className={styles.statLabel}>Professional grade products in our collection</div>
                    </AnimateOnScroll>

                    <AnimateOnScroll animation="fade-up" delay={300} className={`${styles.bentoCard} ${styles.dark}`}>
                        <div className={styles.statNumber}>10+</div>
                        <div className={styles.statLabel}>Years of auto detailing expertise behind every formula</div>
                    </AnimateOnScroll>

                    <AnimateOnScroll animation="fade-up" delay={400} className={styles.bentoCard}>
                        <div className={styles.statNumber}>5.0</div>
                        <div className={styles.statLabel}>Average star rating across all product lines</div>
                    </AnimateOnScroll>
                </div>
            </div>
        </section>
    );
}
