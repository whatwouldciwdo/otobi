"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCamera,
  HiOutlineCheckBadge,
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineTrash,
} from "react-icons/hi2";
import { FiEdit2, FiImage, FiSearch, FiTrash2 } from "react-icons/fi";
import { useShop } from "../../context/ShopContext";
import styles from "./AdminProducts.module.css";

type Product = {
  id: string;
  title: string;
  description: string;
  price: string;
  weight: number;
  image: string;
  category: string;
};

type WizardData = {
  title: string;
  stock: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  price: string;
  description: string;
  categories: string[];
  photos: Array<{ url: string; preview: string }>;
};

const EMPTY_EDIT_FORM = {
  title: "",
  description: "",
  price: "",
  weight: "300",
  image: "",
  category: "",
};

const EMPTY_WIZARD: WizardData = {
  title: "",
  stock: "",
  weight: "300",
  length: "",
  width: "",
  height: "",
  price: "",
  description: "",
  categories: [],
  photos: [],
};

const CATEGORY_GROUPS = [
  { section: "Automotive", items: ["Car Wash", "Coating Kendaraan", "Perawatan Interior", "Perawatan Body", "Perawatan Kaca", "Perawatan Ban dan Velg"] },
  { section: "Detailing Tools", items: ["Lap Microfiber", "Sikat dan Kuas Detailing", "Sarung Tangan Cuci Kendaraan", "Vacuum Cleaner", "Kebutuhan Poles", "Restorasi Perawatan Trim"] },
  { section: "Lifestyle", items: ["Parfum Mobil", "Sarung Jok Stir", "Pengusir Tikus", "Perawatan Sepeda", "Aksesori Garasi", "Produk Gift Set"] },
];

