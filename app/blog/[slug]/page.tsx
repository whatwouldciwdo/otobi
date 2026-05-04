export const dynamic = 'force-dynamic';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import styles from "./BlogDetail.module.css";
import { FiClock, FiUser, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import prisma from "@/lib/prisma";
import ShareButton from "./ShareButton";
import ReadingProgress from "./ReadingProgress";

// Fetch from DB securely server-side
async function getBlogBySlug(slug: string) {
    try {
        const blog = await prisma.blog.findUnique({ where: { slug } });
        if (!blog || !blog.isPublished) return null;
        return blog;
    } catch (e) {
        console.error("Error fetching blog by slug", e);
        return null;
    }
}

// Get related articles (other published blogs, max 3)
async function getRelatedBlogs(currentSlug: string) {
    try {
        const blogs = await prisma.blog.findMany({
            where: { isPublished: true, NOT: { slug: currentSlug } },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { id: true, title: true, slug: true, image: true, author: true, createdAt: true, excerpt: true },
        });
        return blogs;
    } catch {
        return [];
    }
}

// Generate dynamic metadata
export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const blog = await getBlogBySlug(resolvedParams.slug);
    if (!blog) return { title: "Blog Not Found" };

    const title = (blog as any).metaTitle || blog.title;
    const description = (blog as any).metaDescription || blog.excerpt || blog.title;
    const images = blog.image ? [blog.image] : [];

    return {
        title,
        description,
        keywords: (blog as any).keywords ? (blog as any).keywords.split(",") : [],
        alternates: { canonical: `/blog/${resolvedParams.slug}` },
        openGraph: {
            title, description,
            type: "article",
            publishedTime: blog.createdAt?.toISOString(),
            authors: [blog.author || "Otobi"],
            images,
            url: `/blog/${resolvedParams.slug}`,
        },
        twitter: { card: "summary_large_image", title, description, images },
    };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const [blog, relatedBlogs] = await Promise.all([
        getBlogBySlug(resolvedParams.slug),
        getRelatedBlogs(resolvedParams.slug),
    ]);

    if (!blog) notFound();

    const formattedDate = new Date(blog.createdAt).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
    });

    return (
        <div className="page-wrapper" style={{ backgroundColor: "#ffffff" }}>
            {/* Reading progress bar */}
            <ReadingProgress />

            <Navbar forceScrolled />

            {/* Floating back button */}
            <nav className={styles.backNav}>
                <Link href="/blog" className={styles.backBtn}>
                    <FiArrowLeft /> Kembali
                </Link>
            </nav>

            <main>
                <article>
                    {/* ---- ARTICLE HEADER: clean white, centered ---- */}
                    <header className={styles.articleHeader}>
                        <div className={styles.articleMeta}>
                            <span className={styles.categoryBadge}>
                                {blog.author || "Otobi"}
                            </span>
                            <span className={styles.metaDot} />
                            <span className={styles.metaDate}>
                                <FiClock /> {formattedDate}
                            </span>
                        </div>

                        <h1 className={styles.articleTitle}>{blog.title}</h1>

                        {blog.excerpt && (
                            <p className={styles.articleExcerpt}>{blog.excerpt}</p>
                        )}
                    </header>

                    {/* ---- COVER IMAGE: inside content area ---- */}
                    {blog.image && (
                        <div className={styles.coverImageWrapper}>
                            <img
                                src={blog.image}
                                alt={(blog as any).metaTitle || blog.title}
                                className={styles.coverImage}
                            />
                        </div>
                    )}

                    {/* ---- READING AREA ---- */}
                    <div className={styles.readingArea}>
                        <div
                            className={styles.content}
                            suppressHydrationWarning={true}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        <div className={styles.divider}>
                            <span className={styles.dividerDot} />
                        </div>

                        {/* Article Footer */}
                        <footer className={styles.articleFooter}>
                            <Link href="/blog" className={styles.footerBackLink}>
                                <FiArrowLeft /> Semua Artikel
                            </Link>
                            <div className={styles.shareRow}>
                                <span className={styles.shareLabel}>Bagikan</span>
                                <ShareButton />
                            </div>
                        </footer>
                    </div>
                </article>

                {/* ---- RELATED ARTICLES ---- */}
                {relatedBlogs.length > 0 && (
                    <section className={styles.relatedSection}>
                        <div className={styles.relatedInner}>
                            <h2 className={styles.relatedHeading}>Artikel Lainnya</h2>
                            <div className={styles.relatedGrid}>
                                {relatedBlogs.map((related) => (
                                    <Link
                                        key={related.id}
                                        href={`/blog/${related.slug}`}
                                        className={styles.relatedCard}
                                    >
                                        <div className={styles.relatedImageWrapper}>
                                            <Image
                                                src={related.image || '/images/otobi-special-product.png'}
                                                alt={related.title}
                                                fill
                                                className={styles.relatedImage}
                                            />
                                        </div>
                                        <div className={styles.relatedContent}>
                                            <div className={styles.relatedMeta}>
                                                <span className={styles.relatedAuthor}>{related.author || "Otobi"}</span>
                                                <span className={styles.metaDot} />
                                                <span className={styles.relatedDate}>
                                                    {new Date(related.createdAt).toLocaleDateString("id-ID", {
                                                        day: "numeric", month: "short", year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                            <h3 className={styles.relatedTitle}>{related.title}</h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
