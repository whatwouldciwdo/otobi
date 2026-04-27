import styles from "./Footer.module.css";
import Image from "next/image";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>

                <div className={styles.massiveBrand}>
                    <span className={styles.massiveBrandOutline}>PREMIUM CAR</span><br />
                    CARE
                </div>

                <div className={styles.grid}>

                    <div className={styles.newsletterCol}>
                        <h2 className={styles.brandName}>OTOBI NEWS</h2>
                        <form className={styles.newsletterForm}>
                            <input
                                type="email"
                                placeholder="ENTER YOUR EMAIL"
                                className={styles.newsletterInput}
                                aria-label="Email for newsletter"
                            />
                            <button type="button" className={styles.newsletterBtn}>
                                SUBSCRIBE
                            </button>
                        </form>
                    </div>


                    <div className={styles.linksCol}>
                        <h3 className={styles.colTitle}>COMPANY</h3>
                        <ul className={styles.linkList}>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/products">Products</Link></li>
                            <li><Link href="/blog">Journal</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div className={styles.linksCol}>
                        <h3 className={styles.colTitle}>PRODUCTS & SERVICES</h3>
                        <ul className={styles.linkList}>
                            <li><Link href="/products">Auto Detailing</Link></li>
                            <li><Link href="/products">Car Care Products</Link></li>
                            <li><Link href="/products">Accessories</Link></li>
                        </ul>
                    </div>

                    <div className={styles.linksCol}>
                        <h3 className={styles.colTitle}>SOCIAL</h3>
                        <div className={styles.socials}>
                            <a href="https://www.tiktok.com/@otobiautocare?_r=1&_t=ZS-95lwkygrFzQ" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="TikTok Product">
                                <FaTiktok /> <span className={styles.socialLabel}>TikTok Product</span>
                            </a>
                            <a href="https://www.tiktok.com/@otobi.detailing.s?_r=1&_t=ZS-95lwmPFQipB" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="TikTok Detailing">
                                <FaTiktok /> <span className={styles.socialLabel}>TikTok Detailing</span>
                            </a>
                            <a href="https://www.instagram.com/otobiautocare?igsh=ZjV6anA2cDUxNG56" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram Product">
                                <FaInstagram /> <span className={styles.socialLabel}>Instagram Product</span>
                            </a>
                            <a href="https://www.instagram.com/otobidetailingstudio?igsh=MWV5cmx5MWk2MTRsMQ==" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram Detailing">
                                <FaInstagram /> <span className={styles.socialLabel}>Instagram Detailing</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <div className={styles.bottomLeft}>
                        <Image src="/images/logo.PNG" alt="OTOBI" width={120} height={30} style={{ objectFit: 'contain', marginBottom: '8px' }} />
                        <p>&copy; {new Date().getFullYear()} OTOBI Car Care. All Rights Reserved.</p>
                    </div>
                    <div className={styles.bottomLinks}>
                        <a href="#">Terms & Conditions</a>
                        <a href="#">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
