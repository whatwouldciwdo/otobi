"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar from "./components/Navbar";
import VideoHero from "./components/VideoHero";
import HeroV2 from "./components/HeroV2";
import BrandStatement from "./components/BrandStatement";
import FeatureBlocks from "./components/FeatureBlocks";
import ProductsSection from "./components/ProductsSection";
import CustomerReviews from "./components/CustomerReviews";
import JournalSection from "./components/JournalSection";
import Footer from "./components/Footer";
import Script from "next/script";
import ScrollReveal from "./components/ScrollReveal";

export default function Home() {
    const [videoGone, setVideoGone] = useState(false);

    const handleVideoScrollPast = useCallback(() => {
        setVideoGone(true);
        
        window.scrollTo({ top: 0 });
    }, []);

    
    useEffect(() => {
        if (!videoGone) return;
        const preventNegativeScroll = (e: WheelEvent) => {
            if (window.scrollY <= 0 && e.deltaY < 0) e.preventDefault();
        };
        const preventTouchNegative = (e: TouchEvent) => {
            if (window.scrollY <= 0) e.preventDefault();
        };
        document.addEventListener("wheel", preventNegativeScroll, { passive: false });
        document.addEventListener("touchmove", preventTouchNegative, { passive: false });
        return () => {
            document.removeEventListener("wheel", preventNegativeScroll);
            document.removeEventListener("touchmove", preventTouchNegative);
        };
    }, [videoGone]);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://otobi.id";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AutoPartsStore",
        "name": "OTOBI Car Care",
        "image": `${BASE_URL}/images/OTOBI-LOGO.jpeg`,
        "url": BASE_URL,
        "telephone": "+6281781215",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jl. Raya Duri Kosambi No.8a, RT.13/RW.7",
            "addressLocality": "Jakarta Barat",
            "addressRegion": "DKI Jakarta",
            "postalCode": "11750",
            "addressCountry": "ID"
        },
        "description": "Brand produk perawatan kendaraan premium di Indonesia — ceramic coating, car care, dan aksesori otomotif terbaik.",
        "priceRange": "$$",
        "sameAs": [
            "https://www.instagram.com/otobi_id",
        ]
    };

    return (
        <div className="page-wrapper" style={{ backgroundColor: '#ffffff' }}>
            <Script
                id="local-business-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            
            <Navbar forceScrolled={videoGone} />

            
            {!videoGone && (
                <VideoHero onScrollPast={handleVideoScrollPast} />
            )}

            <ScrollReveal y={30} duration={1}>
                <HeroV2 />
            </ScrollReveal>

            <ScrollReveal y={50} delay={0.1}>
                <BrandStatement />
            </ScrollReveal>

            <ScrollReveal y={50} delay={0.1}>
                <FeatureBlocks />
            </ScrollReveal>

            <ScrollReveal y={50} delay={0.1}>
                <ProductsSection />
            </ScrollReveal>

            <ScrollReveal y={50} delay={0.1}>
                <CustomerReviews />
            </ScrollReveal>

            <ScrollReveal y={50} delay={0.1}>
                <JournalSection />
            </ScrollReveal>

            <ScrollReveal y={30} delay={0.1}>
                <Footer />
            </ScrollReveal>
        </div>
    );
}
