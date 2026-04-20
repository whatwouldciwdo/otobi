"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './DetailingProcessSection.module.css';

const StarDot = ({ active }: { active: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        fill={active ? 'var(--color-primary)' : 'rgba(255,255,255,0.25)'}
        xmlns="http://www.w3.org/2000/svg"
        className={`${styles.starDot} ${active ? styles.starDotActive : ''}`}
    >
        <path d="M12 2 C12 2, 13.5 8.5, 22 12 C13.5 15.5, 12 22, 12 22 C12 22, 10.5 15.5, 2 12 C10.5 8.5, 12 2, 12 2 Z" />
    </svg>
);

const CardSilhouette = () => (
    <svg
        viewBox="0 0 340 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.cardSilhouette}
    >
        
        <circle cx="110" cy="110" r="70" stroke="white" strokeWidth="1.5" opacity="0.08" />
        <circle cx="110" cy="110" r="50" stroke="white" strokeWidth="1.2" opacity="0.1" />
        <circle cx="110" cy="110" r="30" stroke="white" strokeWidth="1" opacity="0.12" />
        <circle cx="110" cy="110" r="10" fill="white" opacity="0.08" />

        
        <line x1="110" y1="40" x2="110" y2="0" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.1" />
        <rect x="90" y="-4" width="40" height="16" rx="8" fill="white" opacity="0.08" />

        
        <path d="M110 110 Q145 75 180 110" stroke="white" strokeWidth="1" opacity="0.12" fill="none" strokeLinecap="round" />
        <path d="M110 110 Q75 145 110 180" stroke="white" strokeWidth="1" opacity="0.12" fill="none" strokeLinecap="round" />
        <path d="M110 110 Q75 75 40 110" stroke="white" strokeWidth="1" opacity="0.1" fill="none" strokeLinecap="round" />
        <path d="M110 110 Q145 145 110 180" stroke="white" strokeWidth="1" opacity="0.08" fill="none" strokeLinecap="round" />

        
        {[200,215,230,245,260].map((x, i) => (
            <g key={i}>
                <circle cx={x} cy={60 + i * 18} r="2" fill="white" opacity="0.07" />
                <circle cx={x + 18} cy={66 + i * 18} r="1.5" fill="white" opacity="0.05" />
                <circle cx={x + 8} cy={72 + i * 14} r="1" fill="white" opacity="0.06" />
            </g>
        ))}

        
        <path
            d="M200 155 C220 155 240 140 270 138 C295 136 315 148 330 155 L330 170 L200 170 Z"
            stroke="white" strokeWidth="1.2" fill="none" opacity="0.1"
        />
        <path
            d="M220 155 C230 140 250 132 270 132 C285 132 300 140 310 155"
            stroke="white" strokeWidth="1" fill="none" opacity="0.08"
        />
        
        <circle cx="232" cy="170" r="14" stroke="white" strokeWidth="1.2" fill="none" opacity="0.1" />
        <circle cx="318" cy="170" r="14" stroke="white" strokeWidth="1.2" fill="none" opacity="0.1" />
    </svg>
);

const steps = [
    {
        title: "1. Auto Detailing",
        image: "/images/OTOBI-HERO-IMAGE.png",
        points: [
            "Pencucian eksterior menyeluruh menggunakan metode dua ember aman cat",
            "Penghilangan kontaminan seperti aspal, getah pohon, dan deposit mineral",
            "Pembersihan mendetail pada sela-sela pintu, velg, dan celah panel"
        ]
    },
    {
        title: "2. Nano Ceramic Coating",
        image: "/images/OTOBI-HERO-IMAGE.png",
        points: [
            "Pelapisan formula Nano Ceramic 9H+ di seluruh panel eksterior kendaraan",
            "Proses curing profesional untuk memastikan ikatan molekul yang kuat dan tahan lama",
            "Perlindungan jangka panjang dari sinar UV, noda air, dan kotoran ekstrem"
        ]
    },
    {
        title: "3. Paint Correction",
        image: "/images/OTOBI-HERO-IMAGE.png",
        points: [
            "Penghilangan baret halus (swirl marks) dan jaring laba-laba visual pada cat",
            "Restorasi kedalaman warna asli dan tingkat kilap cat maksimal",
            "Penghalusan permukaan secara mikroskopis sebagai landasan coating sempurna"
        ]
    },
    {
        title: "4. Interior Detailing",
        image: "/images/OTOBI-HERO-IMAGE.png",
        points: [
            "Pembersihan mendalam dashboard, jok, dan seluruh panel kabin kendaraan",
            "Perawatan kulit (leather conditioning) untuk menjaga kelembapan dan kilau jok",
            "Sanitasi dan penghilangan bau dengan teknologi ozon atau steam cleaning"
        ]
    },
    {
        title: "5. PPF Installation",
        image: "/images/OTOBI-HERO-IMAGE.png",
        points: [
            "Pemasangan Paint Protection Film (PPF) TPU self-healing premium di area rawan baret",
            "Pemotongan presisi laser untuk kesesuaian sempurna di setiap lekukan panel",
            "Proteksi fisik jangka panjang dari benturan kerikil, goresan, dan abrasi jalan"
        ]
    }
];

const AUTO_INTERVAL = 5000; 

export default function DetailingProcessSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const goTo = useCallback((index: number) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsAnimating(false);
        }, 200);
    }, [isAnimating]);

    const handleNext = useCallback(() => {
        goTo((currentIndex + 1) % steps.length);
    }, [currentIndex, goTo]);

    const handlePrev = useCallback(() => {
        goTo((currentIndex - 1 + steps.length) % steps.length);
    }, [currentIndex, goTo]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % steps.length);
        }, AUTO_INTERVAL);
    }, []);

    useEffect(() => {
        resetTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [resetTimer]);

    const currentStep = steps[currentIndex];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionLabel}>PROSES KAMI</p>
                    <h2 className={styles.sectionTitle}>Detailing Process</h2>
                </div>

                <div className={styles.contentWrapper}>
                    
                    <div className={styles.imageCol}>
                        <div className={`${styles.imageMask} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
                            <Image
                                src={currentStep.image}
                                alt={currentStep.title}
                                fill
                                className={styles.image}
                            />
                            
                            <div className={styles.imageOverlay} />
                        </div>
                    </div>

                    
                    <div className={styles.cardCol}>
                        <div className={`${styles.infoCard} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
                            
                            <CardSilhouette />

                            <h3 className={styles.cardTitle}>{currentStep.title}</h3>

                            <div className={styles.pointsList}>
                                {currentStep.points.map((point, idx) => (
                                    <div key={idx} className={styles.pointItem}>
                                        <span className={styles.pointBullet} />
                                        {point}
                                    </div>
                                ))}
                            </div>

                            <div className={styles.cardFooter}>
                                
                                <div className={styles.navButtons}>
                                    <button
                                        onClick={() => { handlePrev(); resetTimer(); }}
                                        className={styles.navBtn}
                                        aria-label="Previous step"
                                    >
                                        <FiChevronLeft />
                                    </button>
                                    <button
                                        onClick={() => { handleNext(); resetTimer(); }}
                                        className={styles.navBtn}
                                        aria-label="Next step"
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>

                                
                                <div className={styles.dots}>
                                    {steps.map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={styles.dotBtn}
                                            onClick={() => { goTo(idx); resetTimer(); }}
                                            aria-label={`Go to step ${idx + 1}`}
                                        >
                                            <StarDot active={idx === currentIndex} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            
                            <div className={styles.progressBar}>
                                <div
                                    key={currentIndex}
                                    className={styles.progressFill}
                                    style={{ animationDuration: `${AUTO_INTERVAL}ms` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
