import { FiDroplet, FiShield, FiStar, FiGrid } from "react-icons/fi";
import styles from "./ServiceCards.module.css";

const services = [
    {
        icon: <FiDroplet />,
        label: "Auto Detailing",
    },
    {
        icon: <FiShield />,
        label: "Nano Ceramic Coating",
    },
    {
        icon: <FiStar />,
        label: "Paint Correction",
    },
    {
        icon: <FiGrid />,
        label: "Browse Product",
    },
    {
        icon: <FiDroplet />,
        label: "Interior Detailing",
    },
    {
        icon: <FiShield />,
        label: "PPF Installation",
    },
];

const CarSilhouette = () => (
    <svg 
        viewBox="0 0 800 300" 
        className={styles.bgSilhouette} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        
        <path d="M50 230 C 80 230, 90 200, 150 190 C 220 180, 270 120, 350 110 C 450 100, 550 140, 620 180 C 670 210, 700 230, 750 230" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        
        <path d="M110 230 A 30 30 0 0 1 170 230" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        
        <path d="M570 230 A 30 30 0 0 1 630 230" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        
        <path d="M170 230 L 570 230" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        <path d="M50 230 L 110 230" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        <path d="M630 230 L 750 230" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        
        <path d="M300 135 C 340 115, 390 120, 440 140 C 480 155, 520 180, 530 185" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        
        
        <path d="M 20 160 L 100 160" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 8" opacity="0.4"/>
        <path d="M 40 180 L 140 180" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 6" opacity="0.3"/>
    </svg>
);

export default function ServiceCards() {
    return (
        <section className={styles.services}>
            <div className={styles.servicesInner}>
                <CarSilhouette />
                
                <div className={styles.grid}>
                    {services.map((service, idx) => (
                        <div key={`service-${idx}`} className={styles.card}>
                            <div className={styles.iconWrapper}>{service.icon}</div>
                            <span className={styles.cardLabel}>{service.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
