"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiShoppingBag, FiSearch, FiFilter, FiHeart } from "react-icons/fi";
import styles from "./Products.module.css";
import { useShop } from "../context/ShopContext";
import { useEffect, useState } from "react";

interface DBProduct {
    id: string;
    title: string;
    image: string;
    price: string;
    weight: number;
    rating: number;
    category: string | null;
    description: string;
}

const CATEGORIES = [
    "Semua Produk",
    "Produk Terjual",
    "Spesial Diskon",
    "Preorder",
    "Lap Microfiber",
    "Sarung Tangan Cuci Kendaraan",
    "Kebutuhan Poles",
    "Cuci Kendaraan",
    "Perawatan Body",
    "Perawatan Interior",
    "Perawatan Kaca",
    "Perawatan Ban dan Velg",
    "Restorasi Perawatan Trim",
    "Perawatan Sepeda",
    "Vacuum Cleaner",
    "Sikat dan Kuas Detailing",
    "Coating Kendaraan",
    "Sarung Jok Stir",
    "Parfum Mobil",
    "Pengusir Tikus"
];

function ProductImage({
    src,
    alt,
    className,
}: {
    src: string;
    alt: string;
    className?: string;
}) {
    if (src?.startsWith("/uploads/")) {
        return <img src={src} alt={alt} className={className} />;
    }
    return <Image src={src} alt={alt} fill className={className} />;
}

export default function ProductsPage() {
    const { addToCart, toggleWishlist, wishlist } = useShop();
    const [products, setProducts] = useState<DBProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua Produk");
    const [sortOrder, setSortOrder] = useState("default");
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => {
                setProducts(data.products ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const formatPrice = (price: string) => {
        const num = parseFloat(price);
        return `Rp ${num.toLocaleString("id-ID")}`;
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "Semua Produk"
            || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase())
            || ("" + p.category).includes(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        if (sortOrder === "price-asc") return priceA - priceB;
        if (sortOrder === "price-desc") return priceB - priceA;
        return 0;
    });

    return (
        <div className="page-wrapper" style={{ backgroundColor: "#ffffff" }}>
            <Navbar />

            
            <div className={styles.heroSection}>
                <div className={styles.ghostText}>COLLECTION</div>
                <div className={styles.heroContent}>
                    <h1 className={styles.pageTitle}>ALL PRODUCTS</h1>
                    <p className={styles.pageDescription}>
                        Discover our complete range of premium car care solutions.
                    </p>
                </div>
            </div>

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.layout}>
                        
                        <aside className={`${styles.sidebar} ${isMobileFilterOpen ? styles.mobileSidebarOpen : ""}`}>
                            <div className={styles.sidebarSection}>
                                <h3 className={styles.sidebarTitle}>Categories</h3>
                                <ul className={styles.categoryList}>
                                    {CATEGORIES.map(cat => (
                                        <li key={cat}>
                                            <button
                                                className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.activeCategory : ""}`}
                                                onClick={() => {
                                                    setSelectedCategory(cat);
                                                    setIsMobileFilterOpen(false);
                                                }}
                                            >
                                                <span className={styles.categoryDot}></span>
                                                {cat}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>

                        
                        <div className={styles.contentArea}>
                            
                            <div className={styles.toolbar}>
                                <button
                                    className={styles.mobileFilterToggle}
                                    onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                                >
                                    <FiFilter /> Filters
                                </button>

                                <div className={styles.searchBox}>
                                    <FiSearch className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                </div>
                                <div className={styles.sortBox}>
                                    <select
                                        id="sortOrder"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className={styles.sortSelect}
                                    >
                                        <option value="default">Most Relevant</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            
                            {loading ? (
                                <div className={styles.loadingState}>
                                    <p>Loading collection...</p>
                                </div>
                            ) : sortedProducts.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>No products found in this category.</p>
                                </div>
                            ) : (
                                <div className={styles.productGrid}>
                                    {sortedProducts.map((product) => {
                                        const isWishlisted = wishlist.includes(product.id);
                                        return (
                                            <div key={product.id} className={styles.card}>
                                                <div className={styles.imageWrapper}>
                                                    <Link href={`/products/${product.id}`} className={styles.imageLink}>
                                                        <ProductImage
                                                            src={product.image}
                                                            alt={product.title}
                                                            className={styles.image}
                                                        />
                                                    </Link>
                                                    
                                                    
                                                    <button
                                                        className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleWishlist(product.id);
                                                        }}
                                                        aria-label="Wishlist"
                                                    >
                                                        <FiHeart className={isWishlisted ? styles.filledHeart : ''} />
                                                    </button>
                                                </div>
                                                
                                                <div className={styles.cardInfo}>
                                                    <div>
                                                        <h4 className={styles.productTitle}>
                                                            <Link href={`/products/${product.id}`}>{product.title}</Link>
                                                        </h4>
                                                        <p className={styles.productPrice}>{formatPrice(product.price)}</p>
                                                    </div>
                                                    <button
                                                        className={styles.cartBtn}
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
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
