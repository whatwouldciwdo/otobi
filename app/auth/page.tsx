"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useShop } from "../context/ShopContext";
import styles from "./Auth.module.css";
import { FiArrowLeft } from "react-icons/fi";

function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";
    const { login } = useShop();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
            const body = isLogin
                ? { email, password }
                : { name, email, password };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Something went wrong. Please try again.");
                setLoading(false);
                return;
            }

            
            login(data.user.name, data.user.email, data.user.id, data.user.phone ?? "", data.user.role ?? "USER", data.user.address ?? "", data.user.areaId ?? "", data.user.areaName ?? "");
            router.push(redirectUrl);
        } catch {
            setError("Network error. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <Link href="/" className={styles.backLink}>
                <FiArrowLeft className={styles.backIcon} /> Back to Home
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

                <h1 className={styles.title}>
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className={styles.subtitle}>
                    {isLogin
                        ? "Enter your details to access your account."
                        : "Join us and keep track of your purchases and rewards."}
                </p>

                {error && (
                    <div className={styles.errorBox}>
                        {error}
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="name" className={styles.label}>Full Name</label>
                            <input
                                type="text"
                                id="name"
                                className={styles.input}
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
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

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
                    </button>
                </form>

                <div className={styles.toggleText}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        className={styles.toggleBtn}
                        onClick={() => { setIsLogin(!isLogin); setError(""); }}
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <main className={styles.main}>
            <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
                <AuthForm />
            </Suspense>
        </main>
    );
}
