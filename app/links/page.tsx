import React from 'react';
import Image from 'next/image';
import styles from './Links.module.css';
import { Metadata } from 'next';
import prisma from "../../lib/prisma";
import { FiInstagram, FiLink } from "react-icons/fi";
import { FaTiktok, FaWhatsapp } from "react-icons/fa";

export const metadata: Metadata = {
  title: 'Links | Otobi Premium Auto Detailing',
  description: 'Connect with Otobi on our official platforms and shop our premium auto detailing products.',
};

export const revalidate = 0;

const renderIcon = (type: string | null) => {
  switch (type) {
    case 'tokopedia':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <rect width="24" height="24" rx="6" fill="#42B549" />
          <path d="M7 10C7 8.89543 7.89543 8 9 8H15C16.1046 8 17 8.89543 17 10V15C17 16.1046 16.1046 17 15 17H9C7.89543 17 7 16.1046 7 15V10Z" fill="white" />
          <circle cx="10" cy="11" r="1" fill="#42B549" />
          <circle cx="14" cy="11" r="1" fill="#42B549" />
        </svg>
      );
    case 'shopee':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <rect width="24" height="24" rx="6" fill="#EE4D2D" />
          <path d="M8 9.5L9.5 7H14.5L16 9.5V15.5C16 16.3284 15.3284 17 14.5 17H9.5C8.67157 17 8 16.3284 8 15.5V9.5Z" fill="white" />
          <path d="M10 11C10 11.5523 10.8954 12 12 12C13.1046 12 14 11.5523 14 11" stroke="#EE4D2D" strokeLinecap="round" />
        </svg>
      );
    case 'instagram':
      return <FiInstagram size={24} color="#E1306C" />;
    case 'tiktok':
      return <FaTiktok size={24} color="#000000" />;
    case 'whatsapp':
      return <FaWhatsapp size={24} color="#25D366" />;
    default:
      return null;
  }
};

export default async function LinksPage() {
  const links = await prisma.linkItem.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        {/* Header Actions */}
        <header className={styles.header}>
          <button className={styles.iconButton} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <button className={styles.iconButton} aria-label="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
        </header>

        {/* Profile Section with Horizontal Logo */}
        <section className={styles.profileSection}>
          <div className={styles.logoContainer}>
            <Image
              src="/images/logo.png"
              alt="Otobi Auto Care"
              width={180}
              height={45}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 className={styles.username}>@otobiautocare</h1>
        </section>

        {/* Links List */}
        <div className={styles.linksList}>
          {links.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666' }}>No links configured yet.</p>
          )}
          {links.map((link) => {
            const iconElement = renderIcon(link.iconType);
            return (
              <a
                key={link.id}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : '_self'}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : ''}
                className={`${styles.linkCard} ${iconElement ? styles.hasIcon : ''}`}
              >
                {iconElement && (
                  <div className={styles.linkIcon}>
                    {iconElement}
                  </div>
                )}
                <span className={styles.linkText}>{link.title}</span>

                <div className={styles.linkAction}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
