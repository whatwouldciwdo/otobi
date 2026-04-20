"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { FiCheckCircle, FiTruck, FiPackage, FiCopy, FiArrowRight, FiAlertCircle, FiClock, FiNavigation, FiArchive, FiXCircle } from "react-icons/fi";
import styles from "./OrderConfirmation.module.css";
import { useShop } from "../../context/ShopContext";

interface OrderDetail {
    id: string;
    biteshipOrderId: string | null;
    biteshipWaybillId: string | null;
    biteshipStatus: string;
    courierCompany: string;
    courierServiceName: string;
    shippingCost: number;
    recipientName: string;
    recipientPhone: string;
    recipientEmail: string;
    recipientAddress: string;
    recipientAreaName: string;
    recipientPostalCode: string | null;
    itemsJson: string;
    subtotal: number;
    total: number;
    createdAt: string;
}

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const { logout } = useShop();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!orderId) return;
        fetch(`/api/orders/${orderId}`)
            .then((r) => r.json())
            .then((data) => {
                setOrder(data.order);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [orderId]);

    const copyWaybill = () => {
        if (!order?.biteshipWaybillId) return;
        navigator.clipboard.writeText(order.biteshipWaybillId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatPrice = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

    const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; Icon: any }> = {
        confirmed: { label: "Dikonfirmasi", color: "#1a7a3a", bg: "#f0fff4", border: "#b2e8c4", Icon: FiCheckCircle },
        allocated: { label: "Kurir Dialokasikan", color: "#1a5fa8", bg: "#f0f7ff", border: "#b2d4f8", Icon: FiTruck },
        picking_up: { label: "Penjemputan", color: "#7a5100", bg: "#fffbea", border: "#ffe58a", Icon: FiNavigation },
        picked: { label: "Dijemput Kurir", color: "#1a5fa8", bg: "#f0f7ff", border: "#b2d4f8", Icon: FiArchive },
        dropping_off: { label: "Dalam Pengiriman", color: "#7a1fa8", bg: "#f9f0ff", border: "#d4b2f8", Icon: FiTruck },
        delivered: { label: "Terkirim", color: "#1a7a3a", bg: "#f0fff4", border: "#b2e8c4", Icon: FiCheckCircle },
        cancelled: { label: "Dibatalkan", color: "#cc0000", bg: "#fff0f0", border: "#ffcccc", Icon: FiXCircle },
        pending: { label: "Menunggu Proses", color: "#7a5100", bg: "#fffbea", border: "#ffe58a", Icon: FiClock },
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.loadingState}>Memuat detail pesanan...</div>
                </main>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <main className={styles.main}>
                    <div className={styles.notFound}>
                        <FiAlertCircle size={48} />
                        <h2>Pesanan tidak ditemukan</h2>
                        <Link href="/products" className={styles.shopBtn}>Kembali Belanja</Link>
                    </div>
                </main>
            </div>
        );
    }

    const items = JSON.parse(order.itemsJson ?? "[]");

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.successHeader}>
                        <div className={styles.checkIcon}>
                            <FiCheckCircle />
                        </div>
                        <h1 className={styles.successTitle}>Pesanan Berhasil Dibuat!</h1>
                        <p className={styles.successSub}>
                            Terima kasih telah berbelanja di OTOBI. Detail pesanan dikirim ke <strong>{order.recipientEmail}</strong>
                        </p>
                    </div>

                    <div className={styles.layout}>
                        {/* Left: Order Details */}
                        <div className={styles.detailsSection}>
                            {/* Resi / AWB */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <FiTruck className={styles.cardIcon} />
                                    <h2 className={styles.cardTitle}>Informasi Pengiriman</h2>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Status</span>
                                    {(() => {
                                        const cfg = statusConfig[order.biteshipStatus] ?? statusConfig["pending"];
                                        const Icon = cfg.Icon;
                                        return (
                                            <span
                                                className={styles.statusBadge}
                                                style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                                            >
                                                <Icon size={13} style={{ flexShrink: 0 }} />
                                                {cfg.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Ekspedisi</span>
                                    <span className={styles.infoValue}>
                                        <strong>{order.courierCompany.toUpperCase()}</strong> — {order.courierServiceName}
                                    </span>
                                </div>

                                {order.biteshipWaybillId ? (
                                    <div className={styles.waybillBox}>
                                        <span className={styles.waybillLabel}>Nomor Resi (AWB)</span>
                                        <div className={styles.waybillRow}>
                                            <span className={styles.waybillNumber}>{order.biteshipWaybillId}</span>
                                            <button className={styles.copyBtn} onClick={copyWaybill}>
                                                <FiCopy />
                                                {copied ? "Disalin!" : "Salin"}
                                            </button>
                                        </div>
                                        <a
                                            href={`https://biteship.com/tracking/waybill/${order.biteshipWaybillId}/${order.courierCompany}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.trackingLink}
                                        >
                                            Lacak Paket <FiArrowRight />
                                        </a>
                                    </div>
                                ) : (
                                    <div className={styles.pendingResi}>
                                        <FiAlertCircle />
                                        Nomor resi sedang diproses. Kami akan mengirimkan resi via WhatsApp ke <strong>{order.recipientPhone}</strong>
                                    </div>
                                )}
                            </div>

                            {/* Recipients */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <FiPackage className={styles.cardIcon} />
                                    <h2 className={styles.cardTitle}>Alamat Pengiriman</h2>
                                </div>
                                <div className={styles.recipientInfo}>
                                    <p className={styles.recipientName}>{order.recipientName}</p>
                                    <p className={styles.recipientDetail}>{order.recipientPhone}</p>
                                    <p className={styles.recipientDetail}>{order.recipientAddress}</p>
                                    <p className={styles.recipientDetail}>{order.recipientAreaName}</p>
                                    {order.recipientPostalCode && (
                                        <p className={styles.recipientDetail}>Kode Pos: {order.recipientPostalCode}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <aside className={styles.summary}>
                            <div className={styles.summaryCard}>
                                <h2 className={styles.summaryTitle}>Ringkasan Pesanan</h2>
                                <p className={styles.orderId}>ID: {order.id}</p>

                                <div className={styles.summaryItems}>
                                    {items.map((item: any, i: number) => (
                                        <div key={i} className={styles.summaryItem}>
                                            <span className={styles.summaryItemName}>
                                                {item.title}
                                                <span className={styles.summaryQty}>×{item.quantity}</span>
                                            </span>
                                            <span className={styles.summaryItemPrice}>{item.price}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.summaryDivider} />
                                <div className={styles.summaryRow}>
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Ongkos Kirim</span>
                                    <span>{formatPrice(order.shippingCost)}</span>
                                </div>
                                <div className={styles.summaryDivider} />
                                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>

                                <Link href="/products" className={styles.shopBtn}>
                                    Lanjut Belanja
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
