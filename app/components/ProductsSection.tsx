"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./ProductsSection.module.css";
import { FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { useShop } from "../context/ShopContext";
import { useEffect, useState, useRef } from "react";

interface DBProduct {
    id: string;
    title: string;
    image: string;
    price: string;
    weight: number;
    rating: number;
    description: string;
}

export default function ProductsSection() {
    const { addToCart } = useShop();
    const [products, setProducts] = useState<DBProduct[]>([]);
    const marqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => setProducts((data.products ?? []).slice(0, 4)))
            .catch(() => { });
    }, []);

    const formatPrice = (price: string) => {
        const num = parseFloat(price);
        return `RP ${num.toLocaleString("id-ID")}`;
    };

    return (
        <section className={styles.section}>
            
            <div className={styles.marqueeContainer}>
                <div className={styles.marquee} ref={marqueeRef}>
                    <span className={styles.marqueeText}>
                        CAR CARE<span className={styles.boldRedefined}>REDEFINED</span> CAR CARE<span className={styles.boldRedefined}>REDEFINED</span> CAR CARE<span className={styles.boldRedefined}>REDEFINED</span>
                    </span>
                    
                    <span className={styles.marqueeText}>
                        CAR CARE<span className={styles.boldRedefined}>REDEFINED</span> CAR CARE<span className={styles.boldRedefined}>REDEFINED</span> CAR CARE<span className={styles.boldRedefined}>REDEFINED</span>
                    </span>
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.productGrid}>
                    {products.map((product) => (
                        <div key={product.id} className={styles.card}>
                            <Link href={`/products/${product.id}`} className={styles.imageWrapper}>
                                <Image
                                    src={product.image}
                                    alt={`Beli ${product.title} - Produk perawatan mobil dari Otobi cabang Jakarta`}
                                    fill
                                    className={styles.image}
                                />
                            </Link>
                            
                            <div className={styles.cardInfo}>
                                <div>
                                    <h3 className={styles.productTitle}>
                                        <Link href={`/products/${product.id}`}>{product.title}</Link>
                                    </h3>
                                    <p className={styles.productPrice}>{formatPrice(product.price)}</p>
                                </div>
                                <button
                                    className={styles.cartBtn}
                                    aria-label="Add to cart"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addToCart({
                                            id: product.id,
                                            title: product.title,
                                            price: formatPrice(product.price),
                                            image: product.image,
                                            weight: product.weight ?? 300,
                                        });
                                    }}
                                >
                                    <FiShoppingBag />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footerRow}>
                    <Link href="/products" className={styles.discoverBtn}>
                        BROWSE ENTIRE COLLECTION
                        <FiArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
}
