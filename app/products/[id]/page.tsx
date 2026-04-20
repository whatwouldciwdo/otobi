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

function ProductDetailImage({
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

    const formattedPrice = `RP ${parseFloat(product.price).toLocaleString("id-ID")}`;

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

                            <p className={styles.price}>{formattedPrice}</p>

                            <div className={styles.descriptionBlock}>
                                <h3>Description</h3>
                                <p className={styles.description}>{product.description}</p>
                            </div>

                            <ProductActions product={{
                                id: product.id,
                                title: product.title,
                                price: formattedPrice,
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
