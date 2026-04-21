"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useShop } from "../context/ShopContext";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import styles from "./Cart.module.css";

function CartProductImage({ src, alt }: { src: string; alt: string }) {
    // Use plain <img> for external URLs (Supabase Storage) or legacy local /uploads/ paths
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

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, user } = useShop();
    const router = useRouter();

    const handleCheckout = () => {
        if (!user) {
            router.push("/auth?redirect=/checkout");
        } else {
            router.push("/checkout");
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar />

            <main className={styles.main}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Your Cart</h1>

                    {cart.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Your cart is currently empty.</p>
                            <Link href="/products" className={styles.continueShopping}>
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.cartLayout}>
                            <div className={styles.itemsColumn}>
                                {cart.map((item) => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <Link
                                            href={`/products/${item.id}`}
                                            className={styles.itemLink}
                                            aria-label={`View ${item.title}`}
                                        >
                                            <div className={styles.itemImageWrapper}>
                                                <CartProductImage
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

                            <div className={styles.summaryColumn}>
                                <div className={styles.summaryCard}>
                                    <h2 className={styles.summaryTitle}>Order Summary</h2>

                                    <div className={styles.summaryRow}>
                                        <span>Subtotal</span>
                                        <span>RP {cartTotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Shipping</span>
                                        <span>Calculated at checkout</span>
                                    </div>
                                    <hr className={styles.summaryDivider} />
                                    <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                        <span>Total</span>
                                        <span>RP {cartTotal.toLocaleString('id-ID')}</span>
                                    </div>

                                    {!user && (
                                        <div className={styles.authNotice}>
                                            You must be logged in to checkout.
                                        </div>
                                    )}

                                    <button className={styles.checkoutBtn} onClick={handleCheckout}>
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
