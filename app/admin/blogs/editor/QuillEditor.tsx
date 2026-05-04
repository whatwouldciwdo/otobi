"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BlogEditor.module.css";

interface QuillEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

interface ImageModalState {
    open: boolean;
    file: File | null;
    previewUrl: string;
    altText: string;
    imageSize: string;
    uploading: boolean;
    error: string;
}

export default function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const lastEmittedValue = useRef(value);
    const pendingRangeRef = useRef<any>(null);

    const [modal, setModal] = useState<ImageModalState>({
        open: false,
        file: null,
        previewUrl: "",
        altText: "",
        imageSize: "100%",
        uploading: false,
        error: "",
    });

    // Close modal and reset state
    const closeModal = () => {
        if (modal.previewUrl) URL.revokeObjectURL(modal.previewUrl);
        setModal({ open: false, file: null, previewUrl: "", altText: "", imageSize: "100%", uploading: false, error: "" });
    };

    // Handle file selection inside modal
    const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (modal.previewUrl) URL.revokeObjectURL(modal.previewUrl);
        const previewUrl = URL.createObjectURL(file);
        setModal(prev => ({ ...prev, file, previewUrl, error: "" }));
    };

    // Confirm: upload then insert with alt
    const handleInsertImage = async () => {
        if (!modal.file) {
            setModal(prev => ({ ...prev, error: "Pilih file gambar terlebih dahulu." }));
            return;
        }
        setModal(prev => ({ ...prev, uploading: true, error: "" }));

        const fd = new FormData();
        fd.append("file", modal.file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (!data.url) throw new Error("URL tidak ditemukan.");

            const quill = quillRef.current;
            if (quill) {
                const range = pendingRangeRef.current ?? quill.getSelection(true);
                const index = range?.index ?? 0;

                // Insert the image embed
                quill.insertEmbed(index, "image", data.url);

                // Patch the alt attribute and width on the inserted <img>
                const imgs = quill.root.querySelectorAll("img");
                const imgAtIndex = imgs[index] ?? imgs[imgs.length - 1];
                if (imgAtIndex) {
                    if (modal.altText.trim()) imgAtIndex.setAttribute("alt", modal.altText.trim());
                    if (modal.imageSize !== "100%") {
                        imgAtIndex.style.width = modal.imageSize;
                        imgAtIndex.style.maxWidth = "100%";
                    }
                }

                quill.setSelection(index + 1, 0);

                // Emit updated HTML (which now has the alt)
                const html = quill.root.innerHTML;
                lastEmittedValue.current = html;
                onChangeRef.current(html);
            }

            closeModal();
        } catch (err) {
            console.error("Image upload failed:", err);
            setModal(prev => ({ ...prev, uploading: false, error: "Gagal upload gambar. Coba lagi." }));
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!containerRef.current) return;

        import("quill").then(({ default: Quill }) => {
            if (quillRef.current) return;

            const quill = new Quill(containerRef.current!, {
                theme: "snow",
                placeholder: placeholder ?? "Tulis konten artikel di sini...",
                modules: {
                    toolbar: {
                        container: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            ["blockquote", "code-block"],
                            ["link", "image"],
                            [{ align: [] }],
                            [{ color: [] }, { background: [] }],
                            ["clean"],
                        ],
                        handlers: {
                            image: function () {
                                // Save current cursor position
                                pendingRangeRef.current = quill.getSelection(true);
                                // Open our custom modal instead of file picker
                                setModal(prev => ({ ...prev, open: true }));
                            },
                        },
                    },
                },
            });

            quill.on("text-change", () => {
                const html = quill.root.innerHTML;
                lastEmittedValue.current = html;
                onChangeRef.current(html);
            });

            if (value) {
                quill.root.innerHTML = value;
            }

            quillRef.current = quill;
        });

        return () => {
            if (quillRef.current) {
                quillRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (
            quillRef.current &&
            value !== lastEmittedValue.current
        ) {
            quillRef.current.root.innerHTML = value;
            lastEmittedValue.current = value;
        }
    }, [value]);

    return (
        <>
            <div ref={containerRef} />

            {/* Alt Text Modal */}
            {modal.open && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className={styles.modalBox}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Sisipkan Gambar</h3>
                            <button className={styles.modalClose} onClick={closeModal} aria-label="Tutup modal">×</button>
                        </div>

                        <div className={styles.modalBody}>
                            {/* File picker area */}
                            <label className={styles.fileDropZone} htmlFor="quillImageFile">
                                {modal.previewUrl ? (
                                    <img
                                        src={modal.previewUrl}
                                        alt="Preview"
                                        className={styles.filePreview}
                                    />
                                ) : (
                                    <div className={styles.fileDropPlaceholder}>
                                        <span className={styles.fileDropIcon}>🖼️</span>
                                        <span className={styles.fileDropText}>Klik untuk memilih gambar</span>
                                        <span className={styles.fileDropHint}>PNG, JPG, WEBP — maks. 5 MB</span>
                                    </div>
                                )}
                                <input
                                    id="quillImageFile"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleModalFileChange}
                                />
                            </label>

                            {/* Alt text input */}
                            <div className={styles.modalField}>
                                <label className={styles.modalLabel} htmlFor="quillAltText">
                                    Alt Text (Teks Alternatif)
                                </label>
                                <input
                                    id="quillAltText"
                                    className={styles.modalInput}
                                    type="text"
                                    placeholder="Deskripsikan gambar ini untuk SEO & aksesibilitas..."
                                    value={modal.altText}
                                    onChange={e => setModal(prev => ({ ...prev, altText: e.target.value }))}
                                />
                                <span className={styles.modalHint}>
                                    Alt text membantu mesin pencari & pengguna dengan keterbatasan visual memahami gambar.
                                </span>
                            </div>

                            {/* Image size selector */}
                            <div className={styles.modalField}>
                                <label className={styles.modalLabel}>Ukuran Gambar</label>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {[
                                        { label: "Full", value: "100%" },
                                        { label: "Besar (75%)", value: "75%" },
                                        { label: "Sedang (50%)", value: "50%" },
                                        { label: "Kecil (25%)", value: "25%" },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setModal(prev => ({ ...prev, imageSize: opt.value }))}
                                            style={{
                                                padding: "7px 14px",
                                                borderRadius: "8px",
                                                border: modal.imageSize === opt.value
                                                    ? "2px solid #876DFF"
                                                    : "1px solid rgba(0,0,0,0.1)",
                                                background: modal.imageSize === opt.value ? "#f3f0ff" : "#ffffff",
                                                color: modal.imageSize === opt.value ? "#876DFF" : "#5c626e",
                                                fontWeight: modal.imageSize === opt.value ? 700 : 500,
                                                fontSize: "0.82rem",
                                                cursor: "pointer",
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <span className={styles.modalHint}>
                                    Ukuran gambar dalam artikel. Full = lebar penuh kolom.
                                </span>
                            </div>

                            {modal.error && (
                                <p className={styles.modalError}>{modal.error}</p>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.modalCancelBtn} onClick={closeModal} disabled={modal.uploading}>
                                Batal
                            </button>
                            <button
                                className={styles.modalConfirmBtn}
                                onClick={handleInsertImage}
                                disabled={modal.uploading || !modal.file}
                            >
                                {modal.uploading ? (
                                    <><span className={styles.spinner} />Mengupload...</>
                                ) : (
                                    "Sisipkan Gambar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
