"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "../context/ShopContext";
import { FiX, FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import styles from "./CartDrawer.module.css";
import { useEffect } from "react";

function DrawerProductImage({ src, alt }: { src: string; alt: string }) {
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

export default function CartDrawer() {
    const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, cartTotal, user } = useShop();
    const router = useRouter();

    
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        setIsCartOpen(false);
        if (!user) {
            router.push("/auth?redirect=/checkout");
        } else {
            router.push("/checkout");
        }
    };

    return (
        <>
            <div className={styles.overlay} onClick={() => setIsCartOpen(false)} />

            <div className={`${styles.drawer} ${isCartOpen ? styles.open : ""}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Your Cart</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setIsCartOpen(false)}
                        aria-label="Close cart"
                    >
                        <FiX />
                    </button>
                </div>

                <div className={styles.content}>
                    {cart.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Your cart is currently empty.</p>
                            <button
                                className={styles.continueShopping}
                                onClick={() => {
                                    setIsCartOpen(false);
                                    router.push("/products");
                                }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className={styles.itemsList}>
                            {cart.map((item) => (
                                <div key={item.id} className={styles.cartItem}>
                                    <Link
                                        href={`/products/${item.id}`}
                                        className={styles.itemLink}
                                        aria-label={`View ${item.title}`}
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        <div className={styles.itemImageWrapper}>
                                            <DrawerProductImage
                                                src={item.image}
                                                alt={item.title}
                                            />
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <h3 className={styles.itemTitle}>{item.title}</h3>
                                            <p className={styles.itemPrice}>{item.price}</p>
                                        </div>
                                    </Link>

                                    <div className={styles.itemActions}>
                                        <div className={styles.quantityControl}>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <FiMinus />
                                            </button>
                                            <span className={styles.qtyValue}>{item.quantity}</span>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFromCart(item.id)}
                                            aria-label="Remove item"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span className={styles.totalPrice}>RP {cartTotal.toLocaleString('id-ID')}</span>
                        </div>
                        <p className={styles.taxNotice}>Shipping & taxes calculated at checkout</p>

                        <div className={styles.footerActions}>
                            <button
                                className={styles.viewCartBtn}
                                onClick={() => {
                                    setIsCartOpen(false);
                                    router.push("/cart");
                                }}
                            >
                                View Cart
                            </button>
                            <button className={styles.checkoutBtn} onClick={handleCheckout}>
                                Checkout Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
