export const dynamic = 'force-dynamic';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import styles from "./BlogDetail.module.css";
import { FiClock, FiUser, FiArrowLeft } from "react-icons/fi";
import prisma from "@/lib/prisma";
import ShareButton from "./ShareButton";

// Fetch from DB securely server-side
async function getBlogBySlug(slug: string) {
    try {
        const blog = await prisma.blog.findUnique({
            where: { slug }
        });
        if (!blog || !blog.isPublished) return null;
        return blog;
    } catch (e) {
        console.error("Error fetching blog by slug", e);
        return null;
    }
}

// Generate dynamic metadata for SEO injection
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
        title: title,
        description,
        keywords: (blog as any).keywords ? (blog as any).keywords.split(",") : [],
        alternates: { canonical: `/blog/${resolvedParams.slug}` },
        openGraph: {
            title,
            description,
            type: "article",
            publishedTime: blog.createdAt?.toISOString(),
            authors: [blog.author || "Otobi"],
            images,
            url: `/blog/${resolvedParams.slug}`,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images,
        },
    };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const blog = await getBlogBySlug(resolvedParams.slug);

    if (!blog) {
        notFound();
    }

    const formattedDate = new Date(blog.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="page-wrapper" style={{ backgroundColor: "#ffffff" }}>
            <Navbar />

            {/* Fixed back button */}
            <nav className={styles.backNav}>
                <Link href="/blog" className={styles.backBtn}>
                    <FiArrowLeft /> Kembali
                </Link>
            </nav>

            <main>
                <article>
                    {/* ---- HERO: cinematic full-bleed if image exists ---- */}
                    {blog.image ? (
                        <div className={styles.hero}>
                            <Image
                                src={blog.image}
                                alt={(blog as any).metaTitle || blog.title}
                                fill
                                priority
                                className={styles.heroImage}
                            />
                            <div className={styles.heroOverlay} />
                            <div className={styles.heroContent}>
                                <div className={styles.heroMeta}>
                                    <span className={styles.heroAuthorBadge}>
                                        <FiUser /> {blog.author || "Otobi Admin"}
                                    </span>
                                    <span className={styles.heroDate}>
                                        <FiClock /> {formattedDate}
                                    </span>
                                </div>
                                <h1 className={styles.heroTitle}>{blog.title}</h1>
                                {blog.excerpt && (
                                    <p className={styles.heroExcerpt}>{blog.excerpt}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ---- No-image: dark typographic hero ---- */
                        <header className={styles.textHeader}>
                            <div className={styles.textHeaderInner}>
                                <div className={styles.textHeaderMeta}>
                                    <span className={styles.authorBadge}>
                                        <FiUser /> {blog.author || "Otobi Admin"}
                                    </span>
                                    <span className={styles.dateBadge}>
                                        <FiClock /> {formattedDate}
                                    </span>
                                </div>
                                <h1 className={styles.textHeaderTitle}>{blog.title}</h1>
                                {blog.excerpt && (
                                    <p className={styles.textHeaderExcerpt}>{blog.excerpt}</p>
                                )}
                            </div>
                        </header>
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
            </main>

            <Footer />
        </div>
    );
}
