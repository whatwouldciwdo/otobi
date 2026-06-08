"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./JournalSection.module.css";
import { FiArrowRight } from "react-icons/fi";

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    image: string | null;
    author: string;
    createdAt: string;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).toUpperCase();
}

export default function JournalSection() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/blogs?limit=4")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.blogs)) setBlogs(data.blogs);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

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
                    {loading ? (
                        [0, 1, 2, 3].map((i) => (
                            <div key={i} className={styles.newsCard} style={{ opacity: 0.4, pointerEvents: "none" }}>
                                <div className={styles.imageWrapper} style={{ background: "#e0e0e0" }} />
                                <div className={styles.cardContent}>
                                    <div className={styles.meta}>
                                        <span className={styles.tag}>LOADING</span>
                                    </div>
                                    <h3 className={styles.articleTitle}>...</h3>
                                </div>
                            </div>
                        ))
                    ) : blogs.length === 0 ? (
                        <p style={{ color: "#888", gridColumn: "1/-1" }}>Belum ada artikel.</p>
                    ) : (
                        blogs.map((blog) => (
                            <Link
                                key={blog.id}
                                href={`/blog/${blog.slug}`}
                                className={styles.newsCard}
                            >
                                <div className={styles.imageWrapper}>
                                    {blog.image && (
                                        <Image
                                            src={blog.image}
                                            alt={blog.title}
                                            fill
                                            className={styles.newsImage}
                                        />
                                    )}
                                </div>
                                <div className={styles.cardContent}>
                                    <div className={styles.meta}>
                                        <span className={styles.tag}>{blog.author?.toUpperCase()}</span>
                                        <span className={styles.date}>{formatDate(blog.createdAt)}</span>
                                    </div>
                                    <h3 className={styles.articleTitle}>{blog.title}</h3>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
