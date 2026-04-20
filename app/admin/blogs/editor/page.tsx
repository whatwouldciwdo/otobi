"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "../../../context/ShopContext";
import Link from "next/link";
import styles from "./BlogEditor.module.css";
import { FiArrowLeft, FiSave, FiEye, FiEyeOff, FiImage, FiSearch, FiGlobe } from "react-icons/fi";
import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";

const QuillEditor = dynamic(() => import("./QuillEditor"), { ssr: false });

export default function BlogEditorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useShop();
    const blogId = searchParams.get("id");
    const isEdit = !!blogId;

    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image: "",
        author: "Admin",
        isPublished: false,
        metaTitle: "",
        metaDescription: "",
        keywords: "",
    });

    
    const metaTitleLen = formData.metaTitle.length;
    const metaDescLen = formData.metaDescription.length;
    const metaTitleStatus =
        metaTitleLen === 0
            ? "empty"
            : metaTitleLen < 50
                ? "short"
                : metaTitleLen <= 60
                    ? "good"
                    : "long";
    const metaDescStatus =
        metaDescLen === 0
            ? "empty"
            : metaDescLen < 120
                ? "short"
                : metaDescLen <= 160
                    ? "good"
                    : "long";

    const statusColor = (s: string) =>
        s === "good" ? "#4caf50" : s === "short" || s === "empty" ? "#ff9800" : "#f44336";

    
    useEffect(() => {
        if (!isEdit || !user) return;
        const load = async () => {
            const res = await fetch(`/api/admin/blogs?userId=${user.id}`);
            const data = await res.json();
            const blog = data.blogs?.find((b: any) => b.id === blogId);
            if (blog) {
                setFormData({
                    title: blog.title ?? "",
                    slug: blog.slug ?? "",
                    excerpt: blog.excerpt ?? "",
                    content: blog.content ?? "",
                    image: blog.image ?? "",
                    author: blog.author ?? "Admin",
                    isPublished: blog.isPublished === 1,
                    metaTitle: blog.metaTitle ?? "",
                    metaDescription: blog.metaDescription ?? "",
                    keywords: blog.keywords ?? "",
                });
            }
        };
        load();
    }, [blogId, user]);

    
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: prev.slug
                ? prev.slug
                : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setSaveMsg("");
        try {
            const method = isEdit ? "PUT" : "POST";
            const body = {
                userId: user.id,
                ...(isEdit && { id: blogId }),
                ...formData,
            };
            const res = await fetch("/api/admin/blogs", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setSaveMsg("✅ Artikel berhasil disimpan!");
                setTimeout(() => router.push("/admin/blogs"), 1200);
            } else {
                const d = await res.json();
                setSaveMsg(`❌ Gagal: ${d.error}`);
            }
        } catch {
            setSaveMsg("❌ Terjadi kesalahan jaringan.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.editorLayout}>
            
            <div className={styles.topBar}>
                <Link href="/admin/blogs" className={styles.backBtn}>
                    <FiArrowLeft />
                    <span>Kembali</span>
                </Link>
                <h1 className={styles.topBarTitle}>
                    {isEdit ? "Edit Artikel" : "Tulis Artikel Baru"}
                </h1>
                <div className={styles.topBarActions}>
                    {saveMsg && <span className={styles.saveMsg}>{saveMsg}</span>}
                    <button
                        className={styles.saveBtn}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <FiSave />
                        <span>{saving ? "Menyimpan..." : "Simpan Artikel"}</span>
                    </button>
                </div>
            </div>

            
            <div className={styles.editorBody}>
                
                <div className={styles.contentCol}>
                    <div className={styles.card}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Judul Artikel</label>
                            <input
                                className={styles.titleInput}
                                placeholder="Tulis judul artikel yang menarik di sini..."
                                value={formData.title}
                                onChange={handleTitleChange}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Slug (URL)</label>
                            <div className={styles.slugWrapper}>
                                <span className={styles.slugPrefix}>/blog/</span>
                                <input
                                    className={styles.slugInput}
                                    value={formData.slug}
                                    onChange={e =>
                                        setFormData(prev => ({ ...prev, slug: e.target.value }))
                                    }
                                    placeholder="judul-artikel-anda"
                                />
                            </div>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Kutipan (Excerpt)</label>
                            <textarea
                                className={styles.textArea}
                                rows={2}
                                value={formData.excerpt}
                                onChange={e =>
                                    setFormData(prev => ({ ...prev, excerpt: e.target.value }))
                                }
                                placeholder="Ringkasan singkat artikel yang akan tampil di halaman blog..."
                            />
                        </div>
                    </div>

                    
                    <div className={styles.card}>
                        <label className={styles.label}>Konten Artikel</label>
                        <div className={styles.quillWrapper}>
                            <QuillEditor
                                value={formData.content}
                                onChange={v =>
                                    setFormData(prev => ({ ...prev, content: v }))
                                }
                                placeholder="Mulai tulis konten artikel Anda di sini..."
                            />
                        </div>
                    </div>
                </div>

                
                <div className={styles.sidebarCol}>
                    
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}><FiGlobe /> Publikasi</h3>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Cover Image</label>
                            
                            {formData.image && (
                                <div style={{
                                    position: "relative", width: "100%", aspectRatio: "16/9",
                                    borderRadius: "12px", overflow: "hidden", marginBottom: "12px",
                                    background: "#f0f0f0", border: "1px solid #e0e0e0"
                                }}>
                                    <img
                                        src={formData.image}
                                        alt="Cover preview"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </div>
                            )}
                            
                            <input
                                type="file"
                                accept="image/*"
                                id="blogCoverUpload"
                                style={{ display: "none" }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const fd = new FormData();
                                    fd.append("file", file);
                                    try {
                                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                                        const data = await res.json();
                                        if (data.url) {
                                            setFormData(prev => ({ ...prev, image: data.url }));
                                        }
                                    } catch (err) {
                                        console.error("Upload failed", err);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className={styles.input}
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", fontWeight: 600, color: "#101312" }}
                                onClick={() => document.getElementById("blogCoverUpload")?.click()}
                            >
                                <FiImage style={{ color: "#876DFF", fontSize: "1.2rem" }} />
                                {formData.image ? "Ganti Gambar Cover" : "Upload Gambar Cover"}
                            </button>
                            
                            <input
                                className={styles.input}
                                value={formData.image}
                                onChange={e =>
                                    setFormData(prev => ({ ...prev, image: e.target.value }))
                                }
                                placeholder="Atau paste URL gambar: /images/blog-cover.png"
                                style={{ marginTop: "8px", fontSize: "0.85rem" }}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Penulis</label>
                            <input
                                className={styles.input}
                                value={formData.author}
                                onChange={e =>
                                    setFormData(prev => ({ ...prev, author: e.target.value }))
                                }
                                placeholder="Nama penulis"
                            />
                        </div>
                        <div className={styles.publishToggle}>
                            <span className={styles.label}>Status:</span>
                            <button
                                className={`${styles.statusBtn} ${formData.isPublished ? styles.published : styles.draft
                                    }`}
                                onClick={() =>
                                    setFormData(prev => ({
                                        ...prev,
                                        isPublished: !prev.isPublished,
                                    }))
                                }
                            >
                                {formData.isPublished ? (
                                    <>
                                        <FiEye /> Terpublikasi
                                    </>
                                ) : (
                                    <>
                                        <FiEyeOff /> Draft
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}><FiSearch /> SEO Settings</h3>

                        
                        <div className={styles.snippetPreview}>
                            <p className={styles.snippetLabel}>Pratinjau Google Search</p>
                            <div className={styles.snippetBox}>
                                <p className={styles.snippetUrl}>
                                    otomobi.com › blog › {formData.slug || "judul-artikel"}
                                </p>
                                <p className={styles.snippetTitle}>
                                    {formData.metaTitle ||
                                        formData.title ||
                                        "Meta Title Artikel Anda"}
                                </p>
                                <p className={styles.snippetDesc}>
                                    {formData.metaDescription ||
                                        formData.excerpt ||
                                        "Meta description artikel akan tampil di sini. Pastikan Anda mengisi deskripsi yang menarik."}
                                </p>
                            </div>
                        </div>

                        
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Focus Keywords</label>
                            <input
                                className={styles.input}
                                value={formData.keywords}
                                onChange={e =>
                                    setFormData(prev => ({ ...prev, keywords: e.target.value }))
                                }
                                placeholder="perawatan mobil, tips otomotif, ..."
                            />
                            <span className={styles.hint}>
                                Pisahkan kata kunci dengan koma
                            </span>
                        </div>

                        
                        <div className={styles.fieldGroup}>
                            <div className={styles.labelRow}>
                                <label className={styles.label}>Meta Title</label>
                                <span
                                    className={styles.charCount}
                                    style={{ color: statusColor(metaTitleStatus) }}
                                >
                                    {metaTitleLen}/60
                                </span>
                            </div>
                            <input
                                className={styles.input}
                                value={formData.metaTitle}
                                onChange={e =>
                                    setFormData(prev => ({
                                        ...prev,
                                        metaTitle: e.target.value,
                                    }))
                                }
                                placeholder="Judul SEO (max 60 karakter)"
                                maxLength={70}
                            />
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${Math.min((metaTitleLen / 60) * 100, 100)}%`,
                                        background: statusColor(metaTitleStatus),
                                    }}
                                />
                            </div>
                            <span className={styles.hint}>
                                {metaTitleStatus === "good"
                                    ? "✅ Panjang optimal!"
                                    : metaTitleStatus === "short"
                                        ? "⚠️ Terlalu pendek, tambahkan kata kunci"
                                        : metaTitleStatus === "long"
                                            ? "❌ Terlalu panjang, persingkat"
                                            : "Kosongkan untuk menggunakan judul artikel"}
                            </span>
                        </div>

                        
                        <div className={styles.fieldGroup}>
                            <div className={styles.labelRow}>
                                <label className={styles.label}>Meta Description</label>
                                <span
                                    className={styles.charCount}
                                    style={{ color: statusColor(metaDescStatus) }}
                                >
                                    {metaDescLen}/160
                                </span>
                            </div>
                            <textarea
                                className={styles.textArea}
                                rows={3}
                                value={formData.metaDescription}
                                onChange={e =>
                                    setFormData(prev => ({
                                        ...prev,
                                        metaDescription: e.target.value,
                                    }))
                                }
                                placeholder="Deskripsi singkat yang akan tampil di hasil pencarian (max 160 karakter)"
                                maxLength={180}
                            />
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${Math.min((metaDescLen / 160) * 100, 100)}%`,
                                        background: statusColor(metaDescStatus),
                                    }}
                                />
                            </div>
                            <span className={styles.hint}>
                                {metaDescStatus === "good"
                                    ? "✅ Panjang optimal!"
                                    : metaDescStatus === "short"
                                        ? "⚠️ Terlalu pendek, tambahkan deskripsi"
                                        : metaDescStatus === "long"
                                            ? "❌ Terlalu panjang, persingkat"
                                            : "Kosongkan untuk menggunakan excerpt artikel"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
