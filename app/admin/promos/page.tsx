"use client";

import { useEffect, useRef, useState } from "react";
import { useShop } from "../../context/ShopContext";
import styles from "./AdminPromos.module.css";
import Image from "next/image";
import {
  FiEdit2, FiPercent, FiPlus, FiSend, FiTrash2, FiZap,
  FiArrowLeft, FiArrowRight, FiCheckCircle, FiImage, FiType, FiTag
} from "react-icons/fi";

type Promo = {
  id: string;
  title: string;
  description: string;
  discountPct: number;
  image: string;
  isActive: boolean | number;
};

type WizardData = {
  title: string;
  description: string;
  discountPct: string;
  image: string;
  isActive: boolean;
};

const EMPTY_WIZARD: WizardData = {
  title: "",
  description: "",
  discountPct: "0",
  image: "",
  isActive: true,
};

const EMPTY_FORM = { ...EMPTY_WIZARD };

const WIZARD_STEPS = [
  { label: "Details", icon: FiType },
  { label: "Banner", icon: FiImage },
];

export default function AdminPromos() {
  const { user } = useShop();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"catalog" | "wizard">("catalog");
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({ ...EMPTY_WIZARD });
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wizardFileRef = useRef<HTMLInputElement>(null);

  const fetchPromos = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promos?userId=${user.id}`);
      const data = await res.json();
      if (data.promos) setPromos(data.promos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, [user]);

  
  const startWizard = () => {
    setMode("wizard");
    setWizardStep(0);
    setWizardData({ ...EMPTY_WIZARD });
    setUploadError("");
    setLastCreatedId(null);
  };

  const canGoNext = () => {
    if (wizardStep === 0) return Boolean(wizardData.title.trim());
    if (wizardStep === 1) return true; 
    return true;
  };

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload gagal");
    return data.url as string;
  };

  const handleWizardImagePick = async (file?: File) => {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setWizardData((prev) => ({ ...prev, image: url }));
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const submitWizard = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...wizardData }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastCreatedId(data.id);
        await fetchPromos();
        setWizardStep(2); 
      }
    } finally {
      setSaving(false);
    }
  };

  
  const startCreate = () => {
    setIsCreatingNew(true);
    setEditingPromo(null);
    setFormData({ ...EMPTY_FORM });
  };

  const startEdit = (promo: Promo) => {
    setIsCreatingNew(false);
    setEditingPromo(promo);
    setFormData({
      title: promo.title,
      description: promo.description || "",
      discountPct: promo.discountPct.toString(),
      image: promo.image || "",
      isActive: Boolean(promo.isActive),
    });
  };

  const handleEditImagePick = async (file?: File) => {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const method = editingPromo ? "PUT" : "POST";
      const body = { userId: user.id, ...(editingPromo && { id: editingPromo.id }), ...formData };
      const res = await fetch("/api/admin/promos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchPromos();
        if (editingPromo) {
          setEditingPromo({ ...editingPromo, ...formData, discountPct: Number(formData.discountPct) });
        } else {
          startCreate();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Yakin ingin menghapus promo ini?")) return;
    const res = await fetch(`/api/admin/promos?userId=${user.id}&id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchPromos();
      if (editingPromo?.id === id) startCreate();
    }
  };

  const activePromos = promos.filter((promo) => Boolean(promo.isActive));
  const highestDiscount = promos.reduce((best, promo) => Math.max(best, promo.discountPct), 0);
  const createdPromo = promos.find((p) => p.id === lastCreatedId) || null;

  if (loading) return <div className={styles.loading}>Menyiapkan pusat campaign promo...</div>;

  
  if (mode === "wizard") {
    return (
      <div className={styles.pageContainer}>
        <section className={styles.wizardShell}>
          
          <div className={styles.wizardHeader}>
            <button className={styles.backLink} onClick={() => setMode("catalog")}>
              <FiArrowLeft /> Kembali ke campaign
            </button>
          </div>

          
          {wizardStep < 2 && (
            <div className={styles.stepper}>
              {WIZARD_STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = wizardStep > i;
                const active = wizardStep === i;
                return (
                  <div key={step.label} className={styles.stepItem}>
                    <div className={`${styles.stepIcon} ${done ? styles.stepDone : ""} ${active ? styles.stepActive : ""}`}>
                      {done ? <FiCheckCircle /> : <Icon />}
                    </div>
                    <strong>{step.label}</strong>
                    {i < WIZARD_STEPS.length - 1 && <span className={styles.stepLine} />}
                  </div>
                );
              })}
            </div>
          )}

          
          {wizardStep === 0 && (
            <div className={styles.stepPanel}>
              <h2>Isi detail campaign promo</h2>
              <div className={styles.stepGrid}>
                <div className={styles.mainForm}>
                  <label>Judul Campaign <span className={styles.required}>*</span></label>
                  <input
                    value={wizardData.title}
                    onChange={(e) => setWizardData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Promo Akhir Pekan, Flash Sale, dll."
                  />
                  <label>Deskripsi</label>
                  <textarea
                    rows={5}
                    value={wizardData.description}
                    onChange={(e) => setWizardData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Jelaskan detail campaign, syarat, dan ketentuan promo."
                  />
                </div>
                <div className={styles.sideForm}>
                  <label>Persentase Diskon (%)</label>
                  <input
                    type="number" min="0" max="100"
                    value={wizardData.discountPct}
                    onChange={(e) => setWizardData((p) => ({ ...p, discountPct: e.target.value }))}
                    placeholder="20"
                  />
                  <div className={styles.toggleRow}>
                    <div>
                      <strong>Tayang Sekarang</strong>
                      <p>Aktifkan jika promo langsung publik.</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={wizardData.isActive}
                        onChange={(e) => setWizardData((p) => ({ ...p, isActive: e.target.checked }))}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                  <div className={styles.previewCard}>
                    <FiTag className={styles.previewCardIcon} />
                    <div>
                      <strong>{wizardData.title || "Judul Campaign"}</strong>
                      <p>{wizardData.discountPct}% OFF</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          
          {wizardStep === 1 && (
            <div className={styles.stepPanel}>
              <h2>Upload banner promo (opsional)</h2>
              <div className={styles.bannerUploadArea} onClick={() => wizardFileRef.current?.click()}>
                {wizardData.image ? (
                  <Image src={wizardData.image} alt="Banner preview" fill className={styles.bannerPreviewImg} />
                ) : (
                  <>
                    <FiImage className={styles.bannerUploadIcon} />
                    <strong>Klik untuk upload banner</strong>
                    <span>JPG, PNG, WEBP · Max 25MB</span>
                  </>
                )}
                {wizardData.image && (
                  <button className={styles.changeImageBtn} onClick={(e) => { e.stopPropagation(); wizardFileRef.current?.click(); }}>
                    Ganti Gambar
                  </button>
                )}
              </div>
              {uploadError && <p className={styles.errorText}>{uploadError}</p>}
              {uploading && <p className={styles.helperText}>Mengupload banner...</p>}
              <input
                ref={wizardFileRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={(e) => handleWizardImagePick(e.target.files?.[0])}
              />
            </div>
          )}

          
          {wizardStep === 2 && (
            <div className={styles.successPanel}>
              <div className={styles.successIcon}><FiCheckCircle /></div>
              <h2>Campaign berhasil dibuat!</h2>
              <p>Promo <strong>{wizardData.title}</strong> telah masuk ke daftar campaign.</p>
              <div className={styles.successActions}>
                <button className={styles.addBtn} onClick={() => { setMode("catalog"); if (createdPromo) startEdit(createdPromo); }}>
                  Lihat & Edit Campaign <FiArrowRight />
                </button>
                <button className={styles.secondaryBtn} onClick={() => setMode("catalog")}>
                  Kembali ke Daftar
                </button>
              </div>
            </div>
          )}

          
          {wizardStep < 2 && (
            <div className={styles.stepFooter}>
              <button className={styles.secondaryBtn} onClick={() => setWizardStep((p) => Math.max(0, p - 1))} disabled={wizardStep === 0}>
                <FiArrowLeft /> Back
              </button>
              {wizardStep < WIZARD_STEPS.length - 1 ? (
                <button className={styles.addBtn} onClick={() => setWizardStep((p) => p + 1)} disabled={!canGoNext()}>
                  Next <FiArrowRight />
                </button>
              ) : (
                <button className={styles.addBtn} onClick={submitWizard} disabled={saving}>
                  {saving ? "Menyimpan..." : "Publish Campaign"}
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    );
  }

  
  return (
    <div className={styles.pageContainer}>
      <section className={styles.hero}>
        <div className={styles.bgGlow}></div>
        <div>
          <span className={styles.heroBadge}>Campaign hub</span>
          <h1>Kelola promo & campaign produk Otobi.</h1>
          <p>
            Buat campaign baru dengan flow wizard bertahap, atau pilih campaign dari daftar untuk diedit langsung.
          </p>
        </div>
        <button className={styles.addBtn} onClick={startWizard}>
          <FiPlus /> Promo Baru
        </button>
      </section>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <FiSend />
          <div>
            <strong>{promos.length}</strong>
            <span>Total campaign</span>
          </div>
        </article>
        <article className={styles.summaryCard}>
          <FiZap />
          <div>
            <strong>{activePromos.length}</strong>
            <span>Promo aktif</span>
          </div>
        </article>
        <article className={styles.summaryCard}>
          <FiPercent />
          <div>
            <strong>{highestDiscount}%</strong>
            <span>Diskon tertinggi</span>
          </div>
        </article>
      </section>

      <section className={styles.workspace}>
        
        <div className={styles.campaignPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelEyebrow}>Daftar campaign</span>
              <h2>Campaign promo</h2>
            </div>
            <button className={styles.secondaryBtn} onClick={startWizard}>
              <FiPlus /> Buat
            </button>
          </div>

          <div className={styles.campaignList}>
            {promos.length === 0 && (
              <div className={styles.emptyState}>
                <FiSend />
                <strong>Belum ada campaign promo.</strong>
                <p>Mulai dari promo diskon musiman, bundling, atau campaign peluncuran produk baru.</p>
              </div>
            )}

            {promos.map((promo) => {
              const isActiveRow = editingPromo?.id === promo.id && !isCreatingNew;
              return (
                <button
                  key={promo.id}
                  type="button"
                  className={`${styles.campaignRow} ${isActiveRow ? styles.campaignRowActive : ""}`}
                  onClick={() => startEdit(promo)}
                >
                  <div className={styles.rowThumb}>
                    {promo.image ? (
                      <Image src={promo.image} alt={promo.title} fill className={styles.rowThumbImg} />
                    ) : (
                      <FiSend />
                    )}
                  </div>
                  <div className={styles.rowMeta}>
                    <div className={styles.rowMetaTop}>
                      <strong>{promo.title}</strong>
                      <span>{promo.discountPct}%</span>
                    </div>
                    <p>{Boolean(promo.isActive) ? "Campaign aktif" : "Campaign nonaktif"}</p>
                    <small>{promo.description || "Tambahkan pesan campaign agar lebih kuat."}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        
        <div className={styles.editorPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelEyebrow}>
                {isCreatingNew ? "Promo form" : "Promo editor"}
              </span>
              <h2>{isCreatingNew ? "Buat campaign promo" : "Edit campaign promo"}</h2>
            </div>
            {!isCreatingNew && editingPromo ? (
              <div className={styles.editorActions}>
                <button className={styles.ghostBtn} onClick={() => startEdit(editingPromo)}>
                  <FiEdit2 /> Aktif
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(editingPromo.id)}>
                  <FiTrash2 /> Hapus
                </button>
              </div>
            ) : null}
          </div>

          <div className={styles.editorIntro}>
            <div>
              <strong>{isCreatingNew ? "Mode campaign baru" : formData.title || "Campaign terpilih"}</strong>
              <p>
                {isCreatingNew
                  ? "Klik + Promo Baru untuk membuat campaign via wizard, atau isi form di bawah."
                  : "Atur diskon, banner, dan status tayang campaign yang dipilih."}
              </p>
            </div>
            {!isCreatingNew && (
              <button className={styles.ghostBtn} onClick={startCreate}>
                <FiPlus /> Campaign baru
              </button>
            )}
          </div>

          
          <div className={styles.previewBanner} onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
            {formData.image ? (
              <Image src={formData.image} alt="Preview promo" fill className={styles.previewBannerImg} />
            ) : (
              <div className={styles.previewPlaceholder}>
                <FiImage style={{ fontSize: 28, color: '#876DFF', opacity: 0.5 }} />
                <span>Klik untuk upload banner</span>
              </div>
            )}
            <span className={`${styles.statusBadge} ${formData.isActive ? styles.active : styles.inactive}`}>
              {formData.isActive ? "Active" : "Paused"}
            </span>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className={styles.hiddenInput} onChange={(e) => handleEditImagePick(e.target.files?.[0])} />
          {uploadError && <p className={styles.errorText}>{uploadError}</p>}

          <div className={styles.formGroup}>
            <label>Judul campaign</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Promo Akhir Pekan"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Diskon (%)</label>
            <input
              type="number" min="0" max="100"
              value={formData.discountPct}
              onChange={(e) => setFormData({ ...formData, discountPct: e.target.value })}
              placeholder="20"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Deskripsi campaign</label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Diskon khusus produk detailing premium selama akhir pekan."
            />
          </div>

          <div className={styles.toggleRow}>
            <div>
              <strong>Tayang sekarang</strong>
              <p>Aktifkan jika promo sudah siap dilihat customer.</p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={startCreate}>
              Reset form
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : editingPromo ? "Update promo" : "Simpan promo"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
