"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactHero from "./ContactHero";
import ContactFormSection from "./ContactFormSection";
import HeadquartersBlock from "./HeadquartersBlock";
import NetworkBlock from "./NetworkBlock";

export default function ContactPage() {
    return (
        <div className="page-wrapper" style={{ backgroundColor: "#fff" }}>
            <Navbar />

            
            <ContactHero />

            
            <ContactFormSection />

            
            <HeadquartersBlock />

            
            <NetworkBlock />

            <Footer />
        </div>
    );
}
