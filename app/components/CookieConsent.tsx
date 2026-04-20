"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield } from "react-icons/fi";
import styles from "./CookieConsent.module.css";

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hasDeclined = sessionStorage.getItem("otobi-cookie-declined");
        if (hasDeclined) return;

        const hasCookie = document.cookie.split("; ").find(row => row.startsWith("otobi-cookie-consent="));
        if (!hasCookie) {
            const timer = setTimeout(() => setShow(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `otobi-cookie-consent=true;expires=${d.toUTCString()};path=/;SameSite=Lax`;
        setShow(false);
    };

    const declineCookies = () => {
        sessionStorage.setItem("otobi-cookie-declined", "true");
        setShow(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <div className={styles.backdrop}>
                    <motion.div
                        className={styles.popup}
                        initial={{ y: 150, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 150, opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <div className={styles.content}>
                            <div className={styles.iconWrapper}>
                                <FiShield />
                            </div>
                            <div className={styles.text}>
                                <h3 className={styles.title}>Enhance Your Experience</h3>
                                <p className={styles.description}>
                                    We use cookies to personalize content, secure your checkout, and bring you the ultimate automotive care experience.
                                </p>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button type="button" className={styles.declineBtn} onClick={declineCookies}>
                                Decline
                            </button>
                            <button type="button" className={styles.acceptBtn} onClick={acceptCookies}>
                                Allow Cookies
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
