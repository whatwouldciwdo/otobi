"use client";

import { useEffect, useRef, useState } from "react";
import { useShop } from "../../context/ShopContext";
import styles from "./AdminPromos.module.css";
import Image from "next/image";
import {
  FiEdit2, FiPercent, FiPlus, FiSend, FiTrash2, FiZap,
  FiArrowLeft, FiArrowRight, FiCheckCircle, FiImage, FiType, FiTag, FiTarget, FiPackage
} from "react-icons/fi";

const CATEGORIES = [
  "Lap Microfiber", "Sarung Tangan Cuci Kendaraan", "Kebutuhan Poles",
  "Cuci Kendaraan", "Perawatan Body", "Perawatan Interior", "Perawatan Kaca",
  "Perawatan Ban dan Velg", "Restorasi Perawatan Trim", "Perawatan Sepeda",
  "Vacuum Cleaner", "Sikat dan Kuas Detailing", "Coating Kendaraan",
  "Sarung Jok Stir", "Parfum Mobil", "Pengusir Tikus",
];

type Promo = {
  id: string;
  title: string;
  description: string;
  discountPct: number;
  image: string;
  isActive: boolean | number;
  code?: string;
  type?: string;
  categories?: string;
  productIds?: string;
  minOrder?: number;
};

type DBProduct = { id: string; title: string; category: string | null; image: string };

type WizardData = {
  title: string;
  description: string;
  discountPct: string;
  image: string;
  isActive: boolean;
  code: string;
  type: "ALL" | "CATEGORY" | "PRODUCTS";
  selectedCategories: string[];
  selectedProductIds: string[];
  minOrder: string;
};

const EMPTY_WIZARD: WizardData = {
  title: "", description: "", discountPct: "0", image: "", isActive: true,
  code: "", type: "ALL", selectedCategories: [], selectedProductIds: [], minOrder: "0",
};

const EMPTY_FORM = {
  title: "", description: "", discountPct: "0", image: "", isActive: true,
  code: "", type: "ALL" as "ALL" | "CATEGORY" | "PRODUCTS",
  selectedCategories: [] as string[], selectedProductIds: [] as string[], minOrder: "0",
};

const WIZARD_STEPS = [
  { label: "Details", icon: FiType },
  { label: "Target", icon: FiTarget },
  { label: "Banner", icon: FiImage },
];

