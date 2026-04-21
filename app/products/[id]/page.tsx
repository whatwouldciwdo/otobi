import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FaStar } from "react-icons/fa";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import styles from "./ProductDetail.module.css";
import ProductActions from "./ProductActions";

interface DBProduct {
    id: string;
    title: string;
    image: string;
    price: string;
    rating: number;
    category: string | null;
    description: string;
    weight: number;
}

interface ActivePromo {
    id: string;
    discountPct: number;
    type: string;
    categories: string | null;
    productIds: string | null;
}

function ProductDetailImage({
    src,
    alt,
    className,
}: {
    src: string;
    alt: string;
    className?: string;
}) {
    if (src?.startsWith("/uploads/") || src?.startsWith("http")) {
        return <img src={src} alt={alt} className={className} />;
    }

    return <Image src={src} alt={alt} fill className={className} priority />;
}

async function getProduct(id: string): Promise<DBProduct | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/products/${id}`, {
            cache: "no-store",
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.product ?? null;
    } catch {
        return null;
    }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.id);

    if (!product) {
        notFound();
    }

    let activePromos: ActivePromo[] = [];
    try {
        const promosRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/promos`, { cache: "no-store" });
        if (promosRes.ok) {
            const data = await promosRes.json();
            activePromos = data.promos ?? [];
        }
    } catch {}

    let applicablePromo = null;
    for (const promo of activePromos) {
        if (promo.type === "ALL") { applicablePromo = promo; break; }
        if (promo.type === "CATEGORY" && promo.categories) {
            try {
                const cats = JSON.parse(promo.categories) as string[];
                if (product.category && cats.some(c => c.toLowerCase() === product.category!.toLowerCase())) { applicablePromo = promo; break; }
            } catch {}
        }
        if (promo.type === "PRODUCTS" && promo.productIds) {
            try {
                const ids = JSON.parse(promo.productIds) as string[];
                if (ids.includes(product.id)) { applicablePromo = promo; break; }
            } catch {}
        }
    }

    let discountedPrice = null;
    if (applicablePromo) {
        const num = parseFloat(product.price);
        discountedPrice = Math.floor(num * (1 - applicablePromo.discountPct / 100));
    }

    const formattedPrice = `RP ${parseFloat(product.price).toLocaleString("id-ID")}`;
    const formattedDiscounted = discountedPrice !== null ? `RP ${discountedPrice.toLocaleString("id-ID")}` : null;

    return (
        <div className="page-wrapper">
            <Navbar />

            <main className={styles.main}>
                <div className={styles.container}>
                    <Link href="/products" className={styles.backLink}>
                        <FiArrowLeft className={styles.backIcon} /> Back to Products
                    </Link>

                    <div className={styles.productLayout}>
                        {/* Left: Image Viewer */}
                        <div className={styles.imageColumn}>
                            <div className={styles.imageWrapper}>
                                <ProductDetailImage
                                    src={product.image}
                                    alt={product.title}
                                    className={styles.image}
                                />
                            </div>
                        </div>

                        {/* Right: Product Info */}
                        <div className={styles.infoColumn}>
                            <div className={styles.categoryBadge}>{product.category ?? "PREMIUM CARE"}</div>
                            <h1 className={styles.title}>{product.title}</h1>

                            <div className={styles.ratingRow}>
                                <div className={styles.stars}>
                                    {[...Array(product.rating)].map((_, i) => (
                                        <FaStar key={i} className={styles.starIcon} />
                                    ))}
                                </div>
                                <span className={styles.reviewCount}>(128 Reviews)</span>
                            </div>

                            {discountedPrice !== null ? (
                                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "24px" }}>
                                    <p className={styles.price} style={{ color: "#a0a5ad", textDecoration: "line-through", fontSize: "1.2rem", margin: 0 }}>
                                        {formattedPrice}
                                    </p>
                                    <p className={styles.price} style={{ color: "#111", margin: 0 }}>
                                        {formattedDiscounted}
                                    </p>
                                </div>
                            ) : (
                                <p className={styles.price}>{formattedPrice}</p>
                            )}

                            <div className={styles.descriptionBlock}>
                                <h3>Description</h3>
                                <p className={styles.description}>{product.description}</p>
                            </div>

                            <ProductActions product={{
                                id: product.id,
                                title: product.title,
                                price: formattedDiscounted ?? formattedPrice,
                                image: product.image,
                                rating: product.rating,
                                description: product.description,
                                weight: product.weight || 300,
                            }} />

                            <div className={styles.guaranteeBox}>
                                <p><FiCheckCircle className={styles.checkIcon} /> Secure Checkout via Xendit</p>
                                <p><FiCheckCircle className={styles.checkIcon} /> 100% Authentic OTOBI Product</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
