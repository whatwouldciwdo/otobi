import Link from "next/link";
import styles from "./FinalCTASection.module.css";
import { LuPackage, LuTruck, LuAward } from "react-icons/lu";
import AnimateOnScroll from "./AnimateOnScroll";

export default function FinalCTASection() {
    return (
        <section className={styles.section}>
            <div className={styles.bgDecor1}></div>
            <div className={styles.bgDecor2}></div>

            <div className={styles.container}>
                
                <AnimateOnScroll animation="fade-left" className={styles.leftContent}>
                    <p className={styles.ctaLabel}>Ready to Upgrade?</p>
                    <h2 className={styles.ctaTitle}>
                        Give Your Car<br/>the Care it<br/><span>Deserves.</span>
                    </h2>
                    <p className={styles.ctaDescription}>
                        Shop our full line of professional-grade auto care products. Fast delivery, authentic products, and the same formulas used by detailing professionals across Indonesia.
                    </p>
                    <div className={styles.ctaButtons}>
                        <Link href="/products" className={styles.btnPrimary}>
                            Shop Products →
                        </Link>
                        <Link href="/services" className={styles.btnSecondary}>
                            Book Detailing
                        </Link>
                    </div>
                </AnimateOnScroll>

                
                <div className={styles.rightContent}>
                    {[
                        {
                            icon: <LuPackage />,
                            title: "Authentic & Sealed",
                            desc: "Every product is 100% authentic, factory-sealed, and quality-checked before shipping.",
                            delay: 100,
                        },
                        {
                            icon: <LuTruck />,
                            title: "Fast Nationwide Shipping",
                            desc: "Order today, shipped tomorrow. We deliver across all of Indonesia within 1–3 business days.",
                            delay: 200,
                        },
                        {
                            icon: <LuAward />,
                            title: "Professional Grade Formula",
                            desc: "The same formulas trusted by professional detailers — now available for your home garage.",
                            delay: 300,
                        },
                    ].map((item, i) => (
                        <AnimateOnScroll key={i} animation="fade-right" delay={item.delay} className={styles.ctaFeature}>
                            <div className={styles.featureIconBox}>
                                {item.icon}
                            </div>
                            <div className={styles.featureInfo}>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        </AnimateOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
}
