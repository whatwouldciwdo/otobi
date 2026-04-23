"use client";

import Link from "next/link";
import Image from "next/image";
import { FiShoppingBag, FiHeart, FiUser, FiMenu, FiX, FiSearch } from "react-icons/fi";
import styles from "./Navbar.module.css";
import { useShop } from "../context/ShopContext";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

interface NavbarProps {
    forceScrolled?: boolean;
}

export default function Navbar({ forceScrolled = false }: NavbarProps = {}) {
    const { cartCount, wishlist, setIsCartOpen, setIsWishlistOpen, user } = useShop();
    const wishlistCount = wishlist.length;
    const router = useRouter();
    const pathname = usePathname();

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    
    const isDarkHero = pathname === "/";

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const currentNavItems = [...navItems];
    if (user && user.role === "ADMIN") {
        currentNavItems.push({ label: "Admin", href: "/admin" });
    }

    const activeScrolled = scrolled || forceScrolled;

    return (
        <>
            <nav className={`${styles.navbar} ${isDarkHero && !activeScrolled ? styles.navbarDark : styles.navbarLight} ${activeScrolled ? styles.scrolled : ""}`}>
                <div className={styles.inner}>
                    
                    <Link href="/" className={styles.logo}>
                        <Image src="/images/logo.png" alt="OTOBI" width={140} height={35} style={{ objectFit: 'contain' }} />
                    </Link>

                    
                    <ul className={styles.navLinks}>
                        {currentNavItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    
                    <div className={styles.navRight}>
                        <button
                            className={styles.iconBtn}
                            aria-label="Search"
                            onClick={() => setSearchOpen(v => !v)}
                        >
                            <FiSearch />
                        </button>

                        <button
                            className={styles.iconBtn}
                            aria-label="Wishlist"
                            onClick={() => setIsWishlistOpen(true)}
                        >
                            <FiHeart />
                            {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
                        </button>

                        <button
                            className={styles.iconBtn}
                            aria-label="Cart"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <FiShoppingBag />
                            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                        </button>

                        <button
                            className={`${styles.iconBtn} ${styles.accountBtn}`}
                            aria-label="Account"
                            onClick={() => router.push(user ? "/account" : "/auth")}
                        >
                            <FiUser />
                            {user && <span className={styles.accountDot} />}
                        </button>

                        
                        <button
                            className={styles.mobileMenuBtn}
                            aria-label="Toggle menu"
                            onClick={() => setMobileOpen(v => !v)}
                        >
                            {mobileOpen ? <FiX /> : <FiMenu />}
                        </button>
                    </div>
                </div>

                
                {searchOpen && (
                    <div className={styles.searchBar}>
                        <div className={styles.searchInner}>
                            <FiSearch className={styles.searchBarIcon} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search products..."
                                className={styles.searchInput}
                            />
                            <button className={styles.closeSearch} onClick={() => setSearchOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            
            {mobileOpen && (
                <div className={styles.mobileDrawer}>
                    <ul className={styles.mobileLinks}>
                        {currentNavItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`${styles.mobileLink} ${pathname === item.href ? styles.mobileLinkActive : ""}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}
