"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { FiUser, FiPackage, FiMapPin, FiPhone, FiMail, FiEdit2, FiCheck, FiX, FiLogOut, FiNavigation } from "react-icons/fi";
import styles from "./Account.module.css";
import { useShop } from "../context/ShopContext";

interface Order {
    id: string;
    biteshipWaybillId: string | null;
    biteshipStatus: string;
    courierCompany: string;
    courierServiceName: string;
    recipientAreaName: string;
    total: number;
    itemCount: number;
    createdAt: string;
}

const statusLabel: Record<string, { label: string; color: string }> = {
    confirmed: { label: "Dikonfirmasi", color: "#1a7a3a" },
    allocated: { label: "Kurir Disiapkan", color: "#1a5fa8" },
    picking_up: { label: "Penjemputan", color: "#e08000" },
    picked: { label: "Dijemput", color: "#1a5fa8" },
    dropping_off: { label: "Dalam Pengiriman", color: "#7a1fa8" },
    delivered: { label: "Terkirim ✓", color: "#1a7a3a" },
    cancelled: { label: "Dibatalkan", color: "#cc0000" },
    pending: { label: "Menunggu", color: "#888" },
};

export default function AccountPage() {
    const router = useRouter();
    const { user, logout, login } = useShop();

    const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "" });
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", phone: "" });
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    
    useEffect(() => {
        if (!user) router.push("/auth?redirect=/account");
    }, [user, router]);

    
    useEffect(() => {
        if (!user?.id) return;
        fetch(`/api/user/profile?userId=${user.id}`)
            .then(r => r.json())
            .then(d => {
                if (d.user) {
                    setProfile(d.user);
                    setEditForm({ name: d.user.name, phone: d.user.phone ?? "" });
                }
            });
    }, [user]);

    
    useEffect(() => {
        if (!user?.id) return;
        setLoadingOrders(true);
        fetch(`/api/user/orders?userId=${user.id}`)
            .then(r => r.json())
            .then(d => { setOrders(d.orders ?? []); setLoadingOrders(false); })
            .catch(() => setLoadingOrders(false));
    }, [user]);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, name: editForm.name, phone: editForm.phone }),
        });
        setProfile(p => ({ ...p, name: editForm.name, phone: editForm.phone }));
        login(editForm.name, profile.email, user.id, editForm.phone);
        setEditMode(false);
        setSaving(false);
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const formatPrice = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
    const formatDate = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    if (!user) return null;

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className={styles.main}>
                <div className={styles.container}>
                    <h1 className={styles.pageTitle}>AKUN SAYA</h1>

                    <div className={styles.layout}>
                        
                        <aside className={styles.sidebar}>
                            <div className={styles.profileCard}>
                                <div className={styles.avatarCircle}>
                                    {profile.name?.[0]?.toUpperCase() ?? "U"}
                                </div>
                                <h2 className={styles.profileName}>{profile.name || user.name}</h2>
                                <p className={styles.profileEmail}>{profile.email || user.email}</p>

                                <div className={styles.profileDetails}>
                                    <div className={styles.detailRow}>
                                        <FiPhone className={styles.detailIcon} />
                                        <span>{profile.phone || "—"}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <FiMail className={styles.detailIcon} />
                                        <span>{profile.email}</span>
                                    </div>
                                </div>

                                {!editMode ? (
                                    <button className={styles.editBtn} onClick={() => setEditMode(true)}>
                                        <FiEdit2 /> Edit Profil
                                    </button>
                                ) : (
                                    <div className={styles.editForm}>
                                        <label className={styles.editLabel}>Nama</label>
                                        <input
                                            className={styles.editInput}
                                            value={editForm.name}
                                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                        />
                                        <label className={styles.editLabel}>Nomor HP / WhatsApp</label>
                                        <input
                                            className={styles.editInput}
                                            value={editForm.phone}
                                            placeholder="08xx-xxxx-xxxx"
                                            onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                                        />
                                        <div className={styles.editActions}>
                                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                                <FiCheck /> {saving ? "Menyimpan..." : "Simpan"}
                                            </button>
                                            <button className={styles.cancelBtn} onClick={() => setEditMode(false)}>
                                                <FiX /> Batal
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <Link href="/tracking" className={styles.trackingLink}>
                                    <FiNavigation /> Lacak Paket
                                </Link>

                                <button className={styles.logoutBtn} onClick={handleLogout}>
                                    <FiLogOut /> Keluar
                                </button>
                            </div>
                        </aside>

                        
                        <section className={styles.ordersSection}>
                            <div className={styles.sectionHeader}>
                                <FiPackage className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>Pesanan Saya</h2>
                            </div>

                            {loadingOrders ? (
                                <div className={styles.loadingState}>Memuat pesanan...</div>
                            ) : orders.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <FiPackage size={48} />
                                    <p>Belum ada pesanan</p>
                                    <Link href="/products" className={styles.shopLink}>Mulai Belanja</Link>
                                </div>
                            ) : (
                                <div className={styles.orderList}>
                                    {orders.map(order => {
                                        const st = statusLabel[order.biteshipStatus] ?? { label: order.biteshipStatus, color: "#888" };
                                        return (
                                            <Link href={`/order/${order.id}`} key={order.id} className={styles.orderCard}>
                                                <div className={styles.orderTop}>
                                                    <div>
                                                        <span className={styles.orderId}>{order.id}</span>
                                                        <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                                                    </div>
                                                    <span className={styles.orderStatus} style={{ color: st.color }}>
                                                        {st.label}
                                                    </span>
                                                </div>
                                                <div className={styles.orderMid}>
                                                    <span className={styles.orderItems}>{order.itemCount} produk</span>
                                                    <span className={styles.orderCourier}>
                                                        {order.courierCompany.toUpperCase()} — {order.courierServiceName}
                                                    </span>
                                                </div>
                                                <div className={styles.orderBottom}>
                                                    <div className={styles.orderDestination}>
                                                        <FiMapPin size={12} /> {order.recipientAreaName.split(",").slice(0, 2).join(",")}
                                                    </div>
                                                    <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                                                </div>
                                                {order.biteshipWaybillId && (
                                                    <div className={styles.orderResi}>
                                                        Resi: <strong>{order.biteshipWaybillId}</strong>
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
