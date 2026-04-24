"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "./AdminLinks.module.css";
import { FiPlus, FiEdit2, FiTrash2, FiLink, FiInstagram, FiUpload } from "react-icons/fi";
import { FaTiktok, FaWhatsapp } from "react-icons/fa";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  iconType: string;
  order: number;
  isActive: boolean;
}

export default function AdminLinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [iconType, setIconType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/admin/links");
      const data = await res.json();
      setLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (link?: LinkItem) => {
    if (link) {
      setEditingLink(link);
      setTitle(link.title);
      setUrl(link.url);
      setIconType(link.iconType || "");
    } else {
      setEditingLink(null);
      setTitle("");
      setUrl("");
      setIconType("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setIconType(data.url);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = { title, url, iconType };
      
      let res;
      if (editingLink) {
        res = await fetch("/api/admin/links", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingLink.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, order: links.length }),
        });
      }

      if (res.ok) {
        fetchLinks();
        handleCloseModal();
      } else {
        const errorData = await res.json();
        alert("Error saving link: " + errorData.error);
      }
    } catch (error) {
      console.error("Error saving link:", error);
      alert("Failed to save link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const res = await fetch(`/api/admin/links?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchLinks();
      } else {
        const errorData = await res.json();
        alert("Error deleting link: " + errorData.error);
      }
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  const renderIcon = (type: string) => {
    if (type?.startsWith("http") || type?.startsWith("/")) {
      return (
        <div style={{ width: 24, height: 24, position: "relative" }}>
          <Image src={type} alt="icon" fill style={{ objectFit: "contain" }} />
        </div>
      );
    }
    
    // Fallback for legacy icons if they exist in DB
    switch (type) {
      case "tokopedia":
        return <span style={{ color: "#42B549", fontWeight: "bold" }}>Tp</span>;
      case "shopee":
        return <span style={{ color: "#EE4D2D", fontWeight: "bold" }}>Sh</span>;
      case "instagram":
        return <FiInstagram style={{ color: "#E1306C" }} />;
      case "tiktok":
        return <FaTiktok />;
      case "whatsapp":
        return <FaWhatsapp style={{ color: "#25D366" }} />;
      default:
        return <FiLink />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Manage Links</h1>
          <p>Manage the links shown on the Linktree-style page.</p>
        </div>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          <FiPlus /> Add Link
        </button>
      </div>

      <div className={styles.linksList}>
        {links.length === 0 ? (
          <p>No links found. Add your first link!</p>
        ) : (
          links.map((link) => (
            <div key={link.id} className={styles.linkCard}>
              <div className={styles.linkInfo}>
                <div className={styles.linkTitle}>
                  {renderIcon(link.iconType)} {link.title}
                </div>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.linkUrl}>
                  {link.url}
                </a>
              </div>
              <div className={styles.linkActions}>
                <button className={styles.iconBtn} onClick={() => handleOpenModal(link)} title="Edit">
                  <FiEdit2 />
                </button>
                <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(link.id)} title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingLink ? "Edit Link" : "Add Link"}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  className={styles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Tokopedia Otobi"
                />
              </div>
              <div className={styles.formGroup}>
                <label>URL</label>
                <input
                  type="url"
                  className={styles.input}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  placeholder="https://"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Link Icon (Image)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                  {iconType && (iconType.startsWith("http") || iconType.startsWith("/")) ? (
                    <div style={{ width: 40, height: 40, position: "relative", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
                      <Image src={iconType} alt="preview" fill style={{ objectFit: "cover" }} />
                    </div>
                  ) : iconType ? (
                    <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0", borderRadius: "8px" }}>
                      {renderIcon(iconType)}
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    id="icon-upload"
                  />
                  <label htmlFor="icon-upload" className={styles.cancelBtn} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <FiUpload /> {isUploading ? "Uploading..." : iconType ? "Change Icon" : "Upload Icon"}
                  </label>
                  {iconType && (
                    <button type="button" className={styles.iconBtn} style={{ color: "#cc0000" }} onClick={() => setIconType("")} title="Remove Icon">
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting || isUploading}>
                  {isSubmitting ? "Saving..." : "Save Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
