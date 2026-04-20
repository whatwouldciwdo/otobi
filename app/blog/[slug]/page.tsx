export const dynamic = 'force-dynamic';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import styles from "./BlogDetail.module.css";
import { FiClock, FiUser, FiArrowLeft, FiShare2 } from "react-icons/fi";
import prisma from "@/lib/prisma";

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

    // In Prisma schema we don't have metaTitle, metaDescription, keywords. They might be in the model if added recently, let's just use what's available.
    const title = (blog as any).metaTitle || blog.title;
    const description = (blog as any).metaDescription || blog.excerpt || blog.title;
    const images = blog.image ? [blog.image] : [];

    return {
        title: `${title} | Otobi`,
        description,
        keywords: (blog as any).keywords ? (blog as any).keywords.split(",") : [],
        openGraph: {
            title,
            description,
            type: "article",
            publishedTime: blog.createdAt?.toISOString(),
            authors: [blog.author || "Otobi"],
            images,
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
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="page-wrapper" style={{ backgroundColor: "#fff" }}>
            <Navbar />

            <main className={styles.main}>
                <article className={styles.article}>

                    {/* Header */}
                    <header className={styles.header}>
                        <Link href="/blog" className={styles.backLink}>
                            <FiArrowLeft /> Kembali ke Blog
                        </Link>

                        <h1 className={styles.title}>{blog.title}</h1>

                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <FiUser className={styles.metaIcon} />
                                <span>{blog.author || "Otobi Admin"}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <FiClock className={styles.metaIcon} />
                                <time dateTime={blog.createdAt.toISOString()}>{formattedDate}</time>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {blog.image && (
                        <div className={styles.featuredImageWrap}>
                            <Image
                                src={blog.image}
                                alt={(blog as any).metaTitle || blog.title}
                                fill
                                priority
                                className={styles.featuredImage}
                            />
                        </div>
                    )}

                    {/* Rich Text Content */}
                    <div
                        className={styles.content}
                        suppressHydrationWarning={true}
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Footer / Share (placeholder) */}
                    <footer className={styles.articleFooter}>
                        <div className={styles.shareWrap}>
                            <span className={styles.shareText}>Bagikan Artikel:</span>
                            <button className={styles.shareBtn}><FiShare2 /> Copy Link</button>
                        </div>
                    </footer>

                </article>
            </main>

            <Footer />
        </div>
    );
}
