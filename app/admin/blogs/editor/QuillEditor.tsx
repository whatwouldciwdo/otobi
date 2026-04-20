"use client";

import { useEffect, useRef } from "react";

interface QuillEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export default function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const lastEmittedValue = useRef(value);

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
                                const input = document.createElement("input");
                                input.setAttribute("type", "file");
                                input.setAttribute("accept", "image/*");
                                input.click();

                                input.onchange = async () => {
                                    const file = input.files?.[0];
                                    if (!file) return;

                                    const fd = new FormData();
                                    fd.append("file", file);

                                    try {
                                        const res = await fetch("/api/upload", {
                                            method: "POST",
                                            body: fd,
                                        });
                                        const data = await res.json();
                                        if (data.url) {
                                            const range = quill.getSelection(true);
                                            quill.insertEmbed(
                                                range.index,
                                                "image",
                                                data.url
                                            );
                                            quill.setSelection(range.index + 1, 0);
                                        }
                                    } catch (err) {
                                        console.error("Image upload failed:", err);
                                        alert("Gagal upload gambar. Coba lagi.");
                                    }
                                };
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

    return <div ref={containerRef} />;
}

