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

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AutoBodyShop",
        "name": "Otobi Premium Auto Detailing",
        "image": "https://otomobi.co.id/images/OTOBI-LOGO.jpeg",
        "url": "https://otomobi.co.id",
        "telephone": "+628111234567",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jl. Taman Sari No. 1",
            "addressLocality": "Jakarta Barat",
            "addressRegion": "DKI Jakarta",
            "postalCode": "11110",
            "addressCountry": "ID"
        },
        "description": "Premium produk premium perawatan kendaraan, ceramic coating, dan car care Indonesia.",
        "priceRange": "$$",
    };

    return (
        <div className="page-wrapper" style={{ backgroundColor: '#ffffff' }}>
            <Script
                id="local-business-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            
            <Navbar />

            
            {!videoGone && (
                <VideoHero onScrollPast={handleVideoScrollPast} />
            )}

            
            <HeroV2 />

            
            <BrandStatement />

            
            <FeatureBlocks />

            
            <ProductsSection />

            
            <CustomerReviews />

            
            <JournalSection />

            
            <Footer />
        </div>
    );
}
