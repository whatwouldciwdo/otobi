"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useShop } from "../context/ShopContext";
import styles from "./AdminLayout.module.css";
import {
  FiHome,
  FiPieChart,
  FiTag,
  FiFileText,
  FiBox,
  FiEdit3,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiBell,
  FiMoon,
  FiSun,
  FiX,
  FiCommand,
  FiUsers,
  FiLink,
} from "react-icons/fi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isInitialized } = useShop();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      if (!user || user.role !== "ADMIN") {
        router.replace("/auth?redirect=/admin");
      }
    }
  }, [user, router, isInitialized]);

  if (!isInitialized || !user || user.role !== "ADMIN") return null;

  const mainNavItems = [
    { label: "Dashboard", href: "/admin", icon: <FiHome /> },
    { label: "Analytics", href: "/admin/analytics", icon: <FiPieChart /> },
    { label: "Promos", href: "/admin/promos", icon: <FiTag /> },
    { label: "Reports", href: "/admin/reports", icon: <FiFileText /> },
    { label: "Products", href: "/admin/products", icon: <FiBox /> },
    { label: "Blogs", href: "/admin/blogs", icon: <FiEdit3 /> },
    { label: "Users", href: "/admin/users", icon: <FiUsers /> },
    { label: "Links", href: "/admin/links", icon: <FiLink /> },
  ];

  const otherNavItems = [
    { label: "Settings", href: "#settings", icon: <FiSettings /> },
    { label: "Help", href: "#help", icon: <FiHelpCircle /> },
  ];

  return (
    <div className={styles.adminLayout} data-theme={isDark ? "dark" : "light"}>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.isOpen : ""} ${isSidebarCollapsed ? styles.isCollapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Image src="/images/logo.png" alt="OTOBI" width={120} height={30} style={{ objectFit: 'contain' }} />
          </div>
          <button 
            className={styles.collapseBtn} 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FiMenu />
          </button>
          <button className={styles.closeBtn} onClick={() => setIsSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <div className={styles.navSection}>
          <p className={styles.sectionTitle}>Main</p>
          <nav className={styles.nav}>
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navText}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.navSection}>
          <p className={styles.sectionTitle}>Other</p>
          <nav className={styles.nav}>
            {otherNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={styles.navLink}
                onClick={(e) => e.preventDefault()}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className={styles.logoutBtn}
          >
            <FiLogOut className={styles.navIcon} />
            <span className={styles.navText}>Log out</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && <div className={styles.backdrop} onClick={() => setIsSidebarOpen(false)} />}

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.isCollapsedMain : ""}`}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuBtn} onClick={() => setIsSidebarOpen(true)}>
              <FiMenu />
            </button>
            <div className={styles.searchShell}>
              <FiSearch className={styles.searchIcon} />
              <input placeholder="Search" />
              <div className={styles.commandKey}>
                <FiCommand /> Space
              </div>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.themeToggles}>
              <button
                className={`${styles.iconBtn} ${isDark ? styles.activeIconBtn : ""}`}
                onClick={() => setIsDark(true)}
                title="Dark Mode"
              >
                <FiMoon />
              </button>
              <button
                className={`${styles.iconBtn} ${!isDark ? styles.activeIconBtn : ""}`}
                onClick={() => setIsDark(false)}
                title="Light Mode"
              >
                <FiSun />
              </button>
            </div>
            <button className={styles.notificationBtn}>
              <FiBell />
              <span className={styles.dot}></span>
            </button>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>
                {user.name.charAt(0)}
              </div>
              <div className={styles.userDetails}>
                <strong>{user.name}</strong>
                <span>@admin_otobi</span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.contentArea}>{children}</div>
      </main>
    </div>
  );
}

