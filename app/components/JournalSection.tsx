import Image from "next/image";
import Link from "next/link";
import styles from "./JournalSection.module.css";
import { FiArrowRight } from "react-icons/fi";

const articles = [
    {
        slug: "new-ceramic-coating-line",
        tag: "PRODUCT NEWS",
        title: "Introducing our new advanced ceramic coating lineup for professionals.",
        date: "MAR 15, 2026",
        image: "/images/otobi-product-homepage.png",
    },
    {
        slug: "otobi-distributor-meet",
        tag: "EVENTS",
        title: "Annual Otobi global distributor meeting in Jakarta.",
        date: "FEB 28, 2026",
        image: "/images/otobi-special-product.png",
    },
    {
        slug: "marine-care-launch",
        tag: "NEW RELEASES",
        title: "Marine Warrior: The ultimate protection for yachts and boats.",
        date: "JAN 10, 2026",
        image: "/images/OTOBI-HERO-IMAGE.png",
    },
    {
        slug: "sema-show-recap",
        tag: "EXHIBITION",
        title: "Otobi shines at the international SEMA show 2025.",
        date: "NOV 05, 2025",
        image: "/images/products/syncro-kit.png", 
    },
];

export default function JournalSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.sectionTitle}>OTOBI NEWS</h2>
                    <Link href="/blog" className={styles.discoverBtn}>
                        ALL NEWS
                        <FiArrowRight />
                    </Link>
                </div>

                <div className={styles.newsGrid}>
                    {articles.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/blog/${article.slug}`}
                            className={styles.newsCard}
                        >
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    className={styles.newsImage}
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.meta}>
                                    <span className={styles.tag}>{article.tag}</span>
                                    <span className={styles.date}>{article.date}</span>
                                </div>
                                <h3 className={styles.articleTitle}>{article.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
