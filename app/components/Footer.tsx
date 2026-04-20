import styles from "./Footer.module.css";
import { FaInstagram, FaYoutube, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                
                <div className={styles.massiveBrand}>
                    <span className={styles.massiveBrandOutline}>PREMIUM AUTO</span><br />
                    DETAILING
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
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Our Story</a></li>
                            <li><a href="#">Journal</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>

                    <div className={styles.linksCol}>
                        <h3 className={styles.colTitle}>PRODUCTS</h3>
                        <ul className={styles.linkList}>
                            <li><a href="#">Ceramic Coatings</a></li>
                            <li><a href="#">Maintenance</a></li>
                            <li><a href="#">Marine</a></li>
                            <li><a href="#">Accessories</a></li>
                        </ul>
                    </div>

                    <div className={styles.linksCol}>
                        <h3 className={styles.colTitle}>SOCIAL</h3>
                        <div className={styles.socials}>
                            <a href="#" className={styles.socialIcon} aria-label="Instagram"><FaInstagram /></a>
                            <a href="#" className={styles.socialIcon} aria-label="YouTube"><FaYoutube /></a>
                            <a href="#" className={styles.socialIcon} aria-label="Facebook"><FaFacebookF /></a>
                            <a href="#" className={styles.socialIcon} aria-label="LinkedIn"><FaLinkedinIn /></a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <div className={styles.bottomLeft}>
                        <span className={styles.logoText}>OTOBI</span>
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
