"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../Auth.module.css";
import { FiCheckCircle } from "react-icons/fi";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("Link reset password tidak valid. Silakan mulai ulang proses lupa password.");
        }
    }, [token]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!token) {
            setError("Link reset password tidak valid.");
            return;
        }

        if (password.length < 6) {
            setError("Password harus minimal 6 karakter.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Konfirmasi password tidak cocok.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Terjadi kesalahan. Silakan coba lagi.");
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/auth");
            }, 3000);
        } catch {
            setError("Network error. Silakan coba lagi.");
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
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
                        <h1 className={styles.title}>Berhasil!</h1>
                        <p className={styles.subtitle}>
                            Password akun kamu berhasil diperbarui.
                            <br />
                            Mengalihkan ke halaman login...
                        </p>
                    </div>
                ) : (
                    <>
                        <h1 className={styles.title}>Atur Password Baru</h1>
                        <p className={styles.subtitle}>
                            Masukkan password baru untuk akun kamu.
                        </p>

                        {error && (
                            <div className={styles.errorBox}>
                                {error}
                            </div>
                        )}

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="password" className={styles.label}>Password Baru</label>
                                <input
                                    type="password"
                                    id="password"
                                    className={styles.input}
                                    placeholder="Minimal 6 karakter"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={!token || loading}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="confirmPassword" className={styles.label}>Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className={styles.input}
                                    placeholder="Ulangi password baru"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={!token || loading}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className={styles.submitBtn} 
                                disabled={loading || !token}
                            >
                                {loading ? "Menyimpan..." : "Simpan Password Baru"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className={styles.main}>
            <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </main>
    );
}
