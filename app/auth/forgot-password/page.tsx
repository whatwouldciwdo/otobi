"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../Auth.module.css";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";

function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Terjadi kesalahan. Silakan coba lagi.");
                setLoading(false);
                return;
            }

            setSuccess(true);
        } catch {
            setError("Network error. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <Link href="/auth" className={styles.backLink}>
                <FiArrowLeft className={styles.backIcon} /> Kembali ke Login
            </Link>

            <div className={styles.authCard}>
                <div className={styles.logoWrapper}>
                    <Image
                        src="/images/OTOBI-LOGO.jpeg"
                        alt="Otobi Logo"
                        width={160}
                        height={60}
                        className={styles.logoImage}
                        priority
                    />
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '48px', color: '#22c55e', marginBottom: '16px' }}>
                            <FiCheckCircle style={{ margin: '0 auto' }} />
                        </div>
                        <h1 className={styles.title}>Email Terkirim</h1>
                        <p className={styles.subtitle} style={{ marginBottom: '24px' }}>
                            Jika akun dengan email <strong>{email}</strong> terdaftar, kami telah mengirimkan link untuk mengatur ulang password kamu.
                        </p>
                        <p className={styles.subtitle} style={{ fontSize: '13px' }}>
                            Tidak menerima email? Periksa folder spam atau{" "}
                            <button 
                                onClick={() => setSuccess(false)}
                                style={{ background: 'none', border: 'none', color: '#1a1a2e', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                            >
                                coba gunakan email lain
                            </button>.
                        </p>
                    </div>
                ) : (
                    <>
                        <h1 className={styles.title}>Lupa Password</h1>
                        <p className={styles.subtitle}>
                            Masukkan alamat email akun kamu, dan kami akan mengirimkan link untuk mengatur ulang password.
                        </p>

                        {error && (
                            <div className={styles.errorBox}>
                                {error}
                            </div>
                        )}

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="email" className={styles.label}>Alamat Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className={styles.input}
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? "Mengirim..." : "Kirim Link Reset"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <main className={styles.main}>
            <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
                <ForgotPasswordForm />
            </Suspense>
        </main>
    );
}
