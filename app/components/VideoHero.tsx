"use client";

import { useEffect, useRef } from "react";
import { FiChevronDown, FiInstagram } from "react-icons/fi";
import styles from "./VideoHero.module.css";

interface VideoHeroProps {
    onScrollPast?: () => void;
}

export default function VideoHero({ onScrollPast }: VideoHeroProps) {
    const sectionRef = useRef<HTMLElement>(null);

    const handleScroll = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth",
        });
    };

    
    useEffect(() => {
        const el = sectionRef.current;
        if (!el || !onScrollPast) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                
                if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
                    onScrollPast();
                }
            },
            { threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [onScrollPast]);

    return (
        <section ref={sectionRef} className={styles.videoHero}>
            
            <video
                className={styles.videoBg}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
            >
                <source src="/video/otobidetailing.mp4" type="video/mp4" />
            </video>

            
            <div className={styles.darkOverlay} />
            <div className={styles.grainOverlay} />

            
            <div className={styles.content}>
                <h1 className={styles.heading}>Your Car Deserves<br/>The Best Products</h1>
                <p className={styles.subtitle}>
                    Rangkaian produk car care premium — dari ceramic coating hingga aksesori otomotif — untuk kendaraan yang selalu tampil sempurna.
                </p>
                <button className={styles.discoverBtn} onClick={handleScroll}>
                    Explore Products
                </button>
            </div>

            
            <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Instagram"
            >
                <FiInstagram />
            </a>

            
            <button
                className={styles.scrollArrow}
                onClick={handleScroll}
                aria-label="Scroll down"
            >
                <FiChevronDown />
            </button>
        </section>
    );
}
