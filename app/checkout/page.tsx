"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useShop } from "../context/ShopContext";
import Navbar from "../components/Navbar";
import { FiArrowLeft, FiPackage, FiMapPin, FiUser, FiPhone, FiMail, FiTruck, FiCheckCircle, FiTag, FiX } from "react-icons/fi";
import styles from "./Checkout.module.css";

interface Area {
    id: string;
    name: string;
    postal_code: number;
}

interface ShippingRate {
    courier_name: string;
    courier_code: string;
    courier_service_name: string;
    courier_service_code: string;
    price: number;
    shipment_duration_range: string;
    shipment_duration_unit: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, cartTotal, user, login, clearCart } = useShop();

    const [form, setForm] = useState({
        recipientName: user?.name ?? "",
        email: user?.email ?? "",
        whatsapp: user?.phone ?? "",
        address: user?.address ?? "",
    });

    const [areaInput, setAreaInput] = useState(user?.areaName ?? "");
    const [areaResults, setAreaResults] = useState<Area[]>([]);
    const [selectedArea, setSelectedArea] = useState<Area | null>(
        user?.areaId && user?.areaName ? { id: user.areaId, name: user.areaName, postal_code: 0 } : null
    );
    const [searchingArea, setSearchingArea] = useState(false);

    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
    const [loadingRates, setLoadingRates] = useState(false);
    const [ratesError, setRatesError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Voucher state
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [voucherError, setVoucherError] = useState("");
    const [voucherSuccess, setVoucherSuccess] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        if (cart.length === 0) router.push("/cart");
    }, [cart, router]);

    useEffect(() => {
        if (selectedArea && rates.length === 0 && cart.length > 0) {
            fetchRates(selectedArea);
        }
    }, []);

    useEffect(() => {
        if (areaInput.length < 3) {
            setAreaResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchingArea(true);
            try {
                const res = await fetch(`/api/shipping/areas?input=${encodeURIComponent(areaInput)}`);
                const data = await res.json();
                setAreaResults(data.areas ?? []);
            } catch {
                setAreaResults([]);
            } finally {
                setSearchingArea(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [areaInput]);

    const fetchRates = useCallback(async (area: Area) => {
        if (!area || cart.length === 0) return;
        setLoadingRates(true);
        setRatesError("");
        setRates([]);
        setSelectedRate(null);
        try {
            const items = cart.map((item) => {
                const digits = item.price.replace(/[^\d]/g, "");
                const value = parseInt(digits, 10) || 10000;
                const normalizedValue = value < 1000 ? value * 1000 : value;
                return {
                    name: item.title,
                    value: normalizedValue,
                    quantity: item.quantity,
                    weight: 300,
                };
            });
            const res = await fetch("/api/shipping/rates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ destinationAreaId: area.id, items }),
            });
            const data = await res.json();
            if (data.rates?.length > 0) {
                setRates(data.rates);
            } else {
                setRatesError(
                    data.error
                        ? `Biteship: ${data.error}. Coba pilih kelurahan lain.`
                        : "Ongkos kirim tidak tersedia untuk wilayah ini. Coba pilih kelurahan/kecamatan lain."
                );
            }
        } catch {
            setRatesError("Gagal mengambil ongkos kirim. Cek koneksi internet Anda.");
        } finally {
            setLoadingRates(false);
        }
    }, [cart]);

    const handleSelectArea = (area: Area) => {
        setSelectedArea(area);
        setAreaInput(area.name);
        setAreaResults([]);
        fetchRates(area);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleVoucher = async () => {
        if (!voucherCode.trim()) return;
        setVoucherLoading(true);
        setVoucherError("");
        setVoucherSuccess("");
        try {
            const productIds = cart.map(item => item.id);
            const res = await fetch("/api/promos/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: voucherCode.trim().toUpperCase(),
                    subtotal: cartTotal,
                    productIds,
                    categories: [],
                }),
            });
            const data = await res.json();
            if (data.valid) {
                setDiscountAmount(data.discountAmount);
                setVoucherSuccess(data.message);
            } else {
                setDiscountAmount(0);
                setVoucherError(data.message);
            }
        } catch {
            setVoucherError("Gagal memvalidasi voucher.");
        } finally {
            setVoucherLoading(false);
        }
    };

    const removeVoucher = () => {
        setVoucherCode("");
        setDiscountAmount(0);
        setVoucherError("");
        setVoucherSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedArea) { alert("Harap pilih kelurahan/kecamatan tujuan pengiriman."); return; }
        if (!selectedRate) { alert("Harap pilih ekspedisi pengiriman."); return; }

        setSubmitting(true);
        setSubmitError("");
        try {
            const res = await fetch("/api/shipping/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientName: form.recipientName,
                    recipientPhone: form.whatsapp,
                    recipientEmail: form.email,
                    recipientAddress: form.address,
                    destinationAreaId: selectedArea.id,
                    destinationAreaName: selectedArea.name,
                    destinationPostalCode: String(selectedArea.postal_code ?? ""),
                    courierCompany: selectedRate.courier_code,
                    courierServiceCode: selectedRate.courier_service_code,
                    courierServiceName: selectedRate.courier_service_name,
                    shippingCost: selectedRate.price,
                    items: cart,
                    subtotal: cartTotal,
                    total: finalTotal,
                    userId: user?.id ?? null,
                }),
            });
            const data = await res.json();
            if (data.orderId) {
                if (user && user.id && !user.id.startsWith('guest_')) {
                    login(
                        user.name,
                        user.email,
                        user.id,
                        form.whatsapp,
                        user.role,
                        form.address,
                        selectedArea.id,
                        selectedArea.name
                    );
                }
                clearCart();
                router.push(`/order/${data.orderId}`);
            } else {
                setSubmitError(data.error ?? "Terjadi kesalahan. Coba lagi.");
            }
        } catch {
            setSubmitError("Gagal membuat pesanan. Cek koneksi internet Anda.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price: number) =>
        `Rp ${price.toLocaleString("id-ID")}`;

    const finalTotal = cartTotal + (selectedRate?.price ?? 0) - discountAmount;

    if (cart.length === 0) return null;

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className={styles.main}>
                <div className={styles.container}>
                    <Link href="/cart" className={styles.backLink}>
                        <FiArrowLeft className={styles.backIcon} />
                        Kembali ke Keranjang
                    </Link>

                    <h1 className={styles.pageTitle}>CHECKOUT</h1>

                    <div className={styles.layout}>
                        <form className={styles.formSection} onSubmit={handleSubmit}>
                            {/* Data Penerima */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <FiUser className={styles.cardIcon} />
                                    <h2 className={styles.cardTitle}>Data Penerima</h2>
                                </div>

                                <div className={styles.fieldGrid}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Nama Penerima *</label>
                                        <input
                                            type="text"
                                            name="recipientName"
                                            className={styles.input}
                                            placeholder="Nama lengkap penerima"
                                            value={form.recipientName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>
                                            <FiPhone style={{ marginRight: 6 }} />
                                            Nomor WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            className={styles.input}
                                            placeholder="08xx-xxxx-xxxx"
                                            value={form.whatsapp}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={`${styles.field} ${styles.fieldFull}`}>
                                        <label className={styles.label}>
                                            <FiMail style={{ marginRight: 6 }} />
                                            Alamat Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className={styles.input}
                                            placeholder="email@example.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Alamat Pengiriman */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <FiMapPin className={styles.cardIcon} />
                                    <h2 className={styles.cardTitle}>Alamat Pengiriman</h2>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Alamat Lengkap (Jalan, No. Rumah, RT/RW) *</label>
                                    <textarea
                                        name="address"
                                        className={styles.textarea}
                                        placeholder="Misal: Jl. Merdeka No. 10, RT 02/RW 05"
                                        value={form.address}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Kelurahan / Kecamatan / Kota *</label>
                                    <div className={styles.searchWrapper}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="Ketik nama kelurahan, kecamatan, atau kota..."
                                            value={areaInput}
                                            onChange={(e) => {
                                                setAreaInput(e.target.value);
                                                if (selectedArea) setSelectedArea(null);
                                            }}
                                        />
                                        {searchingArea && (
                                            <div className={styles.searchHint}>Mencari area...</div>
                                        )}
                                        {areaResults.length > 0 && !selectedArea && (
                                            <ul className={styles.dropdown}>
                                                {areaResults.map((area) => (
                                                    <li
                                                        key={area.id}
                                                        className={styles.dropdownItem}
                                                        onClick={() => handleSelectArea(area)}
                                                    >
                                                        <FiMapPin className={styles.dropdownIcon} />
                                                        <span>{area.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    {selectedArea && (
                                        <div className={styles.selectedArea}>
                                            <FiCheckCircle className={styles.selectedAreaIcon} />
                                            <span>
                                                <strong>{selectedArea.name.split(",").slice(0, 2).join(",")}</strong>
                                                {" — "}
                                                <span className={styles.postalCode}>Kode Pos {selectedArea.postal_code}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pilih Ekspedisi */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <FiTruck className={styles.cardIcon} />
                                    <h2 className={styles.cardTitle}>Pilih Ekspedisi</h2>
                                </div>

                                {!selectedArea && (
                                    <p className={styles.hintText}>Pilih kelurahan tujuan terlebih dahulu untuk melihat ongkos kirim.</p>
                                )}
                                {loadingRates && (
                                    <div className={styles.loadingRates}>
                                        <span className={styles.spinner} />
                                        Mengkalkulasi ongkos kirim...
                                    </div>
                                )}
                                {ratesError && <p className={styles.ratesError}>{ratesError}</p>}
                                {rates.length > 0 && (
                                    <div className={styles.ratesList}>
                                        {rates.map((rate, i) => (
                                            <label
                                                key={i}
                                                className={`${styles.rateOption} ${selectedRate?.courier_service_code === rate.courier_service_code && selectedRate?.courier_code === rate.courier_code ? styles.rateSelected : ""}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="shippingRate"
                                                    className={styles.radioInput}
                                                    onChange={() => setSelectedRate(rate)}
                                                    checked={selectedRate?.courier_service_code === rate.courier_service_code && selectedRate?.courier_code === rate.courier_code}
                                                />
                                                <div className={styles.rateBadge}>
                                                    {rate.courier_code.toUpperCase()}
                                                </div>
                                                <div className={styles.rateInfo}>
                                                    <span className={styles.rateService}>{rate.courier_service_name}</span>
                                                    <span className={styles.rateDuration}>
                                                        Estimasi {rate.shipment_duration_range} {rate.shipment_duration_unit}
                                                    </span>
                                                </div>
                                                <span className={styles.ratePrice}>{formatPrice(rate.price)}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {submitError && <p className={styles.submitError}>{submitError}</p>}
                            <button type="submit" className={styles.submitBtn} disabled={submitting}>
                                <FiPackage />
                                {submitting ? "Membuat Pesanan..." : "Buat Pesanan"}
                            </button>
                        </form>

                        {/* Summary Panel */}
                        <aside className={styles.summary}>
                            <div className={styles.summaryCard}>
                                <h2 className={styles.summaryTitle}>Ringkasan Pesanan</h2>

                                <div className={styles.summaryItems}>
                                    {cart.map((item) => (
                                        <div key={item.id} className={styles.summaryItem}>
                                            <span className={styles.summaryItemName}>
                                                {item.title}
                                                <span className={styles.summaryQty}>×{item.quantity}</span>
                                            </span>
                                            <span className={styles.summaryItemPrice}>{item.price}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.summaryDivider} />

                                {/* Voucher Section */}
                                <div className={styles.voucherSection}>
                                    <label className={styles.voucherLabel}>
                                        <FiTag style={{ marginRight: 6 }} />
                                        Kode Voucher
                                    </label>
                                    {discountAmount > 0 ? (
                                        <div className={styles.voucherApplied}>
                                            <span>{voucherCode.toUpperCase()}</span>
                                            <button className={styles.removeVoucherBtn} onClick={removeVoucher}>
                                                <FiX />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.voucherInput}>
                                            <input
                                                type="text"
                                                id="voucher-code-input"
                                                placeholder="Masukkan kode voucher"
                                                value={voucherCode}
                                                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                                className={styles.voucherField}
                                                onKeyDown={(e) => e.key === "Enter" && handleVoucher()}
                                            />
                                            <button
                                                id="apply-voucher-btn"
                                                className={styles.voucherBtn}
                                                onClick={handleVoucher}
                                                disabled={voucherLoading || !voucherCode.trim()}
                                            >
                                                {voucherLoading ? "..." : "Pakai"}
                                            </button>
                                        </div>
                                    )}
                                    {voucherError && <p className={styles.voucherError}>{voucherError}</p>}
                                    {voucherSuccess && <p className={styles.voucherSuccess}>{voucherSuccess}</p>}
                                </div>

                                <div className={styles.summaryDivider} />

                                <div className={styles.summaryRow}>
                                    <span>Subtotal Produk</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Ongkos Kirim</span>
                                    <span>{selectedRate ? formatPrice(selectedRate.price) : <em className={styles.dimText}>Pilih ekspedisi</em>}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                        <span>Diskon Voucher</span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}

                                <div className={styles.summaryDivider} />

                                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                    <span>Total</span>
                                    <span>{formatPrice(finalTotal)}</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
