"use client";

import Image from "next/image";
import Link from "next/link";
import { LuSearch } from "react-icons/lu";
import styles from "./ProductFocusHero.module.css";
import { useShop } from "../context/ShopContext";
import { useState, useEffect, useCallback } from "react";

const slides = [
    {
        num: "01",
        collection: "Autocare Collection",
        title: ["Premium", "Autocare"],
        subtitle: "Introducing the autocare collection, a line of professional grade products designed specifically for the modern auto enthusiast.",
        image: "/images/otobi-product-homepage.png",
    },
    {
        num: "02",
        collection: "Exterior Collection",
        title: ["Exterior", "Perfection"],
        subtitle: "High-performance exterior protection that shields your vehicle's paint from UV rays, contaminants, and daily wear.",
        image: "/images/otobi-special-product.png",
    },
    {
        num: "03",
        collection: "Interior Collection",
        title: ["Interior", "Detailing"],
        subtitle: "Elevate your cabin with our premium interior line — from leather conditioners to dashboard restorers and beyond.",
        image: "/images/otobi-product-homepage.png",
    },
];

const SLIDE_DURATION = 5000;

export default function ProductFocusHero() {
    const { cartCount, setIsCartOpen } = useShop();
    const [current, setCurrent] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [mounted, setMounted] = useState(false);

    const goTo = useCallback((index: number) => {
        if (transitioning || index === current) return;
        setTransitioning(true);
        setProgress(0);
        setTimeout(() => {
            setCurrent(index);
            setTransitioning(false);
        }, 600);
    }, [transitioning, current]);

    
    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setTransitioning(true);
            setProgress(0);
            setTimeout(() => {
                setCurrent(prev => (prev + 1) % slides.length);
                setTransitioning(false);
            }, 600);
        }, SLIDE_DURATION);
        return () => clearInterval(interval);
    }, []);

    
    useEffect(() => {
        if (transitioning) return;
        setProgress(0);
        const start = Date.now();
        const raf = requestAnimationFrame(function tick() {
            const elapsed = Date.now() - start;
            setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
            if (elapsed < SLIDE_DURATION) requestAnimationFrame(tick);
        });
        return () => cancelAnimationFrame(raf);
    }, [current, transitioning]);

    const slide = slides[current];

    return (
        <section className={styles.heroSection}>
            
            <aside className={styles.sidebar}>
                <div className={styles.logoContainer}>
                    <Link href="/">
                        <Image
                            src="/images/OTOBI-LOGO.jpeg"
                            alt="Otobi Logo"
                            width={100}
                            height={40}
                            className={styles.logoImage}
                        />
                    </Link>
                </div>
                <div className={styles.socialLinks}>
                    <a href="#" className={styles.socialLink}>Tw</a>
                    <a href="#" className={styles.socialLink}>in</a>
                    <a href="#" className={styles.socialLink}>Fb</a>
                </div>
            </aside>

            
            <div className={styles.mainContent}>
                
                {slides.map((s, i) => (
                    <div
                        key={s.num}
                        className={`${styles.heroImageWrapper} ${i === current ? styles.imgActive : styles.imgInactive}`}
                    >
                        <Image
                            src={s.image}
                            alt={s.collection}
                            fill
                            className={`${styles.heroBgImage} ${i === current && !transitioning ? styles.kenBurns : ''}`}
                            priority={i === 0}
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                ))}
                <div className={styles.overlayGradient}></div>

                
                <nav className={styles.topNav}>
                    <ul className={styles.navLinks}>
                        <li><Link href="/" className={styles.navLinkActive}>Home</Link></li>
                        <li><Link href="/products" className={styles.navLink}>Products</Link></li>
                        <li><Link href="/about" className={styles.navLink}>About</Link></li>
                        <li><Link href="/services" className={styles.navLink}>Services</Link></li>
                        <li>
                            <button className={styles.navIconBtn} onClick={() => setIsCartOpen(true)}>
                                Cart {cartCount > 0 && `(${cartCount})`}
                            </button>
                        </li>
                    </ul>
                    <div className={styles.navRight}>
                        <LuSearch className={styles.iconSearch} />
                    </div>
                </nav>

                
                <div className={styles.heroShowcase}>
                    <div className={styles.contentGrid}>
                        
                        <div className={styles.subNavigation}>
                            <div className={styles.slideIndicator}>
                                <span className={styles.currentSlide}>/{slide.num}</span>
                                <div className={styles.slideBar}>
                                    <div
                                        className={styles.slideProgress}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                            <ul className={styles.collectionLinks}>
                                {slides.map((s, i) => (
                                    <li
                                        key={s.num}
                                        className={i === current ? styles.collectionActive : ''}
                                        onClick={() => goTo(i)}
                                    >
                                        <span className={styles.collectionDot}></span>
                                        {s.collection}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        
                        <div className={`${styles.heroTitleBox} ${transitioning ? styles.titleOut : styles.titleIn}`}>
                            <h1 className={styles.heroTitle}>
                                {slide.title[0]}<br/>{slide.title[1]}
                            </h1>
                            <p className={styles.heroSubtitle}>{slide.subtitle}</p>
                            <Link href="/products" className={styles.heroCtaBtn}>
                                Shop Now →
                            </Link>
                        </div>
                    </div>

                    
                    <div className={styles.slideDots}>
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={`${styles.slideDot} ${i === current ? styles.slideDotActive : ''}`}
                                onClick={() => goTo(i)}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                
                <div className={styles.bottomGrid}>
                    <div className={styles.eventsBlock}>
                        <h3 className={styles.blockTitle}>PROMOS</h3>
                        <div className={styles.eventsGrid}>
                            <div className={styles.eventItem}>
                                <h4>Bundling Nano Ceramic</h4>
                                <p>JKT - Mon, Sep 01 / 9-5PM</p>
                            </div>
                            <div className={styles.eventItem}>
                                <h4>Special Product Discount</h4>
                                <p>JKT - Fri, Sep 15 / 9-5PM</p>
                            </div>
                        </div>
                        <div className={styles.moreDots}>•••</div>
                    </div>

                    <div className={styles.newsBlock}>
                        <div className={styles.newsContent}>
                            <h3 className={styles.blockTitle}>NEWS</h3>
                            <p className={styles.newsText}>
                                Discover our latest breakthrough in paint protection technology, ensuring your vehicle stays pristine under any condition.
                            </p>
                            <Link href="/blog" className={styles.readMoreLink}>Read More...</Link>
                        </div>
                        <div className={styles.newsImageWrapper}>
                            <Image
                                src="/images/otobi-special-product.png"
                                alt="News Image"
                                fill
                                className={styles.newsImage}
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
