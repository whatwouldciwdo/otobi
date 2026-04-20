"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "../../context/ShopContext";
import styles from "./AdminBlogs.module.css";
import Image from "next/image";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

type Blog = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
    isPublished: number;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    createdAt: string;
};

export default function AdminBlogs() {
    const { user } = useShop();
    const router = useRouter();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/blogs?userId=${user.id}`);
            const data = await res.json();
            if (data.blogs) setBlogs(data.blogs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!user || !confirm("Yakin ingin menghapus artikel ini?")) return;
        try {
            const res = await fetch(`/api/admin/blogs?userId=${user.id}&id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchBlogs();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    if (loading) return <div className={styles.loading}>Memuat artikel...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Manajemen Blog</h1>
                    <p className={styles.subtitle}>{blogs.length} artikel ditemukan</p>
                </div>
                <button
                    className={styles.addBtn}
                    onClick={() => router.push("/admin/blogs/editor")}
                >
                    <FiPlus /> Tulis Artikel Baru
                </button>
            </div>

            {blogs.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Belum ada artikel. Tulis artikel pertama Anda!</p>
                    <button
                        className={styles.addBtn}
                        onClick={() => router.push("/admin/blogs/editor")}
                    >
                        <FiPlus /> Mulai Menulis
                    </button>
                </div>
            ) : (
                <div className={styles.blogGrid}>
                    {blogs.map((blog) => (
                        <div key={blog.id} className={styles.blogCard}>
                            <div className={styles.blogImageWrap}>
                                {blog.image ? (
                                    <Image
                                        src={blog.image}
                                        alt={blog.title}
                                        fill
                                        className={styles.blogImage}
                                    />
                                ) : (
                                    <div className={styles.blogImagePlaceholder}>
                                        📝
                                    </div>
                                )}
                                <span
                                    className={`${styles.statusBadge} ${blog.isPublished
                                            ? styles.publishedBadge
                                            : styles.draftBadge
                                        }`}
                                >
                                    {blog.isPublished ? "Terpublikasi" : "Draft"}
                                </span>
                            </div>
                            <div className={styles.blogInfo}>
                                <h3 className={styles.blogTitle}>{blog.title}</h3>
                                <p className={styles.blogMeta}>
                                    oleh {blog.author} ·{" "}
                                    {new Date(blog.createdAt).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>
                                {blog.excerpt && (
                                    <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                                )}
                                {blog.keywords && (
                                    <div className={styles.keywordRow}>
                                        {blog.keywords
                                            .split(",")
                                            .slice(0, 3)
                                            .map((kw: string) => (
                                                <span key={kw} className={styles.keyword}>
                                                    {kw.trim()}
                                                </span>
                                            ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.blogActions}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() =>
                                        router.push(`/admin/blogs/editor?id=${blog.id}`)
                                    }
                                >
                                    <FiEdit2 /> Edit
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(blog.id)}
                                >
                                    <FiTrash2 /> Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
