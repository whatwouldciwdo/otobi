import Image from "next/image";
import styles from "./PremiumHighlightSection.module.css";
import { LuStar, LuShieldCheck, LuCircleCheckBig } from "react-icons/lu";
import AnimateOnScroll from "./AnimateOnScroll";

export default function PremiumHighlightSection() {
    return (
        <section className={styles.section}>

            
            <div className={styles.bgGhostText} aria-hidden="true">OTOBI</div>

            
            <svg className={styles.arcDecorWrapper} viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="250" cy="250" r="240" fill="none" stroke="#cda34f" strokeWidth="1.5" />
                <circle cx="250" cy="250" r="200" fill="none" stroke="#111111" strokeWidth="0.5" strokeDasharray="4 12" />
                <circle cx="250" cy="250" r="160" fill="none" stroke="#cda34f" strokeWidth="0.5" />
            </svg>

            
            <div className={styles.accentLine} aria-hidden="true"></div>

            
            <div className={styles.container}>
                
                <AnimateOnScroll animation="fade-left" className={styles.imageColumn}>
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/images/otobi-special-product.png"
                            alt="Otobi Premium Paint Protection"
                            fill
                            className={styles.mainImage}
                            style={{ objectFit: 'cover' }}
                        />
                    </div>

                    
                    <div className={styles.imageTag}>Premium Quality</div>

                    
                    <div className={styles.floatingBadge}>
                        <span className={styles.badgeNumber}>10+</span>
                        <span className={styles.badgeText}>Years of<br/>Excellence</span>
                    </div>
                </AnimateOnScroll>

                
                <AnimateOnScroll animation="fade-right" className={styles.textColumn}>
                    <h3 className={styles.subtitle}>Our Quality Guarantee</h3>
                    <h2 className={styles.title}>Why Choose<br/>Otobi Products?</h2>
                    <p className={styles.description}>
                        We believe that taking care of your vehicle shouldn't be a hassle. Our premium autocare line is meticulously formulated to deliver professional-grade results from the comfort of your own garage.
                    </p>

                    <div className={styles.featuresList}>
                        {[
                            {
                                icon: <LuStar className={styles.featureIcon} />,
                                title: "Professional Grade Formula",
                                desc: "Engineered using the latest nanotechnology to ensure long-lasting shine and protection.",
                                delay: 100,
                            },
                            {
                                icon: <LuShieldCheck className={styles.featureIcon} />,
                                title: "Advanced Paint Protection",
                                desc: "Forms a durable hydrophobic barrier against UV rays, acid rain, and everyday road grime.",
                                delay: 200,
                            },
                            {
                                icon: <LuCircleCheckBig className={styles.featureIcon} />,
                                title: "Easy Application",
                                desc: "Achieve showroom quality results in minutes — designed for beginners and professionals alike.",
                                delay: 300,
                            },
                        ].map((f, i) => (
                            <AnimateOnScroll key={i} animation="fade-up" delay={f.delay} className={styles.featureItem}>
                                <div className={styles.featureIconBox}>
                                    {f.icon}
                                </div>
                                <div className={styles.featureText}>
                                    <h4>{f.title}</h4>
                                    <p>{f.desc}</p>
                                </div>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </AnimateOnScroll>
            </div>
        </section>
    );
}
