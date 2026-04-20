"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "../../context/ShopContext";
import { FiHeart, FiShoppingBag, FiCheck } from "react-icons/fi";
import styles from "./ProductDetail.module.css";
import { Product } from "../../data/products";

export default function ProductActions({ product }: { product: Product }) {
    const { addToCart, wishlist, toggleWishlist } = useShop();
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();

    const isWishlisted = wishlist.includes(product.id);

    const handleMinus = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handlePlus = () => {
        setQuantity(quantity + 1);
    };

    const handleAddToCart = () => {
        addToCart(
            {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                weight: product.weight,
            },
            quantity
        );
        // Optional: show a toast or feedback
    };

    const handleBuyNow = () => {
        // Add to cart and immediately go to checkout
        handleAddToCart();
        router.push("/cart");
    };

    return (
        <div className={styles.actionsContainer}>
            <div className={styles.actionsTopRow}>
                <div className={styles.quantityPicker}>
                    <button className={styles.qtyBtn} onClick={handleMinus}>
                        -
                    </button>
                    <span className={styles.qtyValue}>{quantity}</span>
                    <button className={styles.qtyBtn} onClick={handlePlus}>
                        +
                    </button>
                </div>

                <button
                    className={`${styles.actionIconButton} ${isWishlisted ? styles.wishlistedAction : ""}`}
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Toggle Wishlist"
                >
                    <FiHeart className={isWishlisted ? styles.filledHeart : ""} />
                </button>

                <button
                    className={styles.actionIconButton}
                    onClick={handleAddToCart}
                    aria-label="Add to Cart"
                >
                    <FiShoppingBag />
                </button>
            </div>

            <button className={styles.buyButton} onClick={handleBuyNow}>
                BUY NOW
            </button>
        </div>
    );
}
