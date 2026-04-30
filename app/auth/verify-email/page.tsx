"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "../../context/ShopContext";
import { FiArrowLeft } from "react-icons/fi";
import styles from "../Auth.module.css";
import otpStyles from "./VerifyEmail.module.css";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const redirectUrl = searchParams.get("redirect") || "/";
  const { login } = useShop();

  const [codes, setCodes] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.replace("/auth");
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...codes];
    next[index] = value.slice(-1);
    setCodes(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCodes(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = codes.join("");
    if (code.length < 6) { setError("Masukkan 6 digit kode verifikasi."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Verifikasi gagal."); setLoading(false); return; }
      login(data.user.name, data.user.email, data.user.id, data.user.phone ?? "", data.user.role ?? "USER", data.user.address ?? "", data.user.areaId ?? "", data.user.areaName ?? "");
      router.push(redirectUrl);
    } catch {
      setError("Network error. Coba lagi.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setError("");
    try {
      await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
      setCodes(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <Link href="/auth" className={styles.backLink}>
        <FiArrowLeft className={styles.backIcon} /> Kembali
      </Link>

      <div className={styles.authCard}>
        <div className={styles.logoWrapper}>
          <Image src="/images/OTOBI-LOGO.jpeg" alt="Otobi Logo" width={160} height={60} className={styles.logoImage} priority />
        </div>

        <div className={otpStyles.iconWrapper}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={otpStyles.verifyIcon}>
            {/* Shield background */}
            <path
              d="M32 4L8 14v16c0 13.255 10.4 25.647 24 28 13.6-2.353 24-14.745 24-28V14L32 4z"
              fill="#1a1a2e"
              opacity="0.08"
            />
            <path
              d="M32 8L10 17.333V30c0 11.782 9.244 22.818 22 25 12.756-2.182 22-13.218 22-25V17.333L32 8z"
              fill="#1a1a2e"
              opacity="0.15"
            />
            <path
              d="M32 12L12 20.667V30c0 10.31 8.09 19.99 20 22 11.91-2.01 20-11.69 20-22V20.667L32 12z"
              fill="#cc0000"
            />
            {/* Envelope */}
            <rect x="21" y="25" width="22" height="16" rx="2" fill="white" opacity="0.95"/>
            <path d="M21 27l11 8 11-8" stroke="#cc0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Checkmark badge */}
            <circle cx="44" cy="44" r="9" fill="white"/>
            <circle cx="44" cy="44" r="7" fill="#22c55e"/>
            <path d="M40.5 44l2.5 2.5 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className={styles.title}>Verifikasi Email</h1>
        <p className={styles.subtitle}>
          Masukkan 6 digit kode yang dikirim ke<br />
          <strong>{email}</strong>
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={otpStyles.otpRow} onPaste={handlePaste}>
          {codes.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              className={otpStyles.otpInput}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading || codes.join("").length < 6}
          style={{ marginTop: 24 }}
        >
          {loading ? "Memverifikasi..." : "Verifikasi Akun"}
        </button>

        <div className={styles.toggleText} style={{ marginTop: 20 }}>
          Tidak terima email?{" "}
          <button
            className={styles.toggleBtn}
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
          >
            {resending ? "Mengirim..." : resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : "Kirim ulang kode"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </main>
  );
}
