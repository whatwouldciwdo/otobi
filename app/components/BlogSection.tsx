import Image from "next/image";
import Link from "next/link";
import styles from "./BlogSection.module.css";
import { FiArrowUpRight } from "react-icons/fi";

const blogPosts = [
    {
        image: "/images/auto-detailing-otobi.png",
        date: "25 Nov 2024",
        category: "Detailing",
        title: "Top 5 Car Maintenance Tips for Winter",
        alt: "Tips merawat mobil di musim dingin atau cuaca ekstrem",
        excerpt: "As temperatures drop, it's essential to prepare your vehicle for winter conditions. From tire care to...",
        href: "/blog/car-maintenance-tips-winter",
    },
    {
        image: "/images/nano-ceramic-coating-otobi.png",
        date: "25 Nov 2024",
        category: "Edukasi",
        title: "How to Identify Genuine Spare Parts for Your Car",
        alt: "Cara membedakan spare parts mobil asli dan palsu di pasaran",
        excerpt: "Counterfeit parts can compromise your car's performance and safety. This guide will help you spot fake...",
        href: "/blog/genuine-spare-parts-guide",
    },
    {
        image: "/images/otobi-special-product.png",
        date: "25 Nov 2024",
        category: "Tips",
        title: "5 Signs It's Time to Replace Your Car Battery",
        alt: "Tanda-tanda aki mobil sudah mulai lemah dan perlu diganti",
        excerpt: "Don't let a weak battery leave you stranded. Look out for these key indicators and learn when...",
        href: "/blog/car-battery-replacement-signs",
    },
];

export default function BlogSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>

                
                <div className={styles.sectionHeader}>
                    <div className={styles.headerLeft}>
                        <p className={styles.sectionLabel}>BLOG & ARTIKEL</p>
                        <h2 className={styles.sectionTitle}>From The Studio</h2>
                    </div>
                    <Link href="/blog" className={styles.viewAllLink}>
                        Semua Artikel <FiArrowUpRight />
                    </Link>
                </div>

                
                <div className={styles.mainLayout}>

                    
                    <Link href="/blog/safety-gear-smoky-drives" className={styles.featuredCard}>
                        <div className={styles.featuredImageWrapper}>
                            <Image
                                src="/images/OTOBI-HERO-IMAGE.png"
                                alt="Menjaga keamanan berkendara saat visibilitas rendah akibat asap atau cuaca buruk"
                                fill
                                className={styles.featuredImage}
                            />
                            <div className={styles.featuredOverlay} />
                        </div>
                        <div className={styles.featuredContent}>
                            <span className={styles.featuredCategory}>Featured</span>
                            <h3 className={styles.featuredTitle}>Safety Gear for Smoky Drives</h3>
                            <p className={styles.featuredExcerpt}>True men embrace the grit — panduan lengkap menjaga keamanan berkendara dalam kondisi visibilitas rendah.</p>
                            <span className={styles.featuredCta}>
                                Baca Selengkapnya <FiArrowUpRight />
                            </span>
                        </div>
                    </Link>

                    
                    <div className={styles.articleList}>
                        {blogPosts.map((post, index) => (
                            <Link key={index} href={post.href} className={styles.articleRow}>
                                
                                <span className={styles.articleNum}>0{index + 1}</span>

                                
                                <div className={styles.articleThumb}>
                                    <Image
                                        src={post.image}
                                        alt={post.alt}
                                        fill
                                        className={styles.articleThumbImg}
                                    />
                                </div>

                                
                                <div className={styles.articleText}>
                                    <div className={styles.articleMeta}>
                                        <span className={styles.articleCategory}>{post.category}</span>
                                        <span className={styles.articleDate}>{post.date}</span>
                                    </div>
                                    <h3 className={styles.articleTitle}>{post.title}</h3>
                                    <p className={styles.articleExcerpt}>{post.excerpt}</p>
                                </div>

                                
                                <span className={styles.articleArrow}><FiArrowUpRight /></span>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
