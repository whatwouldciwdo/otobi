"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "../context/ShopContext";
import { FiX, FiTrash2, FiShoppingBag } from "react-icons/fi";
import styles from "./CartDrawer.module.css"; 
import { useEffect, useMemo, useState } from "react";

type WishlistProduct = {
    id: string;
    title: string;
    image: string;
    price: string;
    weight?: number;
};

function WishlistProductImage({ src, alt }: { src: string; alt: string }) {
    if (src.startsWith("/uploads/") || src.startsWith("http")) {
        return <img src={src} alt={alt} className={styles.itemImage} />;
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className={styles.itemImage}
        />
    );
}

export default function WishlistDrawer() {
    const { isWishlistOpen, setIsWishlistOpen, wishlist, toggleWishlist, addToCart } = useShop();
    const router = useRouter();
    const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);

    
    useEffect(() => {
        if (isWishlistOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isWishlistOpen]);

    useEffect(() => {
        if (wishlist.length === 0) {
            setWishlistProducts([]);
            return;
        }

        const controller = new AbortController();

        fetch(`/api/products?ids=${encodeURIComponent(wishlist.join(","))}`, {
            signal: controller.signal,
        })
            .then((res) => res.json())
            .then((data) => {
                setWishlistProducts(data.products ?? []);
            })
            .catch(() => {
                setWishlistProducts([]);
            });

        return () => controller.abort();
    }, [wishlist]);

    if (!isWishlistOpen) return null;

    const wishlistItems = useMemo(() => {
        const productMap = new Map(wishlistProducts.map((product) => [product.id, product]));
        return wishlist
            .map((id) => productMap.get(id))
            .filter((product): product is WishlistProduct => product !== undefined);
    }, [wishlist, wishlistProducts]);

    const handleAddToCart = (item: WishlistProduct) => {
        addToCart({
            id: item.id,
            title: item.title,
            price: `Rp ${parseFloat(item.price).toLocaleString("id-ID")}`,
            image: item.image,
            weight: item.weight ?? 300,
        });
    };

    return (
        <>
            <div className={styles.overlay} onClick={() => setIsWishlistOpen(false)} />

            <div className={`${styles.drawer} ${isWishlistOpen ? styles.open : ""}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Your Wishlist</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setIsWishlistOpen(false)}
                        aria-label="Close wishlist"
                    >
                        <FiX />
                    </button>
                </div>

                <div className={styles.content}>
                    {wishlistItems.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>You haven't added anything to your wishlist yet.</p>
                            <button
                                className={styles.continueShopping}
                                onClick={() => {
                                    setIsWishlistOpen(false);
                                    router.push("/products");
                                }}
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className={styles.itemsList}>
                            {wishlistItems.map((item) => (
                                <div key={item.id} className={styles.cartItem}>
                                    <Link
                                        href={`/products/${item.id}`}
                                        className={styles.itemLink}
                                        aria-label={`View ${item.title}`}
                                        onClick={() => setIsWishlistOpen(false)}
                                    >
                                        <div className={styles.itemImageWrapper}>
                                            <WishlistProductImage
                                                src={item.image}
                                                alt={item.title}
                                            />
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <h3 className={styles.itemTitle}>{item.title}</h3>
                                            <p className={styles.itemPrice}>
                                                Rp {parseFloat(item.price).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </Link>

                                    <div className={styles.itemActions} style={{ marginTop: "auto" }}>
                                        <button
                                            className={styles.removeBtn}
                                            style={{ padding: 0, fontSize: "16px", color: "#888" }}
                                            onClick={() => toggleWishlist(item.id)}
                                            aria-label="Remove from wishlist"
                                        >
                                            <FiTrash2 style={{ marginRight: "6px" }} /> Remove
                                        </button>

                                        <button
                                            className={styles.viewCartBtn}
                                            style={{ height: "36px", padding: "0 16px", fontSize: "13px", flex: "none" }}
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <FiShoppingBag style={{ marginRight: "6px" }} /> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
