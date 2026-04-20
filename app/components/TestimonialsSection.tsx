import styles from "./TestimonialsSection.module.css";
import AnimateOnScroll from "./AnimateOnScroll";

const testimonials = [
    {
        quote: "Produk Otobi benar-benar beda levelnya. Nano ceramic-nya gampang diaplikasikan dan hasilnya tahan lama banget. Mobil saya udah kinclong 6 bulan tanpa poles lagi.",
        name: "Rizky Pratama",
        detail: "BMW 3-Series Owner · Jakarta",
        initials: "RP",
        featured: false,
    },
    {
        quote: "Saya udah coba banyak produk car care, tapi kualitas Otobi emang premium. Worth every rupiah! Customer service-nya juga responsif banget.",
        name: "Andra Santoso",
        detail: "Toyota GR Yaris Owner · Tangerang",
        initials: "AS",
        featured: true,
    },
    {
        quote: "Detail produknya lengkap, dari exterior sampai interior semua ada. Packaging juga eksklusif. Pas banget buat kado ke sesama car enthusiast.",
        name: "Maya Kusuma",
        detail: "Honda HR-V Owner · Bandung",
        initials: "MK",
        featured: false,
    },
];

export default function TestimonialsSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <AnimateOnScroll animation="fade-left">
                        <p className={styles.sectionLabel}>What People Say</p>
                        <h2 className={styles.sectionTitle}>Real Reviews from<br/>Real Enthusiasts</h2>
                    </AnimateOnScroll>
                    <AnimateOnScroll animation="fade-right">
                        <div className={styles.averageRating}>
                            <div className={styles.ratingNumber}>4.9</div>
                            <div className={styles.stars}>
                                {[1,2,3,4,5].map(i => (
                                    <span key={i} className={styles.starFill}>★</span>
                                ))}
                            </div>
                            <p className={styles.ratingCount}>from 2,400+ reviews</p>
                        </div>
                    </AnimateOnScroll>
                </div>

                <div className={styles.cardsTrack}>
                    {testimonials.map((t, i) => (
                        <AnimateOnScroll key={i} animation="fade-up" delay={i * 120} className={`${styles.testimonialCard} ${t.featured ? styles.featured : ''}`}>
                            <div className={styles.quoteIcon}>"</div>
                            <p className={styles.testimonialText}>{t.quote}</p>
                            <div className={styles.testimonialMeta}>
                                <div className={styles.avatar}>{t.initials}</div>
                                <div>
                                    <div className={styles.cardStars}>
                                        {[1,2,3,4,5].map(s => (
                                            <span key={s} className={styles.starFill}>★</span>
                                        ))}
                                    </div>
                                    <div className={styles.authorName}>{t.name}</div>
                                    <div className={styles.authorDetail}>{t.detail}</div>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
}
