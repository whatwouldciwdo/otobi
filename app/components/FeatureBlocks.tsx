"use client";

import styles from './FeatureBlocks.module.css';
import Image from 'next/image';
import { motion } from 'framer-motion';

const BLOCKS = [
    {
        id: 'ceramic',
        title: 'CERAMIC COATINGS',
        subtitle: 'ADVANCED QUARTZ TECHNOLOGY',
        description: 'Our core business and true passion. We develop the most advanced quartz coatings, offering unrivaled durability and performance.',
        image: '/images/OTOBI DETAILING STUDIO-2290.jpg.webp',
        bgStyle: 'white',
        ghostText: 'Q²M',
    },
    {
        id: 'maintenance',
        title: 'INNOVATIVE MAINTENANCE',
        subtitle: 'MAINTAIN WITH EASE',
        description: 'The most extensive range of car care products, carefully designed to match our coatings and preserve your vehicle\'s value.',
        image: '/images/innovative-otobi.webp',
        bgStyle: 'gray',
        ghostText: 'Q²M',
        reverse: true,
        objectPosition: 'center bottom',
    },
    {
        id: 'accessories',
        title: 'ULTIMATE ACCESSORIES',
        subtitle: 'TOOLS FOR PROFESSIONALS',
        description: 'High quality microfiber towels, practical accessories and professional tools designed to optimize your workflow.',
        image: '/images/accessoris-otobi.webp',
        bgStyle: 'white',
        ghostText: 'ACCESSORIES',
    },
    /*
    {
        id: 'ppf',
        title: 'UNCOMPROMISED PAINT PROTECTION',
        subtitle: 'PPF SOLUTIONS',
        description: 'Premium quality paint protection film, offering self-healing properties and extreme gloss, ensuring your vehicle looks perfect for years.',
        image: '/images/products/ppf-protect.png',
        bgStyle: 'yellow',
        ghostText: 'PPF',
        reverse: true,
    },
    */
    {
        id: 'purify',
        title: 'REMOVE AND PREVENT',
        subtitle: 'INTERIOR PURIFICATION',
        description: 'Advanced solutions for interior cleaning, sanitization and odor removal, providing a safe and healthy environment.',
        image: '/images/otobi-allpurpose.webp',
        bgStyle: 'white',
        ghostText: 'PURIFY',
    },
    /*
    {
        id: 'marine',
        title: 'MARINE WARRIOR',
        subtitle: 'YACHT & BOAT CARE',
        description: 'Dedicated quartz marine coatings and maintenance products. Built to withstand salt water, UV and harsh marine environments.',
        image: '/images/products/marine-coat.png',
        bgStyle: 'gray',
        ghostText: 'Q²R',
        reverse: true,
    }
    */
];

export default function FeatureBlocks() {
    return (
        <section className={styles.container}>
            {BLOCKS.map((block) => (
                <div 
                    key={block.id} 
                    className={`${styles.block} ${styles[block.bgStyle]} ${block.reverse ? styles.reverse : ''}`}
                >
                    
                    <div className={styles.bgGraphic}></div>
                    
                    <div className={styles.ghostText}>{block.ghostText}</div>
                    
                    <div className={styles.contentWrapper}>
                        <motion.div 
                            className={styles.textContent}
                            initial={{ opacity: 0, x: block.reverse ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h2 className={styles.title}>{block.title}</h2>
                            <p className={styles.description}>{block.description}</p>
                            <button className={styles.discoverBtn}>
                                DISCOVER MORE
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </motion.div>
                        <motion.div 
                            className={styles.imageContent}
                            initial={{ opacity: 0, x: block.reverse ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className={styles.imagePlaceholder}>
                                {block.image ? (
                                    <Image
                                        src={block.image}
                                        alt={block.title}
                                        fill
                                        className={styles.blockImage}
                                        style={{ objectPosition: (block as any).objectPosition ?? 'center' }}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className={styles.fallbackBox}>
                                        {block.title} Image
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            ))}
        </section>
    );
}