const STEPS = [
  { label: "Description", icon: HiOutlinePencilSquare },
  { label: "Categories", icon: HiOutlineSparkles },
  { label: "Photos", icon: HiOutlineCamera },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

const buildPersistedDescription = (data: WizardData) =>
  [data.description.trim()]
    .filter(Boolean)
    .join("\n\n");

const UploadedImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => <img src={src} alt={alt} className={className} />;

export default function AdminProducts() {
  const { user } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"catalog" | "wizard">("catalog");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_EDIT_FORM });
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({ ...EMPTY_WIZARD });
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [wizardUploadError, setWizardUploadError] = useState("");
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wizardFileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?userId=${user.id}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        if (!selectedProduct && data.products.length > 0) activateProduct(data.products[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const activateProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      weight: String(product.weight),
      image: product.image,
      category: product.category || "",
    });
    setMode("catalog");
  };

  const startWizard = () => {
    setMode("wizard");
    setWizardStep(0);
    setWizardData({ ...EMPTY_WIZARD });
    setWizardUploadError("");
    setLastCreatedId(null);
  };

  const uploadSingleImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url as string;
  };

  const handleEditImagePick = async (file?: File) => {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const url = await uploadSingleImage(file);
      setEditForm((prev) => ({ ...prev, image: url }));
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleWizardPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const available = 10 - wizardData.photos.length;
    const selected = Array.from(files).slice(0, available);
    setWizardUploadError("");
    setUploading(true);
    try {
      const uploaded: Array<{ url: string; preview: string }> = [];
      for (const file of selected) {
        const url = await uploadSingleImage(file);
        uploaded.push({ url, preview: URL.createObjectURL(file) });
      }
      setWizardData((prev) => ({ ...prev, photos: [...prev.photos, ...uploaded] }));
    } catch (e: any) {
      setWizardUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!user || !selectedProduct) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, id: selectedProduct.id, ...editForm }),
      });
      if (res.ok) {
        await fetchProducts();
        activateProduct({ ...selectedProduct, ...editForm, weight: Number(editForm.weight) });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Yakin ingin menghapus produk ini?")) return;
    await fetch(`/api/admin/products?userId=${user.id}&id=${id}`, { method: "DELETE" });
    await fetchProducts();
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
      setEditForm({ ...EMPTY_EDIT_FORM });
    }
  };

  const toggleCategory = (category: string) => {
    setWizardData((prev) => {
      const exists = prev.categories.includes(category);
      if (exists) return { ...prev, categories: prev.categories.filter((item) => item !== category) };
      if (prev.categories.length >= 3) return prev;
      return { ...prev, categories: [...prev.categories, category] };
    });
  };

  const canGoNext = () => {
    if (wizardStep === 0) return Boolean(wizardData.title && wizardData.description && wizardData.price);
    if (wizardStep === 1) return wizardData.categories.length > 0;
    if (wizardStep === 2) return wizardData.photos.length > 0;
    return true;
  };

  const submitWizard = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: wizardData.title,
          description: buildPersistedDescription(wizardData),
          price: wizardData.price,
          weight: wizardData.weight || "300",
          image: wizardData.photos[0]?.url || "",
          category: wizardData.categories[0] || "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastCreatedId(data.id);
        await fetchProducts();
        setWizardStep(5);
      }
    } finally {
      setSaving(false);
    }
  };

  const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean))) as string[];
  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });
  const totalValue = products.reduce((sum, product) => sum + Number(product.price || 0), 0);
  const createdProduct = products.find((product) => product.id === lastCreatedId) || null;

  if (loading) return <div className={styles.loading}>Menyiapkan seller center produk...</div>;

  const renderWizardBody = () => {
    if (wizardStep === 0) {
      return (
        <div className={styles.stepPanel}>
          <h2>Fill in the basic information about your item</h2>
          <div className={styles.stepGrid}>
            <div className={styles.mainForm}>
              <label>Title</label>
              <input value={wizardData.title} onChange={(e) => setWizardData((prev) => ({ ...prev, title: e.target.value }))} placeholder="OTOBI Nano Ceramic Coating 50ml" />
              <label>Description</label>
              <textarea rows={9} value={wizardData.description} onChange={(e) => setWizardData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Jelaskan fungsi, manfaat, keunggulan, dan bahan utama produk." />
            </div>
            <div className={styles.sideForm}>
              <label>Number of units available</label>
              <input value={wizardData.stock} onChange={(e) => setWizardData((prev) => ({ ...prev, stock: e.target.value }))} placeholder="Availability" />
              <label>Weight (gram)</label>
              <input value={wizardData.weight} onChange={(e) => setWizardData((prev) => ({ ...prev, weight: e.target.value }))} placeholder="300" />
              <label>Dimensions (optional)</label>
              <div className={styles.dimensions}>
                <input value={wizardData.length} onChange={(e) => setWizardData((prev) => ({ ...prev, length: e.target.value }))} placeholder="Length" />
                <input value={wizardData.width} onChange={(e) => setWizardData((prev) => ({ ...prev, width: e.target.value }))} placeholder="Width" />
                <input value={wizardData.height} onChange={(e) => setWizardData((prev) => ({ ...prev, height: e.target.value }))} placeholder="Height" />
              </div>
              <label>Price</label>
              <input value={wizardData.price} onChange={(e) => setWizardData((prev) => ({ ...prev, price: e.target.value }))} placeholder="Product price in IDR" />
            </div>
          </div>
        </div>
      );
    }

    if (wizardStep === 1) {
      return (
        <div className={styles.stepPanel}>
          <h2>Select the category your goods belong to (max. 3)</h2>
          <div className={styles.categoryColumns}>
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.section} className={styles.categoryGroup}>
                <h3>{group.section}</h3>
                {group.items.map((item) => {
                  const selected = wizardData.categories.includes(item);
                  return (
                    <button key={item} type="button" className={`${styles.categoryItem} ${selected ? styles.categoryItemSelected : ""}`} onClick={() => toggleCategory(item)}>
                      <span className={styles.categoryCheckbox}>{selected ? <HiOutlineCheckCircle /> : ""}</span>
                      {item}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className={styles.selectedCategories}>
            <strong>Selected categories:</strong>
            <div className={styles.chips}>
              {wizardData.categories.length === 0 && <span className={styles.emptyChip}>Belum ada kategori dipilih</span>}
              {wizardData.categories.map((item) => (
                <button key={item} type="button" className={styles.chip} onClick={() => toggleCategory(item)}>
                  {item} <span>x</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (wizardStep === 2) {
      return (
        <div className={styles.stepPanel}>
          <h2>Add product photos (max 10)</h2>
          <div className={styles.photosGrid}>
            <button type="button" className={styles.photoUploadCard} onClick={() => wizardFileInputRef.current?.click()}>
              <HiOutlinePhoto />
              <strong>Upload a photo</strong>
              <span>Max size 25MB. JPG, PNG, WEBP</span>
            </button>
            {wizardData.photos.map((photo, index) => (
              <div key={`${photo.url}-${index}`} className={styles.photoCard}>
                <div className={styles.photoPreview}>
                  <UploadedImage src={photo.preview} alt={`Produk ${index + 1}`} className={styles.photoPreviewImg} />
                </div>
                <div className={styles.photoMeta}>
                  <span>product-{index + 1}.jpg</span>
                  <button type="button" className={styles.photoDelete} onClick={() => setWizardData((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))}>
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {wizardUploadError && <p className={styles.errorText}>{wizardUploadError}</p>}
          {uploading && <p className={styles.helperText}>Mengupload foto produk...</p>}
          <input ref={wizardFileInputRef} type="file" accept="image/*" multiple className={styles.hiddenInput} onChange={(e) => handleWizardPhotos(e.target.files)} />
        </div>
      );
    }

    return (
      <div className={styles.successPanel}>
        <div className={styles.successIcon}><HiOutlineCheckBadge /></div>
        <h2>Produk berhasil ditambahkan</h2>
        <p>Product baru sudah masuk ke katalog. Kamu bisa lanjut melihat detailnya atau kembali ke halaman katalog utama.</p>
        <div className={styles.successActions}>
          <button className={styles.addBtn} onClick={() => (createdProduct ? activateProduct(createdProduct) : setMode("catalog"))}>
            Lihat product <HiOutlineArrowRight />
          </button>
          <button className={styles.secondaryBtn} onClick={() => setMode("catalog")}>Kembali ke katalog</button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      {mode === "catalog" && (
        <>
          <section className={styles.hero}>
            <div className={styles.bgGlow}></div>
            <div>
              <span className={styles.heroBadge}>Catalog Center</span>
              <h1>Tambah product dengan flow seller center yang bertahap dan lebih modern.</h1>
              <p>Saat klik tambah product, admin masuk ke wizard berurutan seperti marketplace, bukan lagi popup form biasa.</p>
            </div>
            <button className={styles.addBtn} onClick={startWizard}>
              <HiOutlinePlus /> Tambah Product
            </button>
          </section>

          <section className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span>Total katalog</span>
              <strong>{products.length}</strong>
              <p>Produk aktif di etalase OTOBI</p>
            </article>
            <article className={styles.summaryCard}>
              <span>Kategori</span>
              <strong>{categories.length}</strong>
              <p>Cluster produk yang sudah dipakai</p>
            </article>
            <article className={styles.summaryCard}>
              <span>Nilai etalase</span>
              <strong>{formatCurrency(totalValue)}</strong>
              <p>Akumulasi harga katalog saat ini</p>
            </article>
          </section>
        </>
      )}

      {mode === "wizard" ? (
        <section className={styles.wizardShell}>
          <div className={styles.wizardHeader}>
            <button className={styles.backLink} onClick={() => setMode("catalog")}>
              <HiOutlineArrowLeft /> Kembali ke katalog
            </button>
          </div>

          <div className={styles.stepper}>
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = wizardStep > index;
              const isActive = wizardStep === index;
              return (
                <div key={step.label} className={styles.stepItem}>
                  <div className={`${styles.stepIcon} ${isCompleted ? styles.stepDone : ""} ${isActive ? styles.stepActive : ""}`}>
                    {isCompleted ? <HiOutlineCheckCircle /> : <Icon />}
                  </div>
                  <strong>{step.label}</strong>
                  {index < STEPS.length - 1 && <span className={styles.stepLine} />}
                </div>
              );
            })}
          </div>

          {renderWizardBody()}

          {wizardStep < 4 && (
            <div className={styles.stepFooter}>
              <button className={styles.secondaryBtn} onClick={() => setWizardStep((prev) => Math.max(0, prev - 1))} disabled={wizardStep === 0}>
                <HiOutlineArrowLeft /> Back
              </button>
              {wizardStep < 2 ? (
                <button className={styles.addBtn} onClick={() => setWizardStep((prev) => prev + 1)} disabled={!canGoNext()}>
                  Next <HiOutlineArrowRight />
                </button>
              ) : (
                <button className={styles.addBtn} onClick={submitWizard} disabled={!canGoNext() || saving}>
                  {saving ? "Menyimpan..." : "Publish Product"}
                </button>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className={styles.workspace}>
          <div className={styles.catalogPanel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelEyebrow}>Catalog list</span>
                <h2>Produk tersimpan</h2>
              </div>
              <button className={styles.secondaryBtn} onClick={startWizard}>
                <HiOutlinePlus /> Tambah
              </button>
            </div>

            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <FiSearch />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama produk atau deskripsi..." />
              </div>
              <select className={styles.filterSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">Semua kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className={styles.catalogList}>
              {filteredProducts.length === 0 && (
                <div className={styles.emptyState}>
                  <FiImage />
                  <strong>Belum ada product yang cocok.</strong>
                  <p>Tambah product baru untuk mulai mengisi katalog seller center.</p>
                </div>
              )}

              {filteredProducts.map((product) => {
                const isActive = selectedProduct?.id === product.id;
                return (
                  <button key={product.id} type="button" className={`${styles.productRow} ${isActive ? styles.productRowActive : ""}`} onClick={() => activateProduct(product)}>
                    <div className={styles.productThumb}>
                      {product.image ? <UploadedImage src={product.image} alt={product.title} className={styles.productThumbImg} /> : <FiImage />}
                    </div>
                    <div className={styles.productMeta}>
                      <div className={styles.productMetaTop}>
                        <strong>{product.title}</strong>
                        <span>{formatCurrency(Number(product.price || 0))}</span>
                      </div>
                      <p>{product.category || "Tanpa kategori"}</p>
                      <small>{product.weight} gr</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.editorPanel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelEyebrow}>Product editor</span>
                <h2>{selectedProduct ? "Edit detail produk" : "Pilih product"}</h2>
              </div>
              {selectedProduct && (
                <div className={styles.editorActions}>
                  <button className={styles.secondaryBtn} onClick={handleSaveEdit} disabled={saving}>
                    <FiEdit2 /> {saving ? "Menyimpan..." : "Update"}
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(selectedProduct.id)}>
                    <FiTrash2 /> Hapus
                  </button>
                </div>
              )}
            </div>

            {selectedProduct ? (
              <>
                <div className={styles.formGroup}>
                  <label>Gambar product</label>
                  <div className={styles.singleImageCard} onClick={() => fileInputRef.current?.click()}>
                    {editForm.image ? <UploadedImage src={editForm.image} alt="Preview" className={styles.singleImagePreview} /> : <FiImage />}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className={styles.hiddenInput} onChange={(e) => handleEditImagePick(e.target.files?.[0])} />
                  {uploadError && <p className={styles.errorText}>{uploadError}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label>Nama product</label>
                  <input value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className={styles.twoCol}>
                  <div className={styles.formGroup}>
                    <label>Harga</label>
                    <input value={editForm.price} onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Berat</label>
                    <input value={editForm.weight} onChange={(e) => setEditForm((prev) => ({ ...prev, weight: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Kategori</label>
                  <input value={editForm.category} onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Deskripsi</label>
                  <textarea rows={8} value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} />
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <HiOutlinePhoto />
                <strong>Pilih satu product dari daftar.</strong>
                <p>Atau klik tombol tambah untuk masuk ke flow seller center bertahap.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
