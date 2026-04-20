"use client";
import { FiShare2, FiCheck } from "react-icons/fi";
import { useState } from "react";
import styles from "./BlogDetail.module.css";

export default function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch {
            //
        }
    };

    return (
        <button className={styles.shareBtn} onClick={handleCopy}>
            {copied ? <><FiCheck /> Tersalin!</> : <><FiShare2 /> Salin Tautan</>}
        </button>
    );
}
