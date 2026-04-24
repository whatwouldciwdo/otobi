"use client";

import { useEffect, useState } from "react";
import styles from "./AdminLinks.module.css";
import { FiPlus, FiEdit2, FiTrash2, FiLink, FiInstagram } from "react-icons/fi";
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
  const [iconType, setIconType] = useState("default");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIconType(link.iconType || "default");
    } else {
      setEditingLink(null);
      setTitle("");
      setUrl("");
      setIconType("default");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
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
    switch (type) {
      case "tokopedia":
        return <span style={{ color: "#42B549", fontWeight: "bold" }}>Tp</span>; // Placeholder or use SVG later
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

  if (loading) return <div className={styles.loading}>Loading links...</div>;

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
                <label>Icon Platform</label>
                <select
                  className={styles.select}
                  value={iconType}
                  onChange={(e) => setIconType(e.target.value)}
                >
                  <option value="default">Default Link Icon</option>
                  <option value="tokopedia">Tokopedia</option>
                  <option value="shopee">Shopee</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
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
