import styles from './FeatureBlocks.module.css';

const BLOCKS = [
    {
        id: 'ceramic',
        title: 'CERAMIC COATINGS',
        subtitle: 'ADVANCED QUARTZ TECHNOLOGY',
        description: 'Our core business and true passion. We develop the most advanced quartz coatings, offering unrivaled durability and performance.',
        image: '/images/products/syncro-kit.png', 
        bgStyle: 'white',
        ghostText: 'Q²M',
    },
    {
        id: 'maintenance',
        title: 'INNOVATIVE MAINTENANCE',
        subtitle: 'MAINTAIN WITH EASE',
        description: 'The most extensive range of car care products, carefully designed to match our coatings and preserve your vehicle\'s value.',
        image: '/images/products/bathe-plus.png',
        bgStyle: 'gray',
        ghostText: 'Q²M',
        reverse: true,
    },
    {
        id: 'accessories',
        title: 'ULTIMATE ACCESSORIES',
        subtitle: 'TOOLS FOR PROFESSIONALS',
        description: 'High quality microfiber towels, practical accessories and professional tools designed to optimize your workflow.',
        image: '/images/products/silk-dryer.png',
        bgStyle: 'white',
        ghostText: 'ACCESSORIES',
    },
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
    {
        id: 'purify',
        title: 'REMOVE AND PREVENT',
        subtitle: 'INTERIOR PURIFICATION',
        description: 'Advanced solutions for interior cleaning, sanitization and odor removal, providing a safe and healthy environment.',
        image: '/images/products/interior-detailer.png',
        bgStyle: 'white',
        ghostText: 'PURIFY',
    },
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
                        <div className={styles.textContent}>
                            <h2 className={styles.title}>{block.title}</h2>
                            <p className={styles.description}>{block.description}</p>
                            <button className={styles.discoverBtn}>
                                DISCOVER MORE
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>
                        <div className={styles.imageContent}>
                            <div className={styles.imagePlaceholder}>
                                
                                <div className={styles.fallbackBox}>
                                    {block.title} Image
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