export default function AdminPromos() {
  const { user } = useShop();
  const [promos, setPromos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"catalog" | "wizard">("catalog");
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({ ...EMPTY_WIZARD });
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
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

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products ?? []);
  };

  useEffect(() => {
    fetchPromos();
    fetchProducts();
  }, [user]);

  const startWizard = () => {
    setMode("wizard");
    setWizardStep(0);
    setWizardData({ ...EMPTY_WIZARD });
    setUploadError("");
    setLastCreatedId(null);
    setProductSearch("");
  };

  const canGoNext = () => {
    if (wizardStep === 0) return Boolean(wizardData.title.trim());
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
        body: JSON.stringify({
          userId: user.id,
          title: wizardData.title,
          description: wizardData.description,
          discountPct: wizardData.discountPct,
          image: wizardData.image,
          isActive: wizardData.isActive,
          code: wizardData.code || null,
          type: wizardData.type,
          categories: wizardData.selectedCategories,
          productIds: wizardData.selectedProductIds,
          minOrder: wizardData.minOrder,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastCreatedId(data.id);
        await fetchPromos();
        setWizardStep(3);
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
    let parsedCats: string[] = [];
    let parsedPids: string[] = [];
    try { parsedCats = promo.categories ? JSON.parse(promo.categories) : []; } catch {}
    try { parsedPids = promo.productIds ? JSON.parse(promo.productIds) : []; } catch {}
    setFormData({
      title: promo.title,
      description: promo.description || "",
      discountPct: promo.discountPct.toString(),
      image: promo.image || "",
      isActive: Boolean(promo.isActive),
      code: promo.code || "",
      type: (promo.type as "ALL" | "CATEGORY" | "PRODUCTS") || "ALL",
      selectedCategories: parsedCats,
      selectedProductIds: parsedPids,
      minOrder: (promo.minOrder ?? 0).toString(),
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
      const body = {
        userId: user.id,
        ...(editingPromo && { id: editingPromo.id }),
        title: formData.title,
        description: formData.description,
        discountPct: formData.discountPct,
        image: formData.image,
        isActive: formData.isActive,
        code: formData.code || null,
        type: formData.type,
        categories: formData.selectedCategories,
        productIds: formData.selectedProductIds,
        minOrder: formData.minOrder,
      };
      const res = await fetch("/api/admin/promos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
        if (res.ok) {
        await fetchPromos();
        if (editingPromo) {
          const updated = {
            ...editingPromo,
            ...formData,
            discountPct: Number(formData.discountPct),
            minOrder: Number(formData.minOrder),
          };
          setEditingPromo(updated);
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

  const toggleCategory = (cat: string, isWizard: boolean) => {
    if (isWizard) {
      setWizardData((prev) => ({
        ...prev,
        selectedCategories: prev.selectedCategories.includes(cat)
          ? prev.selectedCategories.filter((c) => c !== cat)
          : [...prev.selectedCategories, cat],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedCategories: prev.selectedCategories.includes(cat)
          ? prev.selectedCategories.filter((c) => c !== cat)
          : [...prev.selectedCategories, cat],
      }));
    }
  };

  const toggleProduct = (pid: string, isWizard: boolean) => {
    if (isWizard) {
      setWizardData((prev) => ({
        ...prev,
        selectedProductIds: prev.selectedProductIds.includes(pid)
          ? prev.selectedProductIds.filter((p) => p !== pid)
          : [...prev.selectedProductIds, pid],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedProductIds: prev.selectedProductIds.includes(pid)
          ? prev.selectedProductIds.filter((p) => p !== pid)
          : [...prev.selectedProductIds, pid],
      }));
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const activePromos = promos.filter((promo) => Boolean(promo.isActive));
  const highestDiscount = promos.reduce((best, promo) => Math.max(best, promo.discountPct), 0);
  const createdPromo = promos.find((p) => p.id === lastCreatedId) || null;

  if (loading) return <div className={styles.loading}>Menyiapkan pusat campaign promo...</div>;

  /* ============================================================
     WIZARD
   ============================================================ */
  if (mode === "wizard") {
    return (
      <div className={styles.pageContainer}>
        <section className={styles.wizardShell}>
          <div className={styles.wizardHeader}>
            <button className={styles.backLink} onClick={() => setMode("catalog")}>
              <FiArrowLeft /> Kembali ke campaign
            </button>
          </div>

          {wizardStep < 3 && (
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

          {/* Step 0: Details */}
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
                    rows={4}
                    value={wizardData.description}
                    onChange={(e) => setWizardData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Jelaskan detail campaign, syarat, dan ketentuan promo."
                  />
                  <label>Kode Voucher <span className={styles.optional}>(opsional)</span></label>
                  <input
                    value={wizardData.code}
                    onChange={(e) => setWizardData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="misal: OTOBI20, FLASHSALE, dll."
                    style={{ textTransform: "uppercase" }}
                  />
                  <p className={styles.helperText}>Kode bisa digunakan customer saat checkout untuk mendapatkan diskon.</p>
                </div>
                <div className={styles.sideForm}>
                  <label>Persentase Diskon (%)</label>
                  <input
                    type="number" min="0" max="100"
                    value={wizardData.discountPct}
                    onChange={(e) => setWizardData((p) => ({ ...p, discountPct: e.target.value }))}
                    placeholder="20"
                  />
                  <label>Minimum Belanja (Rp)</label>
                  <input
                    type="number" min="0"
                    value={wizardData.minOrder}
                    onChange={(e) => setWizardData((p) => ({ ...p, minOrder: e.target.value }))}
                    placeholder="0 = tidak ada minimum"
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
                      <p>{wizardData.discountPct}% OFF {wizardData.code && `· ${wizardData.code}`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Target Produk */}
          {wizardStep === 1 && (
            <div className={styles.stepPanel}>
              <h2>Pilih target produk promo</h2>
              <p className={styles.stepSubtitle}>Tentukan produk mana yang mendapatkan diskon dari campaign ini.</p>

              <div className={styles.targetTypeGrid}>
                {(["ALL", "CATEGORY", "PRODUCTS"] as const).map((t) => (
                  <button
                    key={t}
                    className={`${styles.targetTypeBtn} ${wizardData.type === t ? styles.targetTypeBtnActive : ""}`}
                    onClick={() => setWizardData((p) => ({ ...p, type: t }))}
                  >
                    {t === "ALL" && <><FiPackage /><span>Semua Produk</span></>}
                    {t === "CATEGORY" && <><FiTag /><span>Per Kategori</span></>}
                    {t === "PRODUCTS" && <><FiTarget /><span>Produk Tertentu</span></>}
                  </button>
                ))}
              </div>

              {wizardData.type === "CATEGORY" && (
                <div className={styles.categoryCheckList}>
                  <p className={styles.checkListLabel}>Pilih kategori:</p>
                  <div className={styles.checkGrid}>
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className={`${styles.checkItem} ${wizardData.selectedCategories.includes(cat) ? styles.checkItemActive : ""}`}>
                        <input type="checkbox" checked={wizardData.selectedCategories.includes(cat)} onChange={() => toggleCategory(cat, true)} />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {wizardData.type === "PRODUCTS" && (
                <div className={styles.productCheckList}>
                  <input
                    className={styles.productSearch}
                    placeholder="Cari produk..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  <div className={styles.productCheckGrid}>
                    {filteredProducts.map((p) => (
                      <label key={p.id} className={`${styles.productCheckItem} ${wizardData.selectedProductIds.includes(p.id) ? styles.productCheckItemActive : ""}`}>
                        <input type="checkbox" checked={wizardData.selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id, true)} />
                        <span className={styles.productCheckName}>{p.title}</span>
                        {p.category && <span className={styles.productCheckCat}>{p.category}</span>}
                      </label>
                    ))}
                  </div>
                  <p className={styles.helperText}>{wizardData.selectedProductIds.length} produk dipilih</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Banner */}
          {wizardStep === 2 && (
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

          {/* Step 3: Success */}
          {wizardStep === 3 && (
            <div className={styles.successPanel}>
              <div className={styles.successIcon}><FiCheckCircle /></div>
              <h2>Campaign berhasil dibuat!</h2>
              <p>Promo <strong>{wizardData.title}</strong> telah masuk ke daftar campaign.</p>
              {wizardData.code && (
                <div className={styles.voucherBadge}>
                  Kode Voucher: <strong>{wizardData.code}</strong>
                </div>
              )}
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

          {wizardStep < 3 && (
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

  /* ============================================================
     CATALOG VIEW
   ============================================================ */
  return (
    <div className={styles.pageContainer}>
      {/* Render Summary & Hero only when not editing */}
      {!editingPromo && (
        <>
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
        </>
      )}

      <section className={styles.workspace}>
        {/* Editor Full Page Mode */}
        {editingPromo ? (
          <div className={styles.editorPanelFull}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelEyebrow}>Promo editor</span>
                <h2>Edit campaign promo</h2>
              </div>
              <div className={styles.editorActions}>
                <button className={styles.ghostBtn} onClick={() => setEditingPromo(null)}>
                  <FiArrowLeft /> Kembali
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(editingPromo.id)}>
                  <FiTrash2 /> Hapus
                </button>
              </div>
            </div>

            <div className={styles.editorIntro}>
              <div>
                <strong>{formData.title || "Campaign terpilih"}</strong>
                <p>Atur diskon, banner, dan status tayang campaign yang dipilih.</p>
              </div>
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
              <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Promo Akhir Pekan" />
            </div>

            <div className={styles.formGroup}>
              <label>Diskon (%)</label>
              <input type="number" min="0" max="100" value={formData.discountPct} onChange={(e) => setFormData({ ...formData, discountPct: e.target.value })} placeholder="20" />
            </div>

            <div className={styles.formGroup}>
              <label>Kode Voucher <span className={styles.optional}>(opsional)</span></label>
              <input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="misal: OTOBI20"
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Minimum Belanja (Rp)</label>
              <input type="number" min="0" value={formData.minOrder} onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })} placeholder="0" />
            </div>

            <div className={styles.formGroup}>
              <label>Target Produk</label>
              <div className={styles.targetTypeGrid}>
                {(["ALL", "CATEGORY", "PRODUCTS"] as const).map((t) => (
                  <button
                    key={t}
                    className={`${styles.targetTypeBtn} ${formData.type === t ? styles.targetTypeBtnActive : ""}`}
                    onClick={() => setFormData((p) => ({ ...p, type: t }))}
                  >
                    {t === "ALL" && "Semua Produk"}
                    {t === "CATEGORY" && "Per Kategori"}
                    {t === "PRODUCTS" && "Produk Tertentu"}
                  </button>
                ))}
              </div>

              {formData.type === "CATEGORY" && (
                <div className={styles.categoryCheckList} style={{ marginTop: 12 }}>
                  <div className={styles.checkGrid}>
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className={`${styles.checkItem} ${formData.selectedCategories.includes(cat) ? styles.checkItemActive : ""}`}>
                        <input type="checkbox" checked={formData.selectedCategories.includes(cat)} onChange={() => toggleCategory(cat, false)} />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.type === "PRODUCTS" && (
                <div className={styles.productCheckList} style={{ marginTop: 12 }}>
                  <input
                    className={styles.productSearch}
                    placeholder="Cari produk..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  <div className={styles.productCheckGrid}>
                    {filteredProducts.map((p) => (
                      <label key={p.id} className={`${styles.productCheckItem} ${formData.selectedProductIds.includes(p.id) ? styles.productCheckItemActive : ""}`}>
                        <input type="checkbox" checked={formData.selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id, false)} />
                        <span className={styles.productCheckName}>{p.title}</span>
                        {p.category && <span className={styles.productCheckCat}>{p.category}</span>}
                      </label>
                    ))}
                  </div>
                  <p className={styles.helperText}>{formData.selectedProductIds.length} produk dipilih</p>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Deskripsi campaign</label>
              <textarea
                rows={4}
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
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                <span className={styles.slider} />
              </label>
            </div>

            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={() => setEditingPromo(null)}>
                Batal
              </button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : "Update promo"}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.campaignPanelFull}>
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
                    {promo.code && <small className={styles.voucherCodeBadge}>🎟 {promo.code}</small>}
                    <small>{promo.description || "Tambahkan pesan campaign agar lebih kuat."}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        )}
      </section>
    </div>
  );
}
