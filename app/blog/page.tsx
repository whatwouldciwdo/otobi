import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./BlogIndex.module.css";
import { FiArrowRight } from "react-icons/fi";

export const metadata: Metadata = {
    title: "Otobi Journal",
    description: "Baca artikel terbaru seputar perawatan kendaraan, tips car care, ceramic coating, dan update produk terbaru dari Otobi.",
    alternates: { canonical: "/blog" },
    openGraph: {
        title: "Otobi Journal | Tips & Panduan Car Care",
        description: "Artikel, tips perawatan mobil, dan update produk dari tim Otobi.",
        url: "/blog",
        type: "website",
    },
};

async function getPublishedBlogs() {
    try {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/blogs`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.blogs || [];
    } catch (error) {
        console.error("Failed to fetch blogs:", error);
        return [];
    }
}

export default async function BlogIndexPage() {
    const blogs = await getPublishedBlogs();

    return (
        <div className="page-wrapper" style={{ backgroundColor: "#ffffff" }}>
            <Navbar />

            
            <header className={styles.heroSection}>
                <div className={styles.ghostText}>JOURNAL</div>
                <div className={styles.heroContent}>
                    <h1 className={styles.pageTitle}>OTOBI JOURNAL</h1>
                    <p className={styles.pageDescription}>
                        Latest insights, car care tips, and product updates from the Otobi team.
                    </p>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.container}>
                    {blogs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <h2>No articles yet</h2>
                            <p>Check back soon for the latest news and guides.</p>
                        </div>
                    ) : (
                        <div className={styles.blogGrid}>
                            {blogs.map((blog: any) => (
                                <Link href={`/blog/${blog.slug}`} key={blog.id} className={styles.blogCard}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={blog.image || '/images/otobi-special-product.png'}
                                            alt={blog.title}
                                            fill
                                            className={styles.blogImage}
                                        />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <div className={styles.meta}>
                                            <span className={styles.tag}>{blog.author}</span>
                                            <span className={styles.date}>
                                                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                        <h2 className={styles.cardTitle}>{blog.title}</h2>
                                        <p className={styles.cardExcerpt}>{blog.excerpt}</p>
                                        <div className={styles.readMore}>
                                            Read Article <FiArrowRight className={styles.arrowIcon} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
