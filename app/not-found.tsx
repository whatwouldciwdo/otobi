"use client";

import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import styles from './NotFound.module.css';
import { FiGrid, FiShoppingBag, FiMessageCircle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <>
      <Navbar forceScrolled={true} />
      
      <div className={styles.notFoundWrapper}>
        <div className={styles.container}>
          
          {/* Kiri: Dekorasi Angka 4 */}
          <div className={`${styles.sideDecoration} ${styles.leftDecoration}`}>
            <svg viewBox="0 0 200 600" className={styles.svg4}>
              {/* Garis Vertikal Kiri */}
              <path d="M 120 100 L 120 300" stroke="#123c4f" strokeWidth="60" strokeLinecap="round" fill="none" />
              {/* Garis Horizontal */}
              <path d="M 120 300 L 220 300" stroke="#123c4f" strokeWidth="60" strokeLinecap="round" fill="none" />
              {/* Garis Vertikal Kanan */}
              <path d="M 180 200 L 180 500" stroke="#123c4f" strokeWidth="60" strokeLinecap="round" fill="none" />
              
              {/* Panah (Arrow) mengarah ke atas-kanan */}
              <path d="M 50 450 L 130 370 M 60 370 L 130 370 L 130 440" stroke="#6cd4ff" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          
          {/* Tengah: Box Konten 404 */}
          <div className={styles.centerBox}>
            <h1 className={styles.title}>Oops... 404<br/>Halaman tidak ditemukan.</h1>
            <p className={styles.description}>
              Halaman yang kamu cari mungkin telah dipindahkan, diubah namanya, atau tidak lagi ada. Tapi jangan khawatir — semua yang kamu butuhkan masih ada di sini.
            </p>
            <p className={styles.subDescription}>
              Jelajahi menu utama kami di bawah ini atau kembali ke beranda untuk melanjutkan.
            </p>
            
            <div className={styles.linksContainer}>
              <Link href="/products" className={styles.linkCard}>
                <div className={styles.iconWrapper}><FiShoppingBag /></div>
                <div className={styles.linkText}>
                  <h3>Produk Kami</h3>
                  <p>Lihat rangkaian perawatan kendaraan premium kami</p>
                </div>
              </Link>
              
              <Link href="/about" className={styles.linkCard}>
                <div className={styles.iconWrapper}><FiGrid /></div>
                <div className={styles.linkText}>
                  <h3>Tentang Kami</h3>
                  <p>Kenali siapa kami dan apa yang mendorong OTOBI</p>
                </div>
              </Link>
              
              <Link href="/contact" className={styles.linkCard}>
                <div className={styles.iconWrapper}><FiMessageCircle /></div>
                <div className={styles.linkText}>
                  <h3>Hubungi Kami</h3>
                  <p>Butuh bantuan? Tim support kami siap membantu</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Kanan: Dekorasi Angka 4 */}
          <div className={`${styles.sideDecoration} ${styles.rightDecoration}`}>
            <svg viewBox="0 0 200 600" className={styles.svg4}>
              {/* Garis Vertikal Kiri */}
              <path d="M 40 100 L 40 300" stroke="#123c4f" strokeWidth="60" strokeLinecap="round" fill="none" />
              {/* Garis Horizontal */}
              <path d="M 40 300 L 220 300" stroke="#123c4f" strokeWidth="60" strokeLinecap="round" fill="none" />
              {/* Garis Vertikal Kanan */}
              <path d="M 140 100 L 140 500" stroke="#123c4f" strokeWidth="60" strokeLinecap="round" fill="none" />
              
              {/* Panah (Arrow) mengarah ke bawah-kiri (dalam lekukan) */}
              <path d="M 160 210 L 80 290 M 160 290 L 80 290 L 80 210" stroke="#6cd4ff" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              
              {/* Panah (Arrow) mengarah ke atas-kanan (di bawah) */}
              <path d="M 40 470 L 120 390 M 50 390 L 120 390 L 120 460" stroke="#6cd4ff" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
