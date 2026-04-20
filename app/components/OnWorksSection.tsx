"use client";

import Image from "next/image";
import styles from "./OnWorksSection.module.css";
import { FiPlay, FiStar } from "react-icons/fi";
import { useState } from "react";

const testimonial = {
    quote: "Nano Ceramic-nya mantap banget, mobil saya jadi lebih gampang dibersihkan dan catnya keliatan lebih dalam. Tim OTOBI sangat profesional dan on time.",
    name: "Rizky Aditya",
    car: "BMW 320i — Nano Ceramic Coating",
    rating: 5,
};

const trustBadges = [
    { label: "9H+ Hardness", sub: "Ceramic Grade" },
    { label: "3 Tahun", sub: "Garansi Coating" },
    { label: "ISO", sub: "Certified Studio" },
];

const galleryItems = [
    {
        image: "/images/nano-ceramic-coating-otobi.png",
        label: "Nano Ceramic | BMW 3 Series",
    },
    {
        image: "/images/otobi-special-product.png",
        label: "PPF Install | Toyota Alphard",
    },
];

export default function OnWorksSection() {
    const [playing, setPlaying] = useState(false);

    return (
        <section className={styles.section}>
            <div className={styles.container}>

                
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionLabel}>BEHIND THE SCENES</p>
                    <h2 className={styles.sectionTitle}>On Works</h2>
                </div>

                
                <div className={styles.mainLayout}>

                    
                    <div
                        className={styles.videoWrapper}
                        onClick={() => setPlaying(true)}
                    >
                        <Image
                            src="/images/auto-detailing-otobi.png"
                            alt="Video proses nano ceramic coating dan auto detailing oleh teknisi profesional Otobi"
                            fill
                            className={`${styles.videoThumb} ${playing ? styles.hidden : ""}`}
                        />

                        {!playing && (
                            <div className={styles.videoOverlay}>
                                <div className={styles.scanLine} />
                                <div className={styles.playBtn}>
                                    <FiPlay className={styles.playIcon} />
                                </div>
                                <div className={styles.videoBadge}>
                                    <span className={styles.videoBadgeDot} />
                                    Proses Live
                                </div>
                            </div>
                        )}

                        {playing && (
                            <video
                                className={styles.video}
                                autoPlay
                                controls
                                src="/videos/detailing-process.mp4"
                            />
                        )}
                    </div>

                    
                    <div className={styles.rightCol}>

                        
                        <div className={styles.testimonialCard}>
                            <div className={styles.testimonialStars}>
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <FiStar key={i} className={styles.starIcon} />
                                ))}
                            </div>
                            <p className={styles.testimonialQuote}>&ldquo;{testimonial.quote}&rdquo;</p>
                            <div className={styles.testimonialFooter}>
                                <div className={styles.testimonialAvatar}>
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <p className={styles.testimonialName}>{testimonial.name}</p>
                                    <p className={styles.testimonialCar}>{testimonial.car}</p>
                                </div>
                            </div>
                        </div>

                        
                        <div className={styles.trustBadges}>
                            {trustBadges.map((b) => (
                                <div key={b.label} className={styles.trustBadge}>
                                    <span className={styles.trustValue}>{b.label}</span>
                                    <span className={styles.trustSub}>{b.sub}</span>
                                </div>
                            ))}
                        </div>

                        
                        <div className={styles.galleryGrid}>
                            {galleryItems.map((item, i) => (
                                <div key={i} className={styles.galleryItem}>
                                    <div className={styles.galleryThumbWrapper}>
                                        <Image
                                            src={item.image}
                                            alt={item.label}
                                            fill
                                            className={styles.galleryThumb}
                                        />
                                        <div className={styles.galleryOverlay}>
                                            <span className={styles.galleryLabel}>{item.label}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
