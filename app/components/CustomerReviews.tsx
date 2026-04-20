"use client";

import styles from './CustomerReviews.module.css';
import { FaStar } from 'react-icons/fa';

const REVIEWS = [
    {
        id: 1,
        name: "Arif Setiawan",
        role: "Car Enthusiast",
        rating: 5,
        text: "Produk nanocoating dari Otobi benar-benar luar biasa. Setelah diaplikasikan, cat mobil terlihat lebih basah dan terlindungi sempurna dari debu dan goresan halus. Sangat direkomendasikan!"
    },
    {
        id: 2,
        name: "Budi Santoso",
        role: "Detailing Studio Owner",
        rating: 5,
        text: "Sebagai profesional, saya mencari produk yang konsisten dan tahan lama. Koleksi Autocare Otobi selalu memberikan hasil yang maksimal pada setiap kendaraan pelanggan saya."
    },
    {
        id: 3,
        name: "Reza Pratama",
        role: "Daily Commuter",
        rating: 5,
        text: "Interior cleaner-nya sangat ampuh membersihkan noda pada jok kulit saya tanpa merusak tekstur. Aromanya juga mewah, seperti mobil baru keluar dealer."
    }
];

export default function CustomerReviews() {
    return (
        <section className={styles.section}>
            
            <div className={styles.bgPattern}></div>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <span className={styles.highlight}>TRUSTED</span> BY PROFESSIONALS
                    </h2>
                    <p className={styles.subtitle}>
                        Discover why auto detailing experts and car enthusiasts choose Otobi for ultimate protection and unmatched brilliance.
                    </p>
                </div>

                <div className={styles.grid}>
                    {REVIEWS.map((review) => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.stars}>
                                {[...Array(review.rating)].map((_, i) => (
                                    <FaStar key={i} className={styles.starIcon} />
                                ))}
                            </div>
                            <p className={styles.reviewText}>"{review.text}"</p>
                            <div className={styles.authorArea}>
                                <div className={styles.authorAvatar}>
                                    {review.name.charAt(0)}
                                </div>
                                <div className={styles.authorInfo}>
                                    <h4 className={styles.authorName}>{review.name}</h4>
                                    <span className={styles.authorRole}>{review.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
