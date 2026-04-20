"use client";

import { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { FiSearch, FiTruck, FiAlertCircle, FiCheckCircle, FiClock, FiPackage, FiArrowLeft } from "react-icons/fi";
import styles from "./Tracking.module.css";

const COURIERS = [
    { value: "jne", label: "JNE" },
    { value: "jnt", label: "J&T Express" },
    { value: "sicepat", label: "SiCepat" },
    { value: "pos", label: "Pos Indonesia" },
    { value: "anteraja", label: "AnterAja" },
    { value: "tiki", label: "TIKI" },
];

interface TrackHistory {
    note: string;
    updated_at: string;
    location?: string;
}

interface TrackingData {
    waybill_id: string;
    courier_code: string;
    origin: string;
    destination: string;
    status: string;
    history: TrackHistory[];
}

export default function TrackingPage() {
    const [waybill, setWaybill] = useState("");
    const [courier, setCourier] = useState("jne");
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrack = useCallback(async () => {
        if (!waybill.trim()) { setError("Masukkan nomor resi terlebih dahulu."); return; }
        setLoading(true);
        setError("");
        setTracking(null);
        try {
            const res = await fetch(`/api/tracking?waybill=${encodeURIComponent(waybill.trim())}&courier=${courier}`);
            const data = await res.json();
            if (data.tracking) {
                setTracking(data.tracking);
            } else {
                setError(data.error ?? "Resi tidak ditemukan atau belum ter-update.");
            }
        } catch {
            setError("Gagal melacak paket. Cek koneksi internet Anda.");
        } finally {
            setLoading(false);
        }
    }, [waybill, courier]);

    const formatDate = (s: string) => {
        try {
            return new Date(s).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch { return s; }
    };

    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        confirmed: { label: "Dikonfirmasi", color: "#1a7a3a", bg: "#f0fff4" },
        picking_up: { label: "Penjemputan", color: "#e08000", bg: "#fffbea" },
        picked: { label: "Dijemput Kurir", color: "#1a5fa8", bg: "#f0f7ff" },
        dropping_off: { label: "Dalam Pengiriman", color: "#7a1fa8", bg: "#f9f0ff" },
        delivered: { label: "Terkirim", color: "#1a7a3a", bg: "#f0fff4" },
        cancelled: { label: "Dibatalkan", color: "#cc0000", bg: "#fff0f0" },
        on_hold: { label: "On Hold", color: "#888", bg: "#f5f5f5" },
        returned: { label: "Dikembalikan", color: "#cc0000", bg: "#fff0f0" },
    };

    const st = tracking ? (statusConfig[tracking.status] ?? { label: tracking.status, color: "#888", bg: "#f5f5f5" }) : null;

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className={styles.main}>
                <div className={styles.container}>
                    <Link href="/account" className={styles.backLink}>
                        <FiArrowLeft /> Kembali ke Akun
                    </Link>
                    <h1 className={styles.pageTitle}>LACAK PAKET</h1>
                    <p className={styles.subtitle}>Masukkan nomor resi dan pilih ekspedisi untuk melacak paket Anda.</p>

                    
                    <div className={styles.searchCard}>
                        <div className={styles.inputGroup}>
                            <FiPackage className={styles.inputIcon} />
                            <input
                                type="text"
                                className={styles.waybillInput}
                                placeholder="Masukkan nomor resi..."
                                value={waybill}
                                onChange={e => setWaybill(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleTrack()}
                            />
                        </div>
                        <select
                            className={styles.courierSelect}
                            value={courier}
                            onChange={e => setCourier(e.target.value)}
                        >
                            {COURIERS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <button
                            className={styles.trackBtn}
                            onClick={handleTrack}
                            disabled={loading}
                        >
                            <FiSearch />
                            {loading ? "Melacak..." : "Lacak"}
                        </button>
                    </div>

                    {error && (
                        <div className={styles.errorBox}>
                            <FiAlertCircle />
                            {error}
                        </div>
                    )}

                    
                    {tracking && (
                        <div className={styles.resultCard}>
                            <div className={styles.resultHeader}>
                                <div>
                                    <span className={styles.resiLabel}>Nomor Resi</span>
                                    <span className={styles.resiNumber}>{tracking.waybill_id}</span>
                                </div>
                                <span
                                    className={styles.statusPill}
                                    style={{ color: st!.color, background: st!.bg }}
                                >
                                    {st!.label}
                                </span>
                            </div>

                            {(tracking.origin || tracking.destination) && (
                                <div className={styles.routeRow}>
                                    {tracking.origin && <span className={styles.routeItem}>📍 {tracking.origin}</span>}
                                    {tracking.destination && (
                                        <>
                                            <span className={styles.routeArrow}>→</span>
                                            <span className={styles.routeItem}>🏠 {tracking.destination}</span>
                                        </>
                                    )}
                                </div>
                            )}

                            
                            <div className={styles.timeline}>
                                {tracking.history.length === 0 ? (
                                    <div className={styles.noHistory}>
                                        <FiClock size={24} />
                                        <span>Belum ada update pengiriman</span>
                                    </div>
                                ) : (
                                    tracking.history.map((h, i) => (
                                        <div key={i} className={`${styles.timelineItem} ${i === 0 ? styles.timelineActive : ""}`}>
                                            <div className={styles.timelineDot}>
                                                {i === 0 ? <FiCheckCircle /> : <FiTruck />}
                                            </div>
                                            <div className={styles.timelineContent}>
                                                <span className={styles.timelineNote}>{h.note}</span>
                                                {h.location && <span className={styles.timelineLocation}>📍 {h.location}</span>}
                                                <span className={styles.timelineDate}>{formatDate(h.updated_at)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
